import { Outlet } from "@tanstack/react-router";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function PublicLayout() {
  return (
    <div className="marketing-theme flex min-h-screen flex-col bg-[var(--mkt-paper)] text-[var(--mkt-text-on-light)]">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
