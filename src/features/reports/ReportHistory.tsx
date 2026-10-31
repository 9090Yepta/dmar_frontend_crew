import { useEffect, useMemo, useRef, useState } from "react";
import {
  LuCalendarDays,
  LuCircleAlert,
  LuCircleCheck,
  LuClock3,
  LuFileSearch,
  LuFileText,
  LuPencil,
  LuSearch,
  LuTruck,
  LuUserRound,
  LuWrench,
  LuTrash2,
} from "react-icons/lu";
import { DataTable, dataTableFeatures } from "../../components/ui/DataTable";
import type { Report } from "../../types/mechanic";
import type { ColumnDef } from "@tanstack/react-table";

function formatHistoryDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

type ReportHistoryProps = {
  reports: Report[];
  search: string;
  foremen: { id: number; name: string }[];
  foremanId: string;
  status: string;
  loading: boolean;
  total: number;
  offset: number;
  limit: number;
  onSearchChange: (value: string) => void;
  onSearch: (searchBy: "unit" | "activity") => void;
  onForemanChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onOffsetChange: (offset: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (report: Report) => void;
  onDelete: (id: number) => void;
};

export function ReportHistory({
  reports,
  search,
  foremen,
  foremanId,
  status,
  loading,
  total,
  offset,
  limit,
  onSearchChange,
  onSearch,
  onForemanChange,
  onStatusChange,
  onOffsetChange,
  onLimitChange,
  onEdit,
  onDelete,
}: ReportHistoryProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchBy, setSearchBy] = useState<"unit" | "activity">("unit");
  const detailDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selectedReport && detailDialog.current && !detailDialog.current.open) {
      detailDialog.current.showModal();
    }
  }, [selectedReport]);

  const columns = useMemo<ColumnDef<typeof dataTableFeatures, Report>[]>(
    () => [
      {
        id: "rowNumber",
        header: "No.",
        cell: ({ row }) => offset + row.index + 1,
      },
      {
        accessorKey: "date",
        header: "Tanggal",
        cell: ({ getValue }) => formatHistoryDate(getValue<string>()),
      },
      {
        accessorKey: "unitCode",
        header: "Unit",
        cell: ({ row }) => (
          <>
            <strong>{row.original.unitCode}</strong>
            <span className="block text-xs opacity-60">
              {row.original.model}
            </span>
          </>
        ),
      },
      {
        accessorKey: "activities",
        header: "Aktivitas",
        cell: ({ row }) => {
          const activities = row.original.activities?.length
            ? row.original.activities
            : row.original.activity
              ? [row.original.activity]
              : [];
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className="block max-w-56 truncate"
                title={activities[0] || undefined}
              >
                {activities.length ? `1. ${activities[0]}` : "—"}
              </span>
              {activities.length > 1 && (
                <span
                  className="badge badge-outline badge-info badge-xs shrink-0"
                  title={`${activities.length - 1} aktivitas lainnya tersedia pada detail laporan`}
                >
                  {activities.length - 1} more..
                </span>
              )}
            </div>
          );
        },
      },
      { accessorKey: "foremanName", header: "Foreman" },
      {
        accessorKey: "approved",
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={`status-pill ${Number(getValue()) ? "approved" : "pending"}`}
          >
            {Number(getValue()) ? "Disetujui" : "Menunggu"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="report-actions">
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              aria-label={`Detail laporan ${row.original.id}`}
              onClick={() => setSelectedReport(row.original)}
            >
              <LuFileSearch className="size-4" />
            </button>
            {!Number(row.original.approved) && (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  aria-label={`Edit laporan ${row.original.id}`}
                  onClick={() => onEdit(row.original)}
                >
                  <LuPencil className="size-4" />
                </button>
                <button
                  className="btn btn-ghost btn-sm text-error"
                  type="button"
                  aria-label={`Hapus laporan ${row.original.id}`}
                  onClick={() => onDelete(row.original.id)}
                >
                  <LuTrash2 className="size-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [offset, onDelete, onEdit, setSelectedReport],
  );

  const pageCount = Math.ceil(total / limit);
  return (
    <section className="grid gap-4" aria-labelledby="report-history-title">
      <header className="grid gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Riwayat
          </p>
          <h2 id="report-history-title" className="mt-1 text-xl font-bold">
            Semua laporan saya
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-base-content/60">
            Cari dan kelola laporan pekerjaan yang pernah dikirim.
          </p>
        </div>
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.65fr)_minmax(10rem,0.65fr)] sm:items-end">
          <div className="form-control col-span-2 sm:col-span-1">
            <span className="label-text mb-1 text-xs font-semibold">
              Cari laporan
            </span>
            <div className="join join-horizontal w-full">
              <select
                aria-label="Cari berdasarkan"
                className="select select-bordered select-sm join-item w-24 shrink-0 px-2 sm:w-36 sm:px-4"
                value={searchBy}
                onChange={(event) =>
                  setSearchBy(event.target.value as "unit" | "activity")
                }
              >
                <option value="unit">Unit</option>
                <option value="activity">Aktivitas</option>
              </select>
              <input
                className="input input-bordered input-sm join-item min-w-0 flex-1 px-2 sm:px-4"
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSearch(searchBy);
                }}
                placeholder={
                  searchBy === "unit" ? "Kode / model unit" : "Aktivitas"
                }
              />
              <button
                type="button"
                className="btn btn-primary btn-sm join-item shrink-0 px-3 sm:px-4"
                aria-label="Cari laporan"
                onClick={() => onSearch(searchBy)}
              >
                <LuSearch className="size-4" />
                <span className="sr-only">Cari</span>
              </button>
            </div>
          </div>
          <label className="form-control">
            <span className="label-text mb-1 hidden text-xs font-semibold sm:block">
              Foreman
            </span>
            <select
              aria-label="Filter foreman"
              className="select select-bordered select-sm min-w-0 w-full px-2 sm:px-4"
              value={foremanId}
              onChange={(event) => onForemanChange(event.target.value)}
            >
              <option value="">Semua foreman</option>
              {foremen.map((foreman) => (
                <option key={foreman.id} value={foreman.id}>
                  {foreman.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label-text mb-1 hidden text-xs font-semibold sm:block">
              Status
            </span>
            <select
              aria-label="Filter status"
              className="select select-bordered select-sm min-w-0 w-full px-2 sm:px-4"
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
            >
              <option value="">Semua status</option>
              <option value="pending">Menunggu persetujuan</option>
              <option value="approved">Disetujui</option>
            </select>
          </label>
        </div>
      </header>
      <DataTable
        data={reports}
        columns={columns}
        loading={loading}
        emptyMessage="Laporan tidak ditemukan!"
        pageIndex={Math.floor(offset / limit)}
        pageSize={limit}
        rowCount={total}
        onPaginationChange={(pageIndex, pageSize) => {
          if (pageSize !== limit) onLimitChange(pageSize);
          onOffsetChange(pageIndex * pageSize);
        }}
      />
      <dialog
        ref={detailDialog}
        className="modal"
        onClose={() => setSelectedReport(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget)
            detailDialog.current?.close();
        }}
      >
        {selectedReport && (
          <div className="modal-box max-h-[90dvh] max-w-3xl overflow-y-auto rounded-3xl border border-emerald-100 bg-base-100 p-0 shadow-2xl">
            <header className="relative overflow-hidden rounded-t-3xl border-b border-emerald-100 bg-linear-to-br from-emerald-50 via-base-100 to-teal-50 p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-emerald-200/30 blur-2xl" />
              <form method="dialog" className="absolute right-4 top-4 z-10">
                <button
                  className="btn btn-circle btn-ghost btn-sm"
                  aria-label="Tutup detail"
                >
                  ✕
                </button>
              </form>
              <div className="relative flex flex-wrap items-start justify-between gap-4 pr-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Ringkasan pekerjaan
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-base-content">
                    Laporan #{selectedReport.id}
                  </h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    Detail laporan mekanik
                  </p>
                </div>
                <span
                  className={`badge badge-lg gap-1.5 border-0 ${Number(selectedReport.approved) ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                >
                  {Number(selectedReport.approved) ? (
                    <LuCircleCheck className="size-4" />
                  ) : (
                    <LuCircleAlert className="size-4" />
                  )}
                  {Number(selectedReport.approved) ? "Disetujui" : "Menunggu persetujuan"}
                </span>
              </div>
              <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <LuCalendarDays className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Tanggal</p>
                    <p className="truncate text-sm font-semibold">{formatHistoryDate(selectedReport.date)}</p>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-100 text-teal-700">
                    <LuUserRound className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Foreman</p>
                    <p className="truncate text-sm font-semibold">{selectedReport.foremanName || "—"}</p>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime-100 text-lime-700">
                    <LuTruck className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Unit</p>
                    <p className="truncate text-sm font-semibold">{selectedReport.unitCode || "Tanpa unit"}</p>
                    <p className="truncate text-xs text-base-content/55">{selectedReport.model || "—"}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid gap-4 p-5 sm:p-7">
              <section className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                    <LuClock3 className="size-5" />
                  </span>
                  <h4 className="font-bold">Waktu & kondisi unit</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Mulai - selesai", `${selectedReport.start?.slice(0, 5) || "—"} - ${selectedReport.finish?.slice(0, 5) || "—"}`],
                    ["Hours meter", selectedReport.hm || "—"],
                    ["Status unit", ["None", "Ready", "Continue"][Number(selectedReport.unitStatus)] ?? "—"],
                  ].map(([label, value], index) => (
                    <div key={label} className="rounded-xl bg-base-200/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">{label}</p>
                      <p className={`mt-1 text-sm font-semibold ${index === 2 ? "text-emerald-800" : ""}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-teal-100 text-teal-700">
                    <LuWrench className="size-5" />
                  </span>
                  <h4 className="font-bold">Detail pekerjaan</h4>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-base-200/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Problem</p>
                    <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm">{selectedReport.problem || "—"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-base-200/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Code Job</p>
                      <p className="mt-1 text-sm font-semibold">{selectedReport.codeJob || "—"}</p>
                    </div>
                    <div className="rounded-xl bg-base-200/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Component</p>
                      <p className="mt-1 text-sm font-semibold">{selectedReport.component || "—"}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-lime-100 text-lime-700">
                    <LuFileText className="size-5" />
                  </span>
                  <h4 className="font-bold">Aktivitas & catatan</h4>
                </div>
                {selectedReport.activities?.length ? (
                  <ol className="grid list-inside list-decimal gap-2 rounded-xl bg-base-200/60 p-4 text-sm">
                    {selectedReport.activities.map((activity, index) => (
                      <li key={`${index}-${activity}`} className="wrap-break-word">{activity}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-xl bg-base-200/60 p-4 whitespace-pre-wrap wrap-break-word text-sm">
                    {selectedReport.activity || "Belum ada aktivitas."}
                  </p>
                )}
                <div className="mt-3 rounded-xl bg-base-200/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">Remark</p>
                  <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm">{selectedReport.remark || "—"}</p>
                </div>
              </section>

              <div className="flex justify-end">
                <form method="dialog">
                  <button className="btn btn-outline rounded-xl px-6">Tutup</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </dialog>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 p-3">
        <p className="text-sm text-base-content/60">
          Hasil: <strong className="text-base-content">{total}</strong> laporan
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            Baris
            <select
              className="select select-bordered select-sm"
              value={limit}
              aria-label="Jumlah baris per halaman"
              onChange={(event) => {
                onLimitChange(Number(event.target.value));
                onOffsetChange(0);
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <div className="join">
            <button
              type="button"
              className="btn btn-sm join-item"
              disabled={offset === 0}
              onClick={() => onOffsetChange(Math.max(0, offset - limit))}
            >
              Prev
            </button>
            <span className="join-item inline-flex min-w-28 items-center justify-center border border-base-300 bg-base-100 px-3 text-sm text-base-content/70">
              Halaman {total ? Math.floor(offset / limit) + 1 : 0} / {pageCount}
            </span>
            <button
              type="button"
              className="btn btn-sm join-item"
              disabled={offset + limit >= total}
              onClick={() => onOffsetChange(offset + limit)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
