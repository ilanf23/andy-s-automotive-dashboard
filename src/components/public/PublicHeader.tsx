import { Link, useRouterState } from "@tanstack/react-router";
import { Phone, Menu, X, ArrowRight, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 bg-white transition-all duration-300",
        scrolled
          ? "border-b border-[var(--mkt-border-light)] shadow-[0_2px_20px_rgba(10,10,10,0.06)]"
          : "border-b border-transparent",
      )}
    >
      <div
        className={clsx(
          "mx-auto flex max-w-7xl items-center gap-6 px-5 transition-all duration-300 md:px-8",
          scrolled ? "h-20" : "h-28",
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label="Andy's Automotive & Truck Services">
          <img
            src="/andys-logo.png"
            alt="Andy's Automotive & Truck Services"
            className={clsx(
              "w-auto transition-all duration-300",
              scrolled ? "h-11" : "h-16",
            )}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="ml-6 hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={clsx(
                "group relative rounded-full px-5 py-2.5 text-[15px] font-semibold transition-all",
                isActive(n.to, n.exact)
                  ? "bg-[var(--mkt-gold)]/10 text-[var(--mkt-gold)]"
                  : "text-[var(--mkt-ink)]/75 hover:bg-[var(--mkt-ink)]/[0.04] hover:text-[var(--mkt-ink)]",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3 md:gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="group hidden items-center gap-2 rounded-full bg-[var(--mkt-ink)] px-5 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[var(--mkt-gold)] sm:inline-flex"
            >
              <Wrench className="h-4 w-4" />
              Open Platform
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden items-center gap-2 rounded-full border border-[var(--mkt-border-light)] bg-white px-5 py-3 text-[14px] font-semibold text-[var(--mkt-ink)] transition-all hover:border-[var(--mkt-ink)]/30 hover:bg-[var(--mkt-ink)]/[0.04] sm:inline-flex"
              >
                Log In
              </Link>
            </>
          )}

          <a
            href="tel:+19042075191"
            className="hidden items-center gap-2.5 text-[15px] font-semibold text-[var(--mkt-ink)] transition-colors hover:text-[var(--mkt-gold)] lg:inline-flex"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--mkt-gold)]/10 text-[var(--mkt-gold)]">
              <Phone className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="tabular-nums">(904) 207-5191</span>
          </a>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-full p-2.5 text-[var(--mkt-ink)] hover:bg-[var(--mkt-ink)]/[0.05] md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="border-t border-[var(--mkt-border-light)] bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1.5 px-5 py-5">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "rounded-2xl px-4 py-3.5 text-base font-semibold",
                  isActive(n.to, n.exact)
                    ? "bg-[var(--mkt-gold)]/10 text-[var(--mkt-gold)]"
                    : "text-[var(--mkt-ink)]/80 hover:bg-[var(--mkt-ink)]/[0.04]",
                )}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="tel:+19042075191"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--mkt-border-light)] bg-white px-4 py-3.5 text-base font-semibold text-[var(--mkt-ink)]"
            >
              <Phone className="h-4 w-4 text-[var(--mkt-gold)]" />
              (904) 207-5191
            </a>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-transparent px-4 py-3 text-sm font-medium text-[var(--mkt-text-on-light-muted)]"
            >
              Staff Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
