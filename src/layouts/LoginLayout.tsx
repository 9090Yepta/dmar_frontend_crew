import { useState, type ReactNode } from "react";

type ApiState = "loading" | "online" | "offline";

export function LoginLayout({
  children,
}: {
  api: ApiState;
  children: ReactNode;
}) {
  const [isMobileLoginOpen, setIsMobileLoginOpen] = useState(false);

  return (
    <main className="relative flex min-h-svh overflow-hidden bg-[#142118] bg-[url('/img/bg-login-mekanik.webp')] bg-cover bg-position-[center_48%] max-md:bg-position-[20%_center] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/5 via-black/10 to-black/55"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-360 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-x-14 gap-y-6 px-[clamp(1.5rem,5vw,4.75rem)] py-7.5 md:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] md:grid-rows-[auto_minmax(0,1fr)_auto] md:gap-y-7">
        <header className="col-span-full flex items-center"></header>

        <section
          className="col-span-full w-full self-end md:col-span-1 md:col-start-2 md:row-start-2 md:self-center"
          aria-label="Login Mekanik"
        >
          <div
            id="mobile-login-form"
            className={isMobileLoginOpen ? "block" : "hidden md:block"}
          >
            {children}
            <p className="mt-3 text-center text-[10px] text-white/85 [text-shadow:0_1px_7px_rgba(0,0,0,0.4)]">
              Akses aman untuk pengguna terdaftar.
            </p>
          </div>
          <button
            className={`mx-auto mt-3 flex min-h-12 w-full max-w-80 items-center justify-center rounded-xl px-6 text-sm font-bold shadow-[0_8px_18px_rgba(37,82,51,0.25)] transition md:hidden ${isMobileLoginOpen ? "border border-white/60 bg-white/15 text-white backdrop-blur-md hover:bg-white/25" : "bg-linear-to-br from-[#d0ce5e] to-[#ffda06] text-gray-700 hover:-translate-y-px hover:shadow-[0_11px_23px_rgba(37,82,51,0.3)]"}`}
            type="button"
            aria-expanded={isMobileLoginOpen}
            aria-controls="mobile-login-form"
            onClick={() => setIsMobileLoginOpen((isOpen) => !isOpen)}
          >
            {isMobileLoginOpen ? "Tutup" : "Masuk"}
          </button>
        </section>

        <footer className="col-span-full flex flex-col gap-1 text-center text-[8px] font-semibold tracking-widest text-white/75 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)] md:flex-row md:justify-between md:text-left md:text-[9px]">
          <span>DMAR · WORKSPACE MEKANIK</span>
          <span>Catat pekerjaan harian Anda.</span>
        </footer>
      </div>
    </main>
  );
}
