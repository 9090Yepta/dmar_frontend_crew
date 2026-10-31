import type { ReactNode } from "react";
import { LuActivity } from "react-icons/lu";

type ApiState = "loading" | "online" | "offline";

type MainLayoutProps = {
  api: ApiState;
  children: ReactNode;
  navigation?: ReactNode;
  footer?: ReactNode;
};

export function MainLayout({
  children,
  navigation,
  footer = "IT - PT. WBK",
}: MainLayoutProps) {
  return (
    <main className="mx-auto box-border min-h-svh w-full min-w-0 max-w-6xl px-2 pb-20 pt-2 sm:px-6 sm:pt-5 md:pb-8 md:pt-8">
      {navigation}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 sm:gap-5">
        {children}
      </div>
      <footer className="mt-5 flex min-w-0 items-center justify-center gap-2 border-t border-base-300/70 py-3 text-[11px] text-base-content/50">
        <LuActivity className="size-3.5 text-primary/70" aria-hidden="true" />
        <span className="truncate">
          DMAR <span className="px-1 opacity-50">·</span> {footer}
        </span>
      </footer>
    </main>
  );
}
