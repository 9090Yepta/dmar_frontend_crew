import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ReportForm } from '../../../features/reports/ReportForm';
import { useMechanicWorkspaceContext } from '../../../contexts/MechanicWorkspaceContext';
import { getMechanicReport } from '../../../services/reportService';
import { toReportForm } from '../../../utils/reportForm';
import { showError } from '../../../utils/notifications';

function EditReportPage() {
  const { id } = Route.useParams();
  const reportId = Number(id);
  const workspace = useMechanicWorkspaceContext();
  const navigate = useNavigate();
  const [preparedId, setPreparedId] = useState<number | null>(null);
  const shownLoadError = useRef('');
  const shownRouteError = useRef('');
  const query = useQuery({
    queryKey: ['mechanic-report-detail', workspace.user?.id, reportId],
    enabled: Number.isInteger(reportId) && reportId > 0 && workspace.user !== null,
    queryFn: () => getMechanicReport(reportId),
  });

  useEffect(() => {
    if (query.data) {
      workspace.setForm(toReportForm(query.data));
      setPreparedId(query.data.id);
    }
  }, [query.data, workspace.setForm]);

  useEffect(() => {
    if ((!Number.isInteger(reportId) || reportId < 1) && shownRouteError.current !== 'invalid-id') {
      shownRouteError.current = 'invalid-id';
      void showError('Nomor laporan tidak valid', 'Alamat halaman harus berisi nomor laporan yang benar.');
    }
    if (query.error && shownLoadError.current !== query.error.message) {
      shownLoadError.current = query.error.message;
      void showError('Laporan gagal dimuat', `${query.error.message} Periksa koneksi lalu coba lagi.`);
    }
  }, [query.error]);

  useEffect(() => {
    if (Number.isInteger(reportId) && reportId > 0 && query.data && Number(query.data.approved) !== 0) {
      void showError('Laporan tidak dapat diedit', 'Laporan yang sudah disetujui tidak dapat diubah.');
    }
  }, [query.data, reportId]);

  async function submitEdit(event: SubmitEvent<HTMLFormElement>) {
    const result = await workspace.submitReport(event, reportId);
    if (result.ok) void navigate({ to: '/reports/history' });
    return result;
  }

  function cancelEdit() {
    workspace.cancelEdit();
    void navigate({ to: '/reports/history' });
  }

  if (!Number.isInteger(reportId) || reportId < 1) {
    return <div className="alert alert-error">Nomor laporan pada alamat halaman tidak valid.</div>;
  }
  if (query.isError) {
    return <div className="alert alert-error">Laporan tidak dapat dimuat. Periksa pesan pada notifikasi.</div>;
  }
  if (query.isPending || !query.data || preparedId !== reportId) {
    return (
      <div className="flex items-center gap-3 py-8" role="status">
        <span className="loading loading-spinner loading-sm" aria-hidden="true" />
        <span className="text-sm">Memuat laporan…</span>
      </div>
    );
  }
  if (Number(query.data.approved) !== 0) {
    return <div className="alert alert-warning">Laporan yang sudah disetujui tidak dapat diedit.</div>;
  }

  return (
    <ReportForm
      catalogs={workspace.catalogs}
      catalogsError={workspace.catalogsError}
      form={workspace.form}
      editId={reportId}
      busy={workspace.busy}
      onChange={workspace.setForm}
      onSubmit={submitEdit}
      onCancelEdit={cancelEdit}
    />
  );
}

export const Route = createFileRoute('/report/$id/edit')({
  component: EditReportPage,
});
