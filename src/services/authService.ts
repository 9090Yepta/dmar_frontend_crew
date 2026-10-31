import { apiFetch, requestJson } from "./apiClient";
import type { ApiResult, SessionPayload, User } from "../types/mechanic";

export async function getMechanicSession(
  signal: AbortSignal,
): Promise<{ user: User; csrfToken: string } | null> {
  const response = await apiFetch("/api/v1/auth/me", { signal });
  if (response.status === 401) return null;
  const payload = (await response.json()) as SessionPayload;
  if (!response.ok || !payload.data) throw new Error("API response is not OK");
  return payload.data;
}

export function loginMechanic(
  nrpp: string,
  password: string,
  rememberMe: boolean,
) {
  return requestJson<{ user: User; csrfToken: string }>("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ portal: "mekanik", nrpp, password, rememberMe }),
  }).then(async (login) => {
    const session = await getMechanicSession(new AbortController().signal);
    if (!session || session.user.id !== login.user.id) {
      throw new Error(
        "Login diterima, tetapi sesi tidak tersimpan. Periksa cookie sesi lalu coba lagi.",
      );
    }
    return session;
  });
}

export async function logoutMechanic(csrfToken: string): Promise<void> {
  const response = await apiFetch("/api/v1/auth/logout", {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
  });
  if (response.ok) return;
  const payload = (await response.json()) as ApiResult<unknown>;
  throw new Error(
    payload.error?.message ??
      "Logout gagal. Muat ulang halaman lalu coba lagi.",
  );
}

export function changeMechanicPassword(
  currentPassword: string,
  newPassword: string,
  csrfToken: string,
) {
  return requestJson<{ changed: boolean; csrfToken: string }>(
    "/api/v1/auth/password-change",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    },
  );
}

export function uploadMechanicProfileImage(file: File, csrfToken: string) {
  const body = new FormData();
  body.append("profileImage", file);
  return requestJson<{ profileImageUrl: string }>(
    "/api/v1/account/profile-image",
    {
      method: "POST",
      headers: { "X-CSRF-Token": csrfToken },
      body,
    },
  );
}
