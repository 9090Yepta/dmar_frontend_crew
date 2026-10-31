import {
  LuCalendarDays,
  LuCircleCheck,
  LuClipboardList,
  LuClock3,
} from "react-icons/lu";
import type { ReportSummary as ReportSummaryData } from "../../types/mechanic";

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function ReportSummary({
  summary,
  loading,
}: {
  summary?: ReportSummaryData;
  loading: boolean;
  name: string;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const dayMap = new Map((summary?.days ?? []).map((day) => [day.date, day]));
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(now);
  const cells: (number | null)[] = [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthlyTotal =
    summary?.days.reduce((sum, day) => sum + day.total, 0) ?? 0;
  const metrics = [
    {
      label: "Semua laporan",
      value: summary?.total ?? 0,
      note: "Laporan yang pernah dikirim",
      Icon: LuClipboardList,
      tone: "text-indigo-700",
      tile: "bg-indigo-100",
      glow: "from-indigo-500/10",
    },
    {
      label: "Menunggu persetujuan",
      value: summary?.pending ?? 0,
      note: "Menunggu pemeriksaan foreman",
      Icon: LuClock3,
      tone: "text-amber-700",
      tile: "bg-amber-100",
      glow: "from-amber-500/10",
    },
    {
      label: "Disetujui",
      value: summary?.approved ?? 0,
      note: "Laporan yang telah disetujui",
      Icon: LuCircleCheck,
      tone: "text-emerald-700",
      tile: "bg-emerald-100",
      glow: "from-emerald-500/10",
    },
  ];

  return (
    <section
      className="space-y-5 lg:space-y-6"
      aria-labelledby="mechanic-home-title"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value, note, Icon, tone, tile, glow }) => (
          <article
            key={label}
            className={`card card-border overflow-hidden border-base-300/70 bg-linear-to-br ${glow} via-base-100 to-base-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
          >
            <div className="card-body gap-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-base-content/60">
                    {label}
                  </p>
                  {loading && !summary ? (
                    <div className="skeleton mt-2 h-9 w-16" />
                  ) : (
                    <p
                      className={`mt-2 text-3xl font-bold tracking-tight ${tone}`}
                    >
                      {value}
                    </p>
                  )}
                </div>
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-2xl ${tile} ${tone}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </div>
              <p className="border-t border-base-300/60 pt-3 text-xs text-base-content/50">
                {note}
              </p>
            </div>
          </article>
        ))}
      </div>

      <section
        className="rounded-3xl border border-base-300/70 bg-base-100 p-4 shadow-sm sm:p-6"
        aria-label="Kalender laporan bulan ini"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <LuCalendarDays className="size-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold capitalize">{monthLabel}</h3>
              <p className="text-xs text-base-content/55 sm:text-sm">
                Tanggal laporan ditandai dengan jumlah aktivitas.
              </p>
            </div>
          </div>
          <span className="badge badge-lg border-0 bg-violet-100 font-semibold text-violet-800">
            {monthlyTotal} laporan bulan ini
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid">
          {[
            ["Sen", "Senin"],
            ["Sel", "Selasa"],
            ["Rab", "Rabu"],
            ["Kam", "Kamis"],
            ["Jum", "Jumat"],
            ["Sab", "Sabtu"],
            ["Min", "Minggu"],
          ].map(([shortName, fullName]) => (
            <div
              key={shortName}
              role="columnheader"
              aria-label={fullName}
              className="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-base-content/45 sm:text-xs"
            >
              <span className="sm:hidden">{shortName}</span>
              <span className="hidden sm:inline">{fullName}</span>
            </div>
          ))}
          {cells.map((day, index) => {
            const record = day
              ? dayMap.get(dateKey(year, month, day))
              : undefined;
            const isToday = day === today;
            return (
              <div
                key={`${day ?? "empty"}-${index}`}
                role="gridcell"
                aria-label={
                  day
                    ? `${day} ${monthLabel}${record ? `, ${record.total} laporan` : ""}`
                    : undefined
                }
                className={`flex min-h-14 flex-col items-center justify-start rounded-xl border p-1.5 transition-colors sm:min-h-20 sm:rounded-2xl sm:p-2 ${
                  !day
                    ? "border-transparent bg-transparent"
                    : isToday
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                      : record
                        ? "border-emerald-200 bg-emerald-50/80"
                        : "border-base-300/70 bg-base-100 hover:bg-base-200/50"
                }`}
              >
                {day && (
                  <>
                    <span
                      className={`grid size-6 place-items-center rounded-full text-xs font-semibold sm:size-7 sm:text-sm ${isToday ? "bg-primary text-primary-content" : "text-base-content/75"}`}
                    >
                      {day}
                    </span>
                    {record && (
                      <span className="mt-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white sm:px-2 sm:text-[10px]">
                        {record.total}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-base-300/70 pt-4 text-xs text-base-content/55">
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" /> Ada laporan
          </span>
          {loading && (
            <span className="inline-flex items-center gap-2">
              <span className="loading loading-spinner loading-xs" />{" "}
              Memperbarui ringkasan
            </span>
          )}
        </div>
      </section>
    </section>
  );
}
