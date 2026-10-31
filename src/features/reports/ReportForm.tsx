import {
  LuClock3,
  LuFilePlus2,
  LuPlus,
  LuTrash2,
  LuTruck,
  LuWrench,
} from "react-icons/lu";
import { GiMineTruck } from "react-icons/gi";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AutoComplete,
  Badge,
  ConfigProvider,
  DatePicker,
  Input,
  Select,
} from "antd";
import idID from "antd/locale/id_ID";
import dayjs from "dayjs";
import { searchMechanicUnits } from "../../services/catalogService";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { showError, showSuccess } from "../../utils/notifications";
import { apiAssetUrl } from "../../services/apiClient";
import type {
  Catalogs,
  ReportFormValues,
  ReportSubmitResult,
} from "../../types/mechanic";

const reportPickerLocale: typeof idID = {
  ...idID,
  DatePicker: {
    ...idID.DatePicker!,
    lang: { ...idID.DatePicker!.lang, now: "Now", ok: "OK" },
  },
};

function ForemanOptionAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
      {imageUrl && !imageFailed ? (
        <img
          src={apiAssetUrl(imageUrl)}
          alt=""
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

function shiftMinute(shift: "day" | "night", time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  const clockMinute = Number(hour) * 60 + Number(minute);
  return shift === "day"
    ? clockMinute
    : clockMinute >= 18 * 60
      ? clockMinute - 18 * 60
      : clockMinute + 6 * 60;
}

function unitInitials(unit: Catalogs["units"][number]) {
  return (
    unit.model
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || unit.unitCode.slice(0, 2)
  );
}

function disabledShiftTimes(
  shift: "day" | "night",
  field: "start" | "finish",
  startValue: string,
) {
  const shiftStart = shift === "day" ? 6 * 60 : 0;
  const shiftEnd = shift === "day" ? 18 * 60 : 12 * 60;
  const minimum =
    field === "finish" && startValue
      ? Math.max(shiftStart, shiftMinute(shift, startValue) + 1)
      : shiftStart;
  const maximum = field === "start" ? shiftEnd - 1 : shiftEnd;
  const isEnabled = (hour: number, minute: number) => {
    const value = shiftMinute(
      shift,
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    );
    return value >= minimum && value <= maximum;
  };

  return {
    disabledHours: () =>
      Array.from({ length: 24 }, (_, hour) => hour).filter(
        (hour) =>
          !Array.from({ length: 60 }, (_, minute) => minute).some((minute) =>
            isEnabled(hour, minute),
          ),
      ),
    disabledMinutes: (hour: number) =>
      Array.from({ length: 60 }, (_, minute) => minute).filter(
        (minute) => !isEnabled(hour, minute),
      ),
  };
}

function TimePickerField({
  label,
  value,
  shift,
  field,
  startValue,
  onChange,
}: {
  label: string;
  value: string;
  shift: "day" | "night";
  field: "start" | "finish";
  startValue: string;
  onChange: (value: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(0);
  const [draftMinute, setDraftMinute] = useState(0);
  const restrictions = disabledShiftTimes(shift, field, startValue);
  const disabledHours = new Set(restrictions.disabledHours());
  const availableHours = Array.from({ length: 24 }, (_, hour) => hour)
    .filter((hour) => !disabledHours.has(hour))
    .sort(
      (left, right) =>
        shiftMinute(shift, `${String(left).padStart(2, "0")}:00`) -
        shiftMinute(shift, `${String(right).padStart(2, "0")}:00`),
    );
  const disabledMinutes = new Set(restrictions.disabledMinutes(draftHour));
  const availableMinutes = Array.from({ length: 60 }, (_, minute) => minute).filter(
    (minute) => !disabledMinutes.has(minute),
  );

  useEffect(() => {
    if (!isOpen) return;
    selectedHourRef.current?.scrollIntoView({ block: "center" });
    selectedMinuteRef.current?.scrollIntoView({ block: "center" });
  }, [isOpen, draftHour, draftMinute]);

  function openPicker() {
    const [rawHour, rawMinute] = value.split(":");
    const currentHour = Number(rawHour);
    const currentMinute = Number(rawMinute);
    const hour = availableHours.includes(currentHour)
      ? currentHour
      : availableHours[0] ?? 0;
    const disabledForHour = new Set(restrictions.disabledMinutes(hour));
    const minutes = Array.from({ length: 60 }, (_, minute) => minute).filter(
      (minute) => !disabledForHour.has(minute),
    );
    setDraftHour(hour);
    setDraftMinute(minutes.includes(currentMinute) ? currentMinute : minutes[0] ?? 0);
    setIsOpen(true);
    dialogRef.current?.showModal();
  }

  function selectHour(hour: number) {
    setDraftHour(hour);
    const disabledForHour = new Set(restrictions.disabledMinutes(hour));
    if (disabledForHour.has(draftMinute)) {
      const nextMinute = Array.from({ length: 60 }, (_, minute) => minute).find(
        (minute) => !disabledForHour.has(minute),
      );
      setDraftMinute(nextMinute ?? 0);
    }
  }

  function closePicker() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        className="input input-bordered input-sm flex w-full items-center justify-between text-left text-sm font-normal"
        type="button"
        aria-label={`${label}: ${value || "Pilih waktu"}`}
        aria-haspopup="dialog"
        aria-required="true"
        onClick={openPicker}
      >
        <span className={value ? "text-base-content" : "text-base-content/45"}>
          {value || "Pilih waktu"}
        </span>
        <LuClock3 className="size-4 text-base-content/50" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby={`time-picker-${field}-title`}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePicker();
        }}
      >
        <div className="modal-box max-h-[90dvh] max-w-sm overflow-y-auto rounded-3xl p-5 sm:p-6">
          <div className="relative text-center">
            <h3 id={`time-picker-${field}-title`} className="text-lg font-bold">
              Pilih Waktu {label}
            </h3>
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-sm absolute right-0 top-0"
              aria-label="Tutup pemilih waktu"
              onClick={closePicker}
            >
              ✕
            </button>
          </div>
          <p className="my-4 text-center text-4xl font-bold tabular-nums">
            {String(draftHour).padStart(2, "0")}:{String(draftMinute).padStart(2, "0")}
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <p className="mb-2 text-center text-sm font-medium text-base-content/65">Jam</p>
              <div className="h-56 snap-y snap-mandatory overflow-y-auto rounded-3xl border border-base-300 bg-base-200/50 p-2">
                {availableHours.map((hour) => (
                  <button
                    key={hour}
                    ref={hour === draftHour ? selectedHourRef : null}
                    type="button"
                    className={`mb-1 flex min-h-11 w-full snap-center items-center justify-center rounded-2xl text-lg tabular-nums transition-colors ${hour === draftHour ? "bg-neutral font-semibold text-neutral-content" : "hover:bg-base-300"}`}
                    aria-pressed={hour === draftHour}
                    onClick={() => selectHour(hour)}
                  >
                    {String(hour).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
            <span className="mt-7 text-2xl font-bold" aria-hidden="true">:</span>
            <div>
              <p className="mb-2 text-center text-sm font-medium text-base-content/65">Menit</p>
              <div className="h-56 snap-y snap-mandatory overflow-y-auto rounded-3xl border border-base-300 bg-base-200/50 p-2">
                {availableMinutes.map((minute) => (
                  <button
                    key={minute}
                    ref={minute === draftMinute ? selectedMinuteRef : null}
                    type="button"
                    className={`mb-1 flex min-h-11 w-full snap-center items-center justify-center rounded-2xl text-lg tabular-nums transition-colors ${minute === draftMinute ? "bg-neutral font-semibold text-neutral-content" : "hover:bg-base-300"}`}
                    aria-pressed={minute === draftMinute}
                    onClick={() => setDraftMinute(minute)}
                  >
                    {String(minute).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <button
              type="button"
              className="btn btn-neutral w-full rounded-full"
              onClick={() => {
                onChange(`${String(draftHour).padStart(2, "0")}:${String(draftMinute).padStart(2, "0")}`);
                closePicker();
              }}
            >
              Setel
            </button>
            <button type="button" className="btn btn-outline w-full rounded-full" onClick={closePicker}>
              Batal
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function validateReportForm(form: ReportFormValues, unitSearchValue: string) {
  if (!form.foremanId) return "Pilih foreman penanggung jawab terlebih dahulu.";
  if (!form.date || !dayjs(form.date).isValid())
    return "Tanggal laporan wajib dipilih.";
  const reportDate = dayjs(form.date).startOf("day");
  if (
    reportDate.isBefore(dayjs().subtract(2, "day").startOf("day"), "day") ||
    reportDate.isAfter(dayjs(), "day")
  ) {
    return "Tanggal laporan hanya boleh dipilih dari tiga hari terakhir sampai hari ini.";
  }
  if (!form.codeJob) return "Pilih kode pekerjaan terlebih dahulu.";
  if (!form.component) return "Pilih component group terlebih dahulu.";
  if (!form.activities.some((activity) => activity.trim())) {
    return "Isi minimal satu aktivitas pekerjaan.";
  }
  const longActivityIndex = form.activities.findIndex(
    (activity) => activity.length > 250,
  );
  if (longActivityIndex >= 0)
    return `Aktivitas ${longActivityIndex + 1} terlalu panjang. Batasi maksimal 250 karakter.`;
  if (!form.start) return "Waktu mulai wajib dipilih.";
  if (!form.finish) return "Waktu selesai wajib dipilih.";
  if (unitSearchValue !== form.unitCode) {
    return "Pilih unit dari hasil pencarian atau kosongkan kolom kode unit.";
  }

  const shiftStart = form.shift === "day" ? 6 * 60 : 0;
  const shiftEnd = form.shift === "day" ? 18 * 60 : 12 * 60;
  const start = shiftMinute(form.shift, form.start);
  const finish = shiftMinute(form.shift, form.finish);
  if (start < shiftStart || start >= shiftEnd) {
    return "Waktu mulai tidak berada dalam rentang shift yang dipilih.";
  }
  if (finish <= start || finish > shiftEnd) {
    return "Waktu selesai harus setelah waktu mulai dan tetap dalam rentang shift.";
  }
  return null;
}

type ReportFormProps = {
  catalogs: Catalogs | null;
  catalogsError?: string;
  form: ReportFormValues;
  editId: number | null;
  busy: boolean;
  onChange: (form: ReportFormValues) => void;
  onSubmit: (
    event: SubmitEvent<HTMLFormElement>,
  ) => Promise<ReportSubmitResult> | ReportSubmitResult | void;
  onCancelEdit: () => void;
};

export function ReportForm({
  catalogs,
  catalogsError = "",
  form,
  editId,
  busy,
  onChange,
  onSubmit,
  onCancelEdit,
}: ReportFormProps) {
  const [unitSearchValue, setUnitSearchValue] = useState(form.unitCode);
  const [debouncedUnitCode, setDebouncedUnitCode] = useState("");
  const shownCatalogError = useRef("");
  useEffect(() => {
    if (catalogsError && shownCatalogError.current !== catalogsError) {
      shownCatalogError.current = catalogsError;
      void showError(
        "Pilihan formulir gagal dimuat",
        `${catalogsError} Muat ulang halaman atau coba beberapa saat lagi.`,
      );
    }
  }, [catalogsError]);
  useEffect(() => {
    setUnitSearchValue(form.unitCode);
  }, [form.unitCode]);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedUnitCode(unitSearchValue.trim()),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [unitSearchValue]);
  const normalizedUnitSearch = unitSearchValue.trim();
  const unitSearchQuery = useQuery({
    queryKey: ["mechanic-unit-options", debouncedUnitCode],
    enabled: debouncedUnitCode.length > 0,
    queryFn: ({ signal }) => searchMechanicUnits(debouncedUnitCode, signal),
    staleTime: 30_000,
  });
  const shownUnitError = useRef("");
  useEffect(() => {
    if (
      unitSearchQuery.error &&
      debouncedUnitCode &&
      shownUnitError.current !== debouncedUnitCode
    ) {
      shownUnitError.current = debouncedUnitCode;
      void showError(
        "Pencarian unit gagal",
        unitSearchQuery.error.message ||
          "Unit belum dapat dicari. Silakan coba lagi.",
      );
    }
  }, [debouncedUnitCode, unitSearchQuery.error]);
  const unitLookupPending =
    normalizedUnitSearch.length > 0 &&
    (normalizedUnitSearch !== debouncedUnitCode || unitSearchQuery.isFetching);
  const availableUnits =
    debouncedUnitCode && !unitLookupPending
      ? (unitSearchQuery.data?.units ?? [])
      : [];
  const chosenUnit = form.unitCode
    ? [...(catalogs?.units ?? []), ...(unitSearchQuery.data?.units ?? [])].find(
        (unit) => unit.unitCode === form.unitCode,
      )
    : undefined;
  const chosenUnitInitials = chosenUnit ? unitInitials(chosenUnit) : "";
  const chosenForeman = catalogs?.foremen.find(
    (person) => String(person.id) === form.foremanId,
  );
  const foremanInitials = chosenForeman?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const update = <K extends keyof ReportFormValues>(
    key: K,
    value: ReportFormValues[K],
  ) => onChange({ ...form, [key]: value });
  const foremanOptions =
    catalogs?.foremen.map((person) => ({
      value: String(person.id),
      label: person.name,
      name: person.name,
      profileImageUrl: person.profileImageUrl,
    })) ?? [];
  const unitOptions =
    availableUnits.map((unit) => ({
      value: unit.unitCode,
      model: unit.model,
      label: (
        <div className="flex min-h-12 items-center gap-3 py-1">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-box bg-info/10 text-info">
            {unit.imageUrl ? (
              <img
                src={apiAssetUrl(unit.imageUrl)}
                alt=""
                className="size-full object-contain"
              />
            ) : (
              <span className="text-xs font-bold">{unitInitials(unit)}</span>
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-mono font-semibold">
              {unit.unitCode}
            </span>
            <span className="block truncate text-xs text-base-content/60">
              {unit.model}
            </span>
          </span>
        </div>
      ),
    })) ?? [];

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateReportForm(form, unitSearchValue);
    if (validationError) {
      await showError("Periksa formulir laporan", validationError);
      return;
    }

    try {
      const result = await onSubmit(event);
      if (result && !result.ok) {
        await showError(
          "Laporan gagal disimpan",
          result.message || "Periksa kembali data laporan lalu coba lagi.",
        );
      } else if (result?.ok) {
        await showSuccess(
          editId === null
            ? "Laporan berhasil dikirim"
            : "Laporan berhasil diperbarui",
        );
        if (editId === null) window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (caught) {
      await showError(
        "Laporan gagal disimpan",
        caught instanceof Error
          ? caught.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    }
  }

  return (
    <>
      <SectionHeading
        className="mt-2! sm:mt-7!"
        eyebrow={editId === null ? "LAPORAN BARU" : `EDIT LAPORAN #${editId}`}
        title={
          <span className="flex items-center gap-2">
            {editId === null && <LuFilePlus2 className="size-5 text-success" />}
            {editId === null
              ? "Buat laporan pekerjaan"
              : "Perbarui laporan pekerjaan"}
          </span>
        }
      >
        {editId !== null && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onCancelEdit}
          >
            Batal edit
          </button>
        )}
      </SectionHeading>
      <ConfigProvider locale={reportPickerLocale}>
        <form
          className="grid gap-4 sm:gap-5"
          noValidate
          onSubmit={handleSubmit}
        >
          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-5 px-2 sm:p-6">
              <div className="flex items-start gap-3 border-b border-base-300 pb-4">
                <span className="rounded-box bg-primary/10 p-2.5 text-primary">
                  <LuTruck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="card-title text-base sm:text-lg">
                    Penanggung jawab & unit
                  </h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    Tentukan foreman, tanggal, dan unit yang dikerjakan.
                  </p>
                </div>
              </div>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_4rem] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_5rem]">
                <div className="form-control w-full min-w-0">
                  <span className="label pt-1">
                    <span className="label-text font-semibold">
                      Foreman/Penanggung jawab{" "}
                      <span className="text-error" aria-label="wajib diisi">
                        *
                      </span>
                    </span>
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Select
                      className="w-full min-w-0 text-sm"
                      size="middle"
                      showSearch={{
                        filterOption: (input, option) =>
                          String(option?.name ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase()),
                      }}
                      allowClear
                      placeholder="Pilih foreman"
                      options={foremanOptions}
                      value={form.foremanId || undefined}
                      onChange={(value) => update("foremanId", value ?? "")}
                      optionRender={(option) => {
                        const person =
                          option.data as (typeof foremanOptions)[number];
                        return (
                          <div className="flex min-h-10 items-center gap-3 py-1">
                            <ForemanOptionAvatar
                              name={person.name}
                              imageUrl={person.profileImageUrl}
                            />
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">
                                {person.name}
                              </span>
                              <span className="block truncate text-xs text-base-content/60">
                                Foreman
                              </span>
                            </span>
                          </div>
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="grid size-16 place-items-center rounded-box border border-base-300 bg-base-200/40 p-1 sm:size-20">
                  <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary sm:size-18">
                    {chosenForeman?.profileImageUrl ? (
                      <img
                        src={apiAssetUrl(chosenForeman.profileImageUrl)}
                        alt={`Foto ${chosenForeman.name}`}
                        className="size-full object-cover"
                      />
                    ) : (
                      foremanInitials || <span aria-hidden="true">?</span>
                    )}
                  </span>
                </div>
              </div>
              <fieldset className="form-control">
                <legend className="label py-1">
                  <span className="label-text font-semibold">Shift</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["day", "Day"],
                      ["night", "Night"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex min-h-8 cursor-pointer items-center gap-2 rounded-box border px-3 text-sm ${form.shift === value ? "border-primary bg-primary/10 text-primary" : "border-base-300 bg-base-100"}`}
                    >
                      <input
                        type="radio"
                        className="radio radio-primary radio-sm"
                        name="shift"
                        value={value}
                        checked={form.shift === value}
                        onChange={() =>
                          onChange({
                            ...form,
                            shift: value,
                            start: "",
                            finish: "",
                          })
                        }
                      />
                      <span className="font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
                <div className="form-control min-w-0">
                  <span className="label py-1">
                    <span className="label-text font-semibold">
                      Tanggal{" "}
                      <span className="text-error" aria-label="wajib diisi">
                        *
                      </span>
                    </span>
                  </span>
                  <DatePicker
                    className="w-full text-sm"
                    size="middle"
                    format="DD-MMM-YYYY"
                    value={form.date ? dayjs(form.date) : null}
                    onChange={(value) =>
                      update("date", value?.format("YYYY-MM-DD") ?? "")
                    }
                    disabledDate={(current) =>
                      current.isBefore(
                        dayjs().subtract(2, "day").startOf("day"),
                        "day",
                      ) || current.isAfter(dayjs(), "day")
                    }
                    inputReadOnly
                    required
                    aria-label="Tanggal laporan"
                  />
                </div>

                <div className="form-control min-w-0">
                  <span className="label py-1">
                    <span className="label-text font-semibold">
                      Hours meter
                    </span>
                  </span>
                  <input
                    className="input input-bordered input-sm w-full text-sm"
                    inputMode="decimal"
                    maxLength={10}
                    value={form.hm}
                    onChange={(event) => update("hm", event.target.value)}
                  />
                </div>

                <div className="flex items-end gap-3">
                  <div className="form-control min-w-0 flex-1">
                    <span className="label py-1">
                      <span className="label-text font-semibold">
                        Kode unit
                      </span>
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <AutoComplete
                        className="min-w-0 flex-1"
                        size="middle"
                        options={unitOptions}
                        value={unitSearchValue}
                        notFoundContent={
                          unitLookupPending ? (
                            <div
                              className="grid gap-2 p-2"
                              aria-label="Memuat hasil pencarian unit"
                            >
                              {[0, 1].map((item) => (
                                <div
                                  key={item}
                                  className="flex min-h-12 items-center gap-3"
                                >
                                  <span className="skeleton size-10 shrink-0 rounded-box" />
                                  <span className="grid flex-1 gap-2">
                                    <span className="skeleton h-3 w-2/5" />
                                    <span className="skeleton h-3 w-3/5" />
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : unitSearchValue ? (
                            "Unit tidak ditemukan"
                          ) : (
                            "Ketik nama atau kode unit"
                          )
                        }
                        showSearch={{
                          filterOption: (input, option) =>
                            String(option?.value ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase()) ||
                            String(option?.model ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase()),
                        }}
                        onChange={(value) => {
                          const search = value.toUpperCase();
                          setUnitSearchValue(search);
                          if (!search) update("unitCode", "");
                        }}
                        onSelect={(value) => {
                          const unitCode = String(value).toUpperCase();
                          setUnitSearchValue(unitCode);
                          update("unitCode", unitCode);
                        }}
                      >
                        <Input
                          className="input input-bordered input-sm w-full font-mono uppercase text-sm"
                          maxLength={50}
                          autoComplete="off"
                          placeholder="Ketik nama/kode unit"
                        />
                      </AutoComplete>
                    </div>
                  </div>
                  <div className="flex min-h-24 w-24 shrink-0 items-baseline-last justify-center sm:min-h-28 sm:w-28">
                    {unitLookupPending ? (
                      <div
                        className="grid size-24 place-items-center rounded-box border border-base-300 bg-base-200/40 sm:size-28"
                        role="status"
                        aria-label="Memuat preview unit"
                      >
                        <span className="skeleton size-20 rounded-box sm:size-24" />
                      </div>
                    ) : chosenUnit ? (
                      <Badge.Ribbon
                        color="red"
                        placement="start"
                        style={{ top: -4 }}
                        text={
                          <span className="block text-xs max-w-24 truncate">
                            {chosenUnit.model}
                          </span>
                        }
                      >
                        <div className="relative grid size-24 place-items-center overflow-hidden rounded-box border border-base-300 bg-base-200/40 sm:size-28">
                          <span
                            className={`grid size-full place-items-center ${chosenUnit.imageUrl ? "" : "bg-primary/10"} text-2xl font-bold text-primary`}
                          >
                            {chosenUnitInitials}
                          </span>
                          {chosenUnit.imageUrl && (
                            <img
                              src={apiAssetUrl(chosenUnit.imageUrl)}
                              alt={`${chosenUnit.unitCode} ${chosenUnit.model}`}
                              className="absolute inset-0 size-full object-contain"
                              onError={(event) => event.currentTarget.remove()}
                            />
                          )}
                        </div>
                      </Badge.Ribbon>
                    ) : (
                      <div className="grid size-24 place-items-center rounded-box border border-base-300 bg-base-200/40 sm:size-28">
                        <GiMineTruck
                          className="size-10 text-info"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-5 px-2 sm:p-6">
              <div className="flex items-start gap-3 border-b border-base-300 pb-4">
                <span className="rounded-box bg-secondary/10 p-2.5 text-secondary">
                  <LuWrench className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="card-title text-base sm:text-lg">
                    Detail pekerjaan
                  </h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    Jelaskan kendala dan catat setiap aktivitas pekerjaan.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control w-full">
                  <span className="label py-1">
                    <span className="label-text font-semibold">
                      Kode pekerjaan{" "}
                      <span className="text-error" aria-label="wajib diisi">
                        *
                      </span>
                    </span>
                  </span>
                  <select
                    className="select select-bordered select-sm w-full text-sm"
                    required
                    value={form.codeJob}
                    onChange={(event) => update("codeJob", event.target.value)}
                  >
                    {!catalogs?.jobCodes.some(
                      (code) => code.description === form.codeJob,
                    ) &&
                      form.codeJob && (
                        <option value={form.codeJob}>{form.codeJob}</option>
                      )}
                    <option value="">Pilih kode pekerjaan</option>
                    {catalogs?.jobCodes.map((code) => (
                      <option key={code.description} value={code.description}>
                        {code.description}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control w-full">
                  <span className="label py-1">
                    <span className="label-text font-semibold">
                      Component group{" "}
                      <span className="text-error" aria-label="wajib diisi">
                        *
                      </span>
                    </span>
                  </span>
                  <select
                    className="select select-bordered select-sm w-full text-sm"
                    required
                    value={form.component}
                    onChange={(event) =>
                      update("component", event.target.value)
                    }
                  >
                    {!catalogs?.components.includes(form.component) &&
                      form.component && (
                        <option value={form.component}>{form.component}</option>
                      )}
                    <option value="">Pilih component group</option>
                    {catalogs?.components.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control w-full sm:col-span-2">
                  <span className="label py-1">
                    <span className="label-text font-semibold">Problem</span>
                    <span className="label-text-alt text-base-content/50">
                      Maks. 350 karakter
                    </span>
                  </span>
                  <textarea
                    className="textarea textarea-bordered textarea-sm min-h-28 w-full resize-y text-sm"
                    maxLength={350}
                    placeholder="Jelaskan masalah atau kondisi unit…"
                    value={form.problem}
                    onChange={(event) => update("problem", event.target.value)}
                  />
                </label>

                <div className="grid gap-3 sm:col-span-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-semibold">
                        Activity progress{" "}
                        <span className="text-error" aria-label="wajib diisi">
                          *
                        </span>
                      </h4>
                      <p className="mt-1 text-xs text-base-content/55">
                        Pisahkan langkah pekerjaan menjadi beberapa aktivitas
                        jika diperlukan.
                      </p>
                    </div>
                  </div>
                  {form.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="rounded-box border border-base-300 bg-base-200/30 p-3 sm:p-4"
                    >
                      <label className="form-control w-full">
                        <span className="label py-1">
                          <span className="label-text font-semibold">
                            Aktivitas {index + 1}
                            {index === 0 && (
                              <span
                                className="ml-1 text-error"
                                aria-label="wajib diisi"
                              >
                                *
                              </span>
                            )}
                          </span>
                          <span className="label-text-alt text-base-content/50">
                            Maks. 250 karakter
                          </span>
                        </span>
                        <input
                          className="input input-bordered input-sm w-full bg-base-100 text-sm"
                          type="text"
                          required={index === 0}
                          maxLength={250}
                          placeholder="Contoh: Periksa tekanan oli dan kebocoran hose"
                          value={activity}
                          onChange={(event) =>
                            update(
                              "activities",
                              form.activities.map((item, itemIndex) =>
                                itemIndex === index ? event.target.value : item,
                              ),
                            )
                          }
                        />
                      </label>
                      {form.activities.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm mt-2 text-error"
                          onClick={() =>
                            update(
                              "activities",
                              form.activities.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            )
                          }
                        >
                          <LuTrash2 className="size-4" aria-hidden="true" />{" "}
                          Hapus aktivitas
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm w-full sm:w-auto sm:justify-self-start"
                    onClick={() =>
                      update("activities", [...form.activities, ""])
                    }
                  >
                    <LuPlus className="size-4" aria-hidden="true" /> Tambah
                    aktivitas
                  </button>
                </div>

                <fieldset className="form-control w-full sm:col-span-2">
                  <legend className="label py-1">
                    <span className="label-text font-semibold">
                      Status unit
                    </span>
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["0", "None"],
                      ["1", "Ready"],
                      ["2", "Continue"],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 px-2 text-sm`}
                      >
                        <input
                          type="radio"
                          className="radio radio-primary radio-sm"
                          name="unitStatus"
                          value={value}
                          checked={form.unitStatus === value}
                          onChange={(event) =>
                            update("unitStatus", event.target.value)
                          }
                        />
                        <span className="font-medium">{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          </section>

          <section className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-5 p-4 sm:p-6">
              <div className="flex items-start gap-3 border-b border-base-300 pb-4">
                <span className="rounded-box bg-accent/10 p-2.5 text-accent">
                  <LuClock3 className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="card-title text-base sm:text-lg">
                    Waktu kerja & catatan
                  </h3>
                  <p className="mt-1 text-sm text-base-content/60">
                    Isi waktu mulai dan selesai, lalu tambahkan catatan bila
                    ada.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control w-full">
                  <span className="label py-1">
                    <span className="label-text font-semibold">
                      Mulai{" "}
                      <span className="text-error" aria-label="wajib diisi">
                        *
                      </span>
                    </span>
                  </span>
                  <TimePickerField
                    label="Mulai"
                    value={form.start}
                    shift={form.shift}
                    field="start"
                    startValue=""
                    onChange={(start) => {
                      const finishIsAfterStart =
                        !start ||
                        !form.finish ||
                        shiftMinute(form.shift, form.finish) >
                          shiftMinute(form.shift, start);
                      onChange({
                        ...form,
                        start,
                        finish: finishIsAfterStart ? form.finish : "",
                      });
                    }}
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label py-1">
                    <span className="label-text font-semibold">
                      Selesai{" "}
                      <span className="text-error" aria-label="wajib diisi">
                        *
                      </span>
                    </span>
                  </span>
                  <TimePickerField
                    label="Selesai"
                    value={form.finish}
                    shift={form.shift}
                    field="finish"
                    startValue={form.start}
                    onChange={(finish) => update("finish", finish)}
                  />
                </label>
                <label className="form-control w-full sm:col-span-2">
                  <span className="label py-1">
                    <span className="label-text font-semibold">Remark</span>
                    <span className="label-text-alt text-base-content/50">
                      Maks. 5.000 karakter
                    </span>
                  </span>
                  <textarea
                    className="textarea textarea-bordered textarea-sm min-h-28 w-full resize-y text-sm"
                    maxLength={5000}
                    placeholder="Catatan tambahan…"
                    value={form.remark}
                    onChange={(event) => update("remark", event.target.value)}
                  />
                </label>
              </div>
            </div>
          </section>

          <div className="-mx-2 border-t border-base-300 bg-base-100 p-4 sm:mx-0 sm:rounded-box sm:border sm:shadow-none">
            <button
              className="btn btn-primary btn-sm w-full sm:ml-auto sm:flex sm:w-auto"
              type="submit"
              disabled={busy || !catalogs || unitSearchValue !== form.unitCode}
            >
              {busy ? (
                <>
                  <span
                    className="loading loading-spinner loading-sm"
                    aria-hidden="true"
                  />{" "}
                  Menyimpan…
                </>
              ) : editId === null ? (
                "Kirim laporan"
              ) : (
                "Simpan perubahan"
              )}
            </button>
          </div>
        </form>
      </ConfigProvider>
    </>
  );
}
