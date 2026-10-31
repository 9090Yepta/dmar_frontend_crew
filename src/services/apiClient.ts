import type { ApiResult } from "../types/mechanic";

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/+$/,
  "",
);

const API_BASE_URL = import.meta.env.DEV ? "" : configuredApiBaseUrl;

export function apiAssetUrl(path: string | null | undefined) {
  if (!path) return "";
  return API_BASE_URL && path.startsWith("/") ? `${API_BASE_URL}${path}` : path;
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("X-DMAR-Portal", "mekanik");
  const url =
    API_BASE_URL && typeof input === "string" && input.startsWith("/")
      ? `${API_BASE_URL}${input}`
      : input;
  return fetch(url, { ...init, headers, credentials: "include" }).then(
    (response) => {
      const route = typeof input === "string" ? input : input.toString();
      if (
        response.status === 401 &&
        !route.includes("/auth/login") &&
        !route.includes("/auth/me")
      ) {
        window.dispatchEvent(new Event("dmar:unauthenticated"));
      }
      return response;
    },
  );
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await apiFetch(input, init);
  const payload = (await response.json()) as ApiResult<T>;
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error?.message ?? "Permintaan ke server gagal");
  }
  return payload.data;
}
