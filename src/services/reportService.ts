import { requestJson } from "./apiClient";
import { toReportPayload } from "../utils/reportForm";
import type {
  Report,
  ReportFormValues,
  ReportSummary,
} from "../types/mechanic";

export function getMechanicReports(filters: {
  search: string;
  searchBy: "unit" | "activity";
  foremanId: string;
  status: string;
  offset: number;
  limit: number;
}) {
  const query = new URLSearchParams({
    ...filters,
    offset: String(filters.offset),
    limit: String(filters.limit),
  });
  return requestJson<{
    items: Report[];
    total: number;
    foremen: { id: number; name: string }[];
  }>(`/api/v1/reports?${query}`);
}

export function getMechanicReportSummary() {
  return requestJson<ReportSummary>("/api/v1/reports/summary");
}

export async function getMechanicReport(id: number) {
  const result = await requestJson<{ item: Report }>(`/api/v1/reports/${id}`);
  return result.item;
}

export function saveMechanicReport(
  form: ReportFormValues,
  reportId: number | null,
  csrfToken: string,
) {
  return requestJson<{ id: number; updated?: boolean }>(
    reportId === null ? "/api/v1/reports" : `/api/v1/reports/${reportId}`,
    {
      method: reportId === null ? "POST" : "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(toReportPayload(form)),
    },
  );
}

export function deleteMechanicReport(id: number, csrfToken: string) {
  return requestJson<{ deleted: boolean }>(`/api/v1/reports/${id}`, {
    method: "DELETE",
    headers: { "X-CSRF-Token": csrfToken },
  });
}
