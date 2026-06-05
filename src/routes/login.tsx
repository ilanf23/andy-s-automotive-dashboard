import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Wrench,
  Truck,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Reveal } from "@/lib/motion";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const DEMO_USERS = [
  {
    role: "Owner",
    name: "Andy Andrews",
    email: "andy@andysats.com",
    description: "Full platform access · all reports · settings",
  },
  {
    role: "Advisor",
    name: "Cameron Mills",
    email: "cameron@andysats.com",
    description: "The demo default · daily-driver login",
  },
  {
    role: "Tech",
    name: "Marcus Reeves",
    email: "marcus@andysats.com",
    description: "Limited to My Work + assigned ROs",
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, hydrating } = useAuth();
  const [email, setEmail] = useState("cameron@andysats.com");
  const [password, setPassword] = useState("demo");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    if (!hydrating && isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [hydrating, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Email and password required");
      return;
    }
    setSubmitting(true);
    try {
      const user = await signIn(email, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`, {
        description: `Signed in as ${user.role.replace("-", " ")}`,
      });
      if (rememberMe) {
        toast.info("Session will persist for 30 days");
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_460px]">
      {/* ====================================================================== */}
      {/* LEFT - Brand panel                                                     */}
      {/* ====================================================================== */}
      <div className="relative hidden overflow-hidden bg-[var(--mkt-ink)] text-white lg:block">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 40% 40%, rgba(255,199,44,0.08), transparent 60%)",
          }}
        />

        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-32 top-20 h-[420px] w-[420px] rounded-full border border-[var(--mkt-gold)]/15" />
        <div className="pointer-events-none absolute -right-20 top-40 h-[280px] w-[280px] rounded-full border border-[var(--mkt-gold)]/30" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Reveal>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-[var(--mkt-gold)] text-base font-black text-[var(--mkt-gold)]">
                A
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-black tracking-tight">
                  ANDY'S<span className="ml-1.5 text-[var(--mkt-gold)]">ATS</span>
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Staff Portal
                </span>
              </div>
            </Link>
          </Reveal>

          <div>
            <Reveal delay={100}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--mkt-gold)]/30 bg-[var(--mkt-gold)]/10 px-3 py-1.5">
                <Sparkles className="h-3 w-3 text-[var(--mkt-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
                  Andy's OS
                </span>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <h2 className="mkt-display mt-6 text-4xl text-white md:text-5xl">
                The shop runs
                <br />
                on our own
                <br />
                <span className="text-[var(--mkt-gold)]">platform.</span>
              </h2>
            </Reveal>
            <Reveal delay={300}>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
                Repair orders, inspections, scheduling, parts, customer
                history, AI copilot. Everything our team needs to keep 170+
                trucks a month back on the road.
              </p>
            </Reveal>

            <ul className="mt-10 space-y-3">
              {[
                "Inspection findings auto-convert to estimates",
                "AI copilot that asks before every action",
                "24/7 dispatch view for fleet customers",
                "Real-time parts and labor tracking",
              ].map((b, i) => (
                <Reveal key={b} delay={400 + i * 80}>
                  <li className="flex items-start gap-3 text-sm text-white/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-gold)]" />
                    {b}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>

          <Reveal delay={700}>
            <div className="flex items-center gap-2 text-[11px] text-white/45">
              <Shield className="h-3.5 w-3.5" />
              Staff only · customers please{" "}
              <Link to="/contact" className="underline hover:text-white">
                use the contact form
              </Link>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* RIGHT - Form panel                                                     */}
      {/* ====================================================================== */}
      <div className="flex items-center justify-center bg-[var(--mkt-paper)] p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-[var(--mkt-gold-deep)] text-base font-black text-[var(--mkt-gold-deep)]">
                A
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black tracking-tight text-[var(--mkt-ink)]">
                  ANDY'S<span className="ml-1.5 text-[var(--mkt-gold-deep)]">ATS</span>
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--mkt-text-on-light-muted)]">
                  Staff Portal
                </span>
              </div>
            </Link>
          </div>

          <Reveal>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold-deep)]">
              Welcome back
            </span>
            <h1 className="mkt-display mt-2 text-3xl text-[var(--mkt-ink)]">
              Sign in to the shop.
            </h1>
          </Reveal>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <Reveal delay={100}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-text-on-light-muted)]">
                  Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mkt-text-on-light-muted)]" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-[var(--mkt-border-light)] bg-white py-3 pl-10 pr-3 text-sm font-medium outline-none transition-all focus:border-[var(--mkt-ink)] focus:ring-2 focus:ring-[var(--mkt-ink)]/15"
                    placeholder="you@andysats.com"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-text-on-light-muted)]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast.success("Password reset link sent", {
                        description: `Check ${email || "your inbox"} for instructions`,
                      })
                    }
                    className="text-[10px] font-bold text-[var(--mkt-text-on-light-muted)] hover:text-[var(--mkt-ink)]"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mkt-text-on-light-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-[var(--mkt-border-light)] bg-white py-3 pl-10 pr-10 text-sm font-medium outline-none transition-all focus:border-[var(--mkt-ink)] focus:ring-2 focus:ring-[var(--mkt-ink)]/15"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--mkt-text-on-light-muted)] hover:bg-[var(--mkt-paper-soft)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={260}>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[var(--mkt-border-light)]"
                />
                <span className="text-[var(--mkt-text-on-light-muted)]">
                  Keep me signed in
                </span>
              </label>
            </Reveal>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-[var(--mkt-red)]/30 bg-[var(--mkt-red)]/5 px-3 py-2 text-[12px] text-[var(--mkt-red)]">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <Reveal delay={320}>
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--mkt-ink)] px-4 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[var(--mkt-ink)]/20 transition-all hover:shadow-xl hover:shadow-[var(--mkt-ink)]/30 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <Wrench className="h-3.5 w-3.5" />
                    Open the Shop
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </Reveal>

            <Reveal delay={360}>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-[var(--mkt-border-light)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-text-on-light-muted)]">
                  Or continue with
                </span>
                <div className="h-px flex-1 bg-[var(--mkt-border-light)]" />
              </div>
            </Reveal>

            <Reveal delay={380}>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    toast.info("SSO", {
                      description: "Single sign-on - coming soon",
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--mkt-border-light)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--mkt-ink)] transition-all hover:border-[var(--mkt-ink)]/30 hover:bg-[var(--mkt-paper-soft)]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.info("SSO", {
                      description: "Single sign-on - coming soon",
                    })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--mkt-border-light)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--mkt-ink)] transition-all hover:border-[var(--mkt-ink)]/30 hover:bg-[var(--mkt-paper-soft)]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
                    <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
                    <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
                    <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
                  </svg>
                  Continue with Microsoft
                </button>
              </div>
            </Reveal>
          </form>

          {/* Demo profiles */}
          <Reveal delay={400}>
            <div className="mt-10">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-[var(--mkt-border-light)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-text-on-light-muted)]">
                  Demo profiles
                </span>
                <div className="h-px flex-1 bg-[var(--mkt-border-light)]" />
              </div>
              <p className="mt-3 text-[11px] text-[var(--mkt-text-on-light-muted)]">
                Any password works. Click a profile to autofill the email:
              </p>
              <div className="mt-3 space-y-1.5">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => {
                      setEmail(u.email);
                      setPassword("demo");
                    }}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-md border bg-white px-3 py-2.5 text-left transition-all",
                      email === u.email
                        ? "border-[var(--mkt-ink)] bg-[var(--mkt-paper-soft)]"
                        : "border-[var(--mkt-border-light)] hover:border-[var(--mkt-ink)]/30 hover:bg-[var(--mkt-paper-soft)]",
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mkt-ink)] text-[10px] font-black text-[var(--mkt-gold)]">
                      {u.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-black text-[var(--mkt-ink)]">
                          {u.name}
                        </span>
                        <span className="rounded-full bg-[var(--mkt-gold)] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--mkt-ink)]">
                          {u.role}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--mkt-text-on-light-muted)]">
                        {u.description}
                      </div>
                    </div>
                    <Truck className="h-3 w-3 shrink-0 text-[var(--mkt-text-on-light-muted)]" />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={500}>
            <div className="mt-10 border-t border-[var(--mkt-border-light)] pt-5 text-center text-[11px] text-[var(--mkt-text-on-light-muted)]">
              Not staff?{" "}
              <Link
                to="/contact"
                className="font-black text-[var(--mkt-ink)] hover:text-[var(--mkt-gold-deep)] hover:underline"
              >
                Request service →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
