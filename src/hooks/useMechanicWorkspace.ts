import { useCallback, useEffect, useState, type SubmitEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMechanicCatalogs } from '../services/catalogService';
import { changeMechanicPassword, getMechanicSession, loginMechanic, logoutMechanic, uploadMechanicProfileImage } from '../services/authService';
import { deleteMechanicReport, getMechanicReports, getMechanicReportSummary, saveMechanicReport } from '../services/reportService';
import type { ReportFormValues, ReportSubmitResult, User } from '../types/mechanic';
import { createEmptyReportForm } from '../utils/reportForm';
import { confirmAction, showError, showSuccess } from '../utils/notifications';

export function useMechanicWorkspace() {
  const [api, setApi] = useState<'loading' | 'online' | 'offline'>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [nrpp, setNrpp] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [profileImageBusy, setProfileImageBusy] = useState(false);
  const [form, setForm] = useState<ReportFormValues>(createEmptyReportForm);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState({ value: '', by: 'unit' as 'unit' | 'activity' });
  const [reportForemanId, setReportForemanId] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [reportOffset, setReportOffset] = useState(0);
  const [reportLimit, setReportLimit] = useState(25);
  const [notice, setNotice] = useState('');

  const catalogsQuery = useQuery({
    queryKey: ['mechanic-catalogs', user?.id],
    enabled: user !== null,
    queryFn: getMechanicCatalogs,
  });
  const reportsQuery = useQuery({
    queryKey: ['mechanic-reports', user?.id, appliedSearch, reportForemanId, reportStatus, reportOffset, reportLimit],
    enabled: user !== null,
    queryFn: () => getMechanicReports({ search: appliedSearch.value, searchBy: appliedSearch.by, foremanId: reportForemanId, status: reportStatus, offset: reportOffset, limit: reportLimit }),
  });
  const summaryQuery = useQuery({
    queryKey: ['mechanic-report-summary', user?.id],
    enabled: user !== null,
    queryFn: getMechanicReportSummary,
  });
  useEffect(() => {
    const total = reportsQuery.data?.total ?? 0;
    if (reportOffset > 0 && reportOffset >= total) {
      setReportOffset(Math.max(0, Math.floor(Math.max(total - 1, 0) / reportLimit) * reportLimit));
    }
  }, [reportLimit, reportOffset, reportsQuery.data?.total]);
  const catalogs = catalogsQuery.data ?? null;
  const reports = reportsQuery.data?.items ?? [];

  const loadWorkspace = useCallback(async () => {
    await Promise.all([catalogsQuery.refetch(), reportsQuery.refetch(), summaryQuery.refetch()]);
  }, [catalogsQuery.refetch, reportsQuery.refetch, summaryQuery.refetch]);

  useEffect(() => {
    const controller = new AbortController();
    getMechanicSession(controller.signal)
      .then((session) => {
        setApi('online');
        if (session) {
          setUser(session.user);
          setCsrfToken(session.csrfToken);
        }
      })
      .catch((caught: unknown) => {
        if (!(caught instanceof DOMException && caught.name === 'AbortError')) setApi('offline');
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleUnauthenticated = () => {
      setUser(null);
      setCsrfToken('');
      setError('Sesi tidak valid atau telah berakhir. Silakan masuk kembali.');
      setNotice('');
    };
    window.addEventListener('dmar:unauthenticated', handleUnauthenticated);
    return () => window.removeEventListener('dmar:unauthenticated', handleUnauthenticated);
  }, []);

  useEffect(() => {
    if (reportsQuery.error) setError(reportsQuery.error.message);
    else if (summaryQuery.error) setError(summaryQuery.error.message);
  }, [reportsQuery.error, summaryQuery.error]);

  async function signIn(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await loginMechanic(nrpp, password, rememberMe);
      setUser(session.user);
      setCsrfToken(session.csrfToken);
      setPassword('');
      setApi('online');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Tidak dapat menghubungi server');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    try {
      await logoutMechanic(csrfToken);
      setUser(null);
      setCsrfToken('');
      setNotice('');
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Logout gagal. Muat ulang halaman lalu coba lagi.');
    }
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    setPasswordBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await changeMechanicPassword(currentPassword, newPassword, csrfToken);
      setCsrfToken(result.csrfToken);
      showSuccess('Password berhasil diubah');
      return true;
    } catch (caught) {
      showError('Password gagal diubah', caught instanceof Error ? caught.message : 'Coba lagi.');
      return false;
    } finally {
      setPasswordBusy(false);
    }
  }

  async function uploadProfileImage(file: File): Promise<{ ok: boolean; message?: string }> {
    setProfileImageBusy(true);
    try {
      const result = await uploadMechanicProfileImage(file, csrfToken);
      setUser((current) => current ? { ...current, profileImageUrl: result.profileImageUrl } : current);
      return { ok: true };
    } catch (caught) {
      return { ok: false, message: caught instanceof Error ? caught.message : 'Foto profil gagal disimpan. Silakan coba lagi.' };
    } finally {
      setProfileImageBusy(false);
    }
  }

  async function submitReport(event: SubmitEvent<HTMLFormElement>, reportId: number | null): Promise<ReportSubmitResult> {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await saveMechanicReport(form, reportId, csrfToken);
      const successMessage = reportId === null
        ? `Laporan #${result.id} berhasil dikirim untuk persetujuan.`
        : `Laporan #${reportId} berhasil diperbarui.`;
      setForm(createEmptyReportForm());
      await loadWorkspace();
      return { ok: true, message: successMessage };
    } catch (caught) {
      return {
        ok: false,
        message: caught instanceof Error ? caught.message : 'Tidak dapat menyimpan laporan. Periksa kembali data lalu coba lagi.',
      };
    } finally {
      setBusy(false);
    }
  }

  async function deleteReport(id: number) {
    if (!await confirmAction({
      title: 'Hapus laporan?',
      text: `Laporan #${id} akan dihapus dan tindakan ini tidak dapat dibatalkan.`,
      confirmButtonText: 'Hapus laporan',
    })) return;
    setError('');
    try {
      await deleteMechanicReport(id, csrfToken);
      showSuccess('Laporan berhasil dihapus');
      await loadWorkspace();
    } catch (caught) {
      showError('Laporan gagal dihapus', caught instanceof Error ? caught.message : 'Tidak dapat menghapus laporan');
    }
  }

  function cancelEdit() {
    setForm(createEmptyReportForm());
  }

  const startNewReport = useCallback(() => {
    setForm(createEmptyReportForm());
    setError('');
    setNotice('');
  }, []);

  function searchReports(searchBy: 'unit' | 'activity') {
    setAppliedSearch({ value: search.trim(), by: searchBy });
    setReportOffset(0);
  }

  function updateReportSearch(value: string) {
    setSearch(value);
  }

  function filterReportForeman(value: string) {
    setReportForemanId(value);
    setReportOffset(0);
  }

  function filterReportStatus(value: string) {
    setReportStatus(value);
    setReportOffset(0);
  }

  return {
    api, user, nrpp, password, rememberMe, error, busy, passwordBusy, profileImageBusy, form, search, notice, catalogs,
    csrfToken, uploadProfileImage,
    catalogsError: catalogsQuery.error instanceof Error ? catalogsQuery.error.message : '', reports,
    reportSummary: summaryQuery.data,
    reportTotal: reportsQuery.data?.total ?? 0,
    reportForemen: reportsQuery.data?.foremen ?? [],
    reportOffset,
    reportLimit,
    reportForemanId,
    reportStatus,
    setReportOffset,
    setReportLimit,
    reportsLoading: reportsQuery.isFetching,
    summaryLoading: summaryQuery.isFetching,
    setNrpp, setPassword, setRememberMe, setForm, updateReportSearch, searchReports, filterReportForeman, filterReportStatus,
    signIn, signOut, changePassword, submitReport, deleteReport, cancelEdit, startNewReport,
  };
}
