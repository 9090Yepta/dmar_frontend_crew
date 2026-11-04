import { useState, type SubmitEvent } from "react";
import { LuEye, LuEyeOff, LuLockKeyhole, LuUserRound } from "react-icons/lu";
import { FaHelmetSafety } from "react-icons/fa6";
import type { User } from "../../types/mechanic";
import { apiAssetUrl } from "../../services/apiClient";

type AccessCardProps = {
  user: User | null;
  nrpp: string;
  password: string;
  rememberMe: boolean;
  busy: boolean;
  onNrppChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onSignIn: (event: SubmitEvent<HTMLFormElement>) => void;
  onSignOut: () => void;
};

export function AccessCard({
  user,
  nrpp,
  password,
  rememberMe,
  busy,
  onNrppChange,
  onPasswordChange,
  onRememberMeChange,
  onSignIn,
  onSignOut,
}: AccessCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return (
      <section
        className="mt-0 flex flex-row items-center justify-between gap-2 rounded-2xl border border-[#e3e9e1] bg-white p-3 sm:mt-4 sm:gap-4 sm:p-5"
        aria-label="Akses mekanik"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="avatar shrink-0">
            <div className="size-10 overflow-hidden rounded-full bg-primary/10 text-primary ring-1 ring-base-300 sm:size-12">
              {user.profileImageUrl ? (
                <img
                  src={apiAssetUrl(user.profileImageUrl)}
                  alt={`Foto ${user.name}`}
                  className="object-cover"
                />
              ) : (
                <span className="grid size-full place-items-center text-sm font-bold">
                  {user.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="m-0 truncate font-inter text-lg font-bold">
              Halo, {user.name}
            </h2>
            <p className="mb-0 mt-1.5 truncate text-[13px] text-[#78847b]">
              {user.nrpp} · {user.position || "Mekanik"}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="h-9 shrink-0 rounded-[10px] bg-[#edf4e9] px-3 text-xs font-semibold text-[#355d41] transition hover:bg-[#dfeedd] sm:h-10 sm:px-4.5 sm:text-[13px]"
          onClick={onSignOut}
        >
          Keluar
        </button>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 text-[#17251e] shadow-[0_26px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl [box-shadow:0_26px_90px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.68)] [-webkit-backdrop-filter:blur(20px)_saturate(145%)] [backdrop-filter:blur(20px)_saturate(145%)]"
      aria-label="Akses mekanik"
    >
      <form
        className="grid gap-4.5 p-[clamp(26px,4vw,38px)] max-[650px]:gap-4 max-[650px]:px-5.75 max-[650px]:py-6.75 max-[380px]:px-4.75 max-[380px]:py-6"
        onSubmit={onSignIn}
      >
        <div className="mb-0.5">
          <header className="col-span-full flex items-center">
            <a
              className="flex items-center gap-3 text-white no-underline"
              href="/"
              aria-label="DMAR Mekanik"
            >
              <span className="grid size-11 place-items-center rounded-[14px] border border-white/25 bg-white text-gray-700 shadow-lg shadow-black/15 backdrop-blur-lg">
                <FaHelmetSafety
                  className="size-5.75 text-blue-500"
                  aria-hidden="true"
                />
              </span>
              <span className="grid gap-0.5">
                <small className="text-[9px] font-bold tracking-[.19em] text-gray-700">
                  WORKSPACE
                </small>
                <strong className="font-google-sans text-base font-bold text-[#1939ba]">
                  PORTAL DMAR-Mekanik
                </strong>
              </span>
            </a>
          </header>
          <p className="mt-4 font-google-sans text-[13px] leading-snug text-gray-600">
            Masuk untuk melanjutkan ke workspace Anda.
          </p>
        </div>

        <label className="grid gap-1.75 text-[11px] font-bold text-[#48584c]">
          <span>NRPP</span>
          <span className="group flex min-h-12 items-center gap-2.5 rounded-xl border border-white/80 bg-white/35 px-3.25 shadow-inner transition focus-within:border-[#719b6c] focus-within:bg-white/85 focus-within:shadow-[0_0_0_4px_rgba(106,151,101,0.13)]">
            <LuUserRound
              className="size-4.5 shrink-0 text-[#829185]"
              aria-hidden="true"
            />
            <input
              className="h-11 w-full min-w-0 bg-transparent text-[13px] font-medium text-[#1c2d21] outline-none placeholder:text-[#a0aaa1]"
              autoComplete="username"
              value={nrpp}
              onChange={(event) => onNrppChange(event.target.value)}
              placeholder="Masukkan NRPP"
              required
            />
          </span>
        </label>

        <div className="grid gap-1.75 text-[11px] font-bold text-gray-600">
          <label htmlFor="mechanic-password">Password</label>
          <span className="flex min-h-12 items-center gap-2.5 rounded-xl border border-white/80 bg-white/35 px-3.25 shadow-inner transition focus-within:border-[#719b6c] focus-within:bg-white/85 focus-within:shadow-[0_0_0_4px_rgba(106,151,101,0.13)]">
            <LuLockKeyhole
              className="size-4.5 shrink-0 text-[#829185]"
              aria-hidden="true"
            />
            <input
              id="mechanic-password"
              className="h-11 w-full min-w-0 bg-transparent text-[13px] font-medium text-[#1c2d21] outline-none placeholder:text-[#a0aaa1]"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Masukkan password"
              required
            />
            <button
              className="grid size-7.5 shrink-0 place-items-center rounded-lg bg-transparent text-[#738076] transition hover:bg-[#edf3eb] hover:text-[#315b3a]"
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <LuEyeOff className="size-4.5" aria-hidden="true" />
              ) : (
                <LuEye className="size-4.5" aria-hidden="true" />
              )}
            </button>
          </span>
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-[11px] font-semibold text-amber-100">
          <input
            className="size-4 cursor-pointer accent-[#2e6039] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d8252]"
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => onRememberMeChange(event.target.checked)}
          />
          Ingat saya selama 30 hari
        </label>

        <button
          className="mt-px flex min-h-12.25 items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-[#d0ce5e] to-[#ffda06] px-4.5 text-[13px] font-bold text-gray-700 shadow-[0_8px_18px_rgba(37,82,51,0.18)] transition hover:-translate-y-px hover:shadow-[0_11px_23px_rgba(37,82,51,0.25)] disabled:cursor-wait disabled:opacity-70"
          type="submit"
          disabled={busy}
        >
          {busy ? (
            <>
              <span
                className="loading loading-spinner loading-xs"
                aria-hidden="true"
              />
              Memeriksa akses…
            </>
          ) : (
            <>
              Masuk ke workspace{" "}
              <span className="text-lg leading-none" aria-hidden="true">
                →
              </span>
            </>
          )}
        </button>
      </form>
    </section>
  );
}
