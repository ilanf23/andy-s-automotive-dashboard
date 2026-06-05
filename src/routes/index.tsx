import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Phone,
  Truck,
  Wrench,
  Shield,
  Handshake,
  Eye,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  Quote,
  Play,
  Sparkles,
  Zap,
  Camera,
  CalendarClock,
  PackageCheck,
  ArrowLeftRight,
  Navigation,
  ShieldCheck,
  CircleDot,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { Reveal, AnimatedCounter, Parallax, Marquee } from "@/lib/motion";

export const Route = createFileRoute("/")({
  component: HomePage,
});

// ============================================================================
// HomePage - Andy's ATS marketing site (motion-rich, dark navy + gold)
// ============================================================================

function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <TrustMarquee />
      <AboutUsVideo />
      <AboutSection />
      <ValuesSection />
      <ServicesPreview />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

// ----------------------------------------------------------------------------
// Hero
// ----------------------------------------------------------------------------

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1706741843463-11efe018ea1b?auto=format&fit=crop&w=1920&q=80",
    alt: "Red truck parked inside a repair garage",
  },
  {
    src: "https://images.unsplash.com/photo-1574757974346-45bae947d89a?auto=format&fit=crop&w=1920&q=80",
    alt: "Cargo freight truck with driver alongside",
  },
  {
    src: "https://images.unsplash.com/photo-1760971706737-339c5ead5cb6?auto=format&fit=crop&w=1920&q=80",
    alt: "White pickup truck parked outside a shop",
  },
  {
    src: "https://images.unsplash.com/photo-1770715897376-22215c26e2a7?auto=format&fit=crop&w=1920&q=80",
    alt: "Yellow semi-truck with hood up in service",
  },
];

function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused]);

  const leftIdx = active;
  const rightIdx = (active + 1) % HERO_IMAGES.length;

  return (
    <section className="relative overflow-hidden bg-[var(--mkt-paper-soft)] text-white">
      {/* Two photos flanking the panel - left + right */}
      <div className="absolute inset-0 grid grid-cols-2" aria-hidden>
        <div className="relative h-full overflow-hidden">
          {HERO_IMAGES.map((img, i) => (
            <img
              key={`L-${img.src}`}
              src={img.src}
              alt=""
              className={clsx(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                i === leftIdx ? "opacity-100" : "opacity-0",
              )}
              style={{ willChange: "opacity" }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(10,10,10,0.30) 0%, rgba(10,10,10,0) 55%)",
            }}
          />
        </div>
        <div className="relative h-full overflow-hidden">
          {HERO_IMAGES.map((img, i) => (
            <img
              key={`R-${img.src}`}
              src={img.src}
              alt=""
              className={clsx(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                i === rightIdx ? "opacity-100" : "opacity-0",
              )}
              style={{ willChange: "opacity" }}
              loading="lazy"
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(270deg, rgba(10,10,10,0.30) 0%, rgba(10,10,10,0) 55%)",
            }}
          />
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl items-center justify-center px-4 py-[6.9rem] md:px-6 md:py-[9.2rem]">
        <Reveal>
          <div className="relative w-full max-w-[68rem]">
            {/* Soft halo behind the panel */}
            <div
              className="pointer-events-none absolute -inset-[1.725rem] -z-10 rounded-[2.6rem] opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(225,6,0,0.22), transparent 70%)",
              }}
              aria-hidden
            />

            <div className="relative overflow-hidden rounded-2xl bg-[var(--mkt-ink)] px-[2.3rem] py-[2.875rem] text-center shadow-[0_34px_104px_-23px_rgba(10,10,10,0.6)] md:px-[5.2rem] md:py-[3.8rem]">
              {/* Corner accents — yellow hint on red-dominant hero */}
              <span className="pointer-events-none absolute left-0 top-0 h-14 w-14">
                <span className="absolute left-0 top-0 h-px w-14 bg-[var(--mkt-yellow)]/70" />
                <span className="absolute left-0 top-0 h-14 w-px bg-[var(--mkt-yellow)]/70" />
              </span>
              <span className="pointer-events-none absolute bottom-0 right-0 h-14 w-14">
                <span className="absolute bottom-0 right-0 h-px w-14 bg-[var(--mkt-yellow)]/70" />
                <span className="absolute bottom-0 right-0 h-14 w-px bg-[var(--mkt-yellow)]/70" />
              </span>

              <Reveal>
                <div className="text-[11.5px] font-black uppercase tracking-[0.28em] text-[var(--mkt-gold)]">
                  For fleets that can't afford downtime
                </div>
              </Reveal>

              <Reveal delay={120}>
                <h1 className="mkt-display mx-auto mt-[2.0125rem] max-w-[36.8rem] text-[2.6rem] leading-[1.05] text-white md:text-[4.3rem]">
                  When a truck is{" "}
                  <span className="relative inline-block italic text-[var(--mkt-gold)]">
                    down,
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 -bottom-1 h-[3px] bg-[var(--mkt-yellow)]/80"
                    />
                  </span>
                  <br />
                  our commitment can't be.
                </h1>
              </Reveal>

              <Reveal delay={220}>
                <p className="mx-auto mt-[2.0125rem] max-w-[27.6rem] text-[16px] leading-relaxed text-white/75 md:text-[18.4px]">
                  At Andy's, we keep mobile fleets moving - pickup, drop-off,
                  on-site, and after-hours service for businesses running 3 to
                  20 vehicles. Your trucks stay on the road during your hours,
                  because that's when they make you money.
                </p>
              </Reveal>

              <Reveal delay={320}>
                <div className="mt-[2.875rem] flex flex-wrap items-center justify-center gap-x-[1.725rem] gap-y-3">
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 rounded-md border-2 border-white/30 bg-white/5 px-[1.65rem] py-[0.85rem] text-[16px] font-black uppercase tracking-wider text-white transition-colors hover:border-[var(--mkt-gold)] hover:text-[var(--mkt-gold)]"
                  >
                    <Play className="h-[1.05rem] w-[1.05rem]" />
                    Watch demo
                  </Link>
                  <Link
                    to="/services"
                    className="group inline-flex items-center gap-1.5 text-[16px] font-bold text-white/90 transition-colors hover:text-[var(--mkt-gold)]"
                  >
                    Fleet services &amp; resources
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Slide indicators */}
            <div className="mt-7 flex items-center justify-center gap-2">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  aria-label={`Show background image ${i + 1}`}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === active
                      ? "w-8 bg-[var(--mkt-gold)]"
                      : "w-1.5 bg-white/70 ring-1 ring-[var(--mkt-ink)]/15 hover:bg-white",
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Stats bar - large animated counters
// ----------------------------------------------------------------------------

function StatsBar() {
  const stats: Array<{
    value: number;
    suffix?: string;
    format?: "int" | "decimal-1" | "compact-k";
    label: string;
  }> = [
    { value: 170, suffix: "+", label: "Trucks serviced per month" },
    { value: 2.3, format: "decimal-1", suffix: " days", label: "Average turnaround" },
    { value: 5, format: "decimal-1", suffix: "★", label: "Google rating" },
    { value: 100, suffix: "%", label: "Mobile or pickup option" },
  ];
  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-20">
      {/* Background - subtle radial accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255,199,44,0.08), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Header - compact, left-aligned on desktop */}
          <div className="lg:col-span-4">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold)]">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--mkt-yellow)]" />
                By the numbers
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mkt-display mt-2 text-2xl leading-[1.1] md:text-3xl">
                The receipts.{" "}
                <span className="text-[var(--mkt-gold)]">Not the pitch.</span>
              </h2>
            </Reveal>
          </div>

          {/* Stats - inline row with hairline dividers */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--mkt-border-light)] bg-[var(--mkt-border-light)] lg:col-span-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal
                key={s.label}
                direction="up"
                distance={40}
                duration={700}
                delay={i * 120}
              >
                <div className="h-full bg-white px-5 py-6 md:px-6 md:py-7">
                  <div className={clsx("text-3xl font-black leading-none tabular-nums md:text-4xl", i % 3 === 1 ? "text-[var(--mkt-green-deep)]" : i % 3 === 2 ? "text-[var(--mkt-yellow-deep)]" : "text-[var(--mkt-gold)]")}>
                    <AnimatedCounter
                      to={s.value}
                      suffix={s.suffix}
                      format={s.format}
                      duration={1600}
                    />
                  </div>
                  <div className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-text-on-light-muted)] md:text-xs">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Trust marquee - industries served
// ----------------------------------------------------------------------------

function TrustMarquee() {
  const industries = [
    "HVAC",
    "Landscape",
    "Pest Control",
    "Construction",
    "Pool Service",
    "Delivery",
    "Security",
    "Medical",
    "School / Govt",
    "Moving",
    "Custodial",
    "Plumbing",
    "Food Service",
  ];

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <p className="flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-text-on-light-muted)]">
            <span aria-hidden className="h-px w-6 bg-[var(--mkt-yellow)]/80" />
            Trusted by fleets in 13+ industries
            <span aria-hidden className="h-px w-6 bg-[var(--mkt-yellow)]/80" />
          </p>
        </Reveal>
      </div>
      <div className="mt-8">
        <Marquee speedSec={36}>
          {industries.map((i) => (
            <div key={i} className="px-8 py-2">
              <span className="text-2xl font-black tracking-tight text-[var(--mkt-ink)]/35 md:text-3xl">
                {i}
              </span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// About Us video - large branded image
// ----------------------------------------------------------------------------

function AboutUsVideo() {
  return (
    <section className="bg-[var(--mkt-paper-soft)] py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold-deep)]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--mkt-yellow)]" />
              Meet Andy's
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mkt-display mt-3 text-4xl text-[var(--mkt-ink)] md:text-5xl">
              About Us video
            </h2>
          </Reveal>
        </div>

        <Reveal delay={200} direction="up">
          <button
            type="button"
            onClick={() =>
              toast.info("Video player", {
                description: "Demo video - coming soon",
              })
            }
            className="group relative mt-10 block w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--mkt-border-light)] shadow-[0_18px_50px_-20px_rgba(10,10,10,0.35)] transition-transform duration-500 hover:scale-[1.01]"
            aria-label="Play About Us video"
          >
            <img
              src="/images/about-us-video.png"
              alt="Andy's Auto & Truck Services - about us"
              className="block h-auto w-full"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--mkt-gold)] text-[var(--mkt-ink)] shadow-2xl transition-transform duration-300 group-hover:scale-110 md:h-24 md:w-24">
                <Play
                  className="ml-1 h-9 w-9 md:h-11 md:w-11"
                  strokeWidth={2}
                  fill="currentColor"
                />
              </span>
            </span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// About section - "We aim to keep your vehicles on the road"
// ----------------------------------------------------------------------------

type AboutCapability = {
  key: string;
  icon: typeof Truck;
  label: string;
  subtitle: string;
  preview: () => ReactNode;
};

const ABOUT_CAPABILITIES: AboutCapability[] = [
  {
    key: "mobile",
    icon: Truck,
    label: "Mobile maintenance at your yard",
    subtitle: "On-site service. We bring the shop to you.",
    preview: () => <PreviewDispatch />,
  },
  {
    key: "pickup",
    icon: ArrowLeftRight,
    label: "Pickup and drop-off across Jacksonville",
    subtitle: "We grab the truck. We bring it back.",
    preview: () => <PreviewPickup />,
  },
  {
    key: "hours",
    icon: CalendarClock,
    label: "After-hours and weekend service",
    subtitle: "Work happens while your fleet sleeps.",
    preview: () => <PreviewSchedule />,
  },
  {
    key: "parts",
    icon: PackageCheck,
    label: "NAPA-affiliated - quality parts, real warranty",
    subtitle: "Every part traceable. Every job covered.",
    preview: () => <PreviewParts />,
  },
  {
    key: "estimate",
    icon: Camera,
    label: "Transparent estimates with photos",
    subtitle: "See exactly what we see. Approve in a tap.",
    preview: () => <PreviewEstimate />,
  },
];

function AboutSection() {
  const [activeKey, setActiveKey] = useState(ABOUT_CAPABILITIES[0].key);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActiveKey((current) => {
        const i = ABOUT_CAPABILITIES.findIndex((c) => c.key === current);
        return ABOUT_CAPABILITIES[(i + 1) % ABOUT_CAPABILITIES.length].key;
      });
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused]);

  const active =
    ABOUT_CAPABILITIES.find((c) => c.key === activeKey) ?? ABOUT_CAPABILITIES[0];

  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.05fr_1fr]">
          {/* Interactive preview panel */}
          <Reveal direction="right">
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-[var(--mkt-border-light)] bg-white shadow-[0_24px_80px_-20px_rgba(10,10,10,0.20)]">
                {/* Hero still */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src="/images/our-truck.jpg"
                    alt="Andy's technician servicing a customer truck in the shop"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mkt-gold)] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--mkt-gold)]" />
                    </span>
                    <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      Live · Jacksonville fleet
                    </span>
                  </div>
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    <Navigation className="h-3 w-3 text-[var(--mkt-gold)]" />
                    Tech en route · 12 min
                  </div>

                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--mkt-gold)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                      <Sparkles className="h-3 w-3" />
                      Mobile-first service
                    </div>
                    <p className="mt-3 max-w-md text-lg font-black leading-tight text-[var(--mkt-ink)] md:text-xl">
                      "There goes{" "}
                      <span className="text-[var(--mkt-gold)]">OUR truck.</span>"
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-[var(--mkt-text-on-light-muted)]">
                      How we think about every customer's fleet.
                    </p>
                  </div>
                </div>

                {/* Mini-UI - swaps per active tab */}
                <div
                  key={active.key}
                  className="relative bg-white px-5 pb-6 pt-5 md:px-6 md:pb-7"
                  style={{ animation: "aboutFade 480ms ease-out both" }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
                      <active.icon className="h-3.5 w-3.5" />
                      {active.label}
                    </div>
                    <div className="flex items-center gap-1">
                      {ABOUT_CAPABILITIES.map((c) => (
                        <span
                          key={c.key}
                          className={clsx(
                            "h-1 rounded-full transition-all duration-300",
                            c.key === active.key
                              ? "w-5 bg-[var(--mkt-gold)]"
                              : "w-1 bg-[var(--mkt-ink)]/20",
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--mkt-border-light)] bg-[var(--mkt-paper-soft)] p-4 md:p-5">
                    {active.preview()}
                  </div>
                </div>
              </div>

              {/* Floating stats card */}
              <Reveal delay={300} direction="up">
                <div className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-[var(--mkt-border-light)] bg-white p-5 shadow-xl md:block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--mkt-gold)]/15">
                      <Clock className="h-6 w-6 text-[var(--mkt-ink)]" />
                    </div>
                    <div>
                      <div className="text-2xl font-black tabular-nums">
                        <AnimatedCounter to={94} suffix="%" />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
                        Same-day dispatch
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <style>{`
                @keyframes aboutFade {
                  from { opacity: 0; transform: translateY(8px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          </Reveal>

          {/* Copy + interactive tabs */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold-deep)]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--mkt-yellow)]" />
                Why Andy's
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mkt-display mt-3 text-4xl text-[var(--mkt-ink)] md:text-5xl">
                When your truck's
                <br />
                in the shop,
                <br />
                <span className="text-[var(--mkt-gold-deep)]">
                  your business stops.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--mkt-text-on-light-muted)] md:text-lg">
                Tap any capability below to see how we run it - live dispatch,
                pickup logistics, after-hours coverage, NAPA-grade parts, and
                photo-backed estimates.
              </p>
            </Reveal>

            <ul className="mt-8 space-y-2">
              {ABOUT_CAPABILITIES.map((c, i) => {
                const isActive = c.key === active.key;
                const Icon = c.icon;
                return (
                  <Reveal key={c.key} delay={280 + i * 70}>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveKey(c.key);
                          setPaused(true);
                        }}
                        aria-pressed={isActive}
                        className={clsx(
                          "group relative flex w-full items-center gap-4 overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-all duration-300",
                          isActive
                            ? "border-[var(--mkt-ink)] bg-white shadow-md"
                            : "border-[var(--mkt-border-light)] bg-white/60 hover:border-[var(--mkt-ink)]/30 hover:bg-white",
                        )}
                      >
                        <span
                          className={clsx(
                            "absolute left-0 top-0 h-full w-1 bg-[var(--mkt-gold)] transition-all duration-300",
                            isActive ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span
                          className={clsx(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                            isActive
                              ? "bg-[var(--mkt-ink)] text-[var(--mkt-gold)]"
                              : "bg-[var(--mkt-paper-soft)] text-[var(--mkt-ink)] group-hover:bg-[var(--mkt-ink)] group-hover:text-[var(--mkt-gold)]",
                          )}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black leading-tight text-[var(--mkt-ink)]">
                            {c.label}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-[var(--mkt-text-on-light-muted)]">
                            {c.subtitle}
                          </span>
                        </span>
                        <ChevronRight
                          className={clsx(
                            "h-4 w-4 shrink-0 transition-all duration-300",
                            isActive
                              ? "translate-x-0 text-[var(--mkt-gold-deep)]"
                              : "-translate-x-1 text-[var(--mkt-text-on-light-muted)] opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                          )}
                        />
                      </button>
                    </li>
                  </Reveal>
                );
              })}
            </ul>

            <Reveal delay={800}>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--mkt-ink)] hover:text-[var(--mkt-gold-deep)]"
                >
                  Read our story
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
                  {paused ? "Paused - tap any tab" : "Auto-rotating · tap to pin"}
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive preview panels for AboutSection
// ─────────────────────────────────────────────────────────────────────────────

function PreviewDispatch() {
  return (
    <div className="text-[var(--mkt-ink)]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
        <span>Dispatch · Job #4821</span>
        <span className="inline-flex items-center gap-1 text-[var(--mkt-gold)]">
          <CircleDot className="h-3 w-3 animate-pulse" />
          En route
        </span>
      </div>

      <div className="relative mt-3 h-24 overflow-hidden rounded-lg border border-[var(--mkt-border-light)] bg-white">
        <svg viewBox="0 0 320 96" className="absolute inset-0 h-full w-full">
          <path
            d="M 16 78 C 80 78, 100 24, 168 30 S 270 78, 304 36"
            stroke="rgba(225,6,0,0.35)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
          <path
            d="M 16 78 C 80 78, 100 24, 168 30"
            stroke="#E10600"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute bottom-3 left-2 flex items-center gap-1.5 rounded bg-[var(--mkt-ink)] px-1.5 py-0.5 text-[9px] font-black text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          HQ
        </div>
        <div
          className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[var(--mkt-gold)] p-1.5 shadow-[0_0_0_4px_rgba(225,6,0,0.25)]"
          style={{ animation: "aboutTruckBob 1.8s ease-in-out infinite" }}
        >
          <Truck className="h-3 w-3 text-white" strokeWidth={2.5} />
        </div>
        <div className="absolute right-2 top-6 flex items-center gap-1.5 rounded bg-[var(--mkt-gold)] px-1.5 py-0.5 text-[9px] font-black text-white">
          <MapPin className="h-2.5 w-2.5" />
          Yard
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--mkt-border-light)] bg-white p-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--mkt-gold)] text-xs font-black text-white">
          SP
        </div>
        <div className="flex-1">
          <div className="text-xs font-black text-[var(--mkt-ink)]">Stuart P.</div>
          <div className="text-[10px] text-[var(--mkt-text-on-light-muted)]">
            Master tech · 11 yrs · Diesel certified
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-black tabular-nums text-[var(--mkt-gold)]">
            12:04
          </div>
          <div className="text-[9px] uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
            ETA
          </div>
        </div>
      </div>

      <style>{`
        @keyframes aboutTruckBob {
          0%, 100% { transform: translate(-50%, 0); }
          50%      { transform: translate(-50%, -3px); }
        }
      `}</style>
    </div>
  );
}

function PreviewPickup() {
  const steps = [
    { time: "7:30 AM", label: "Pickup at your yard", done: true, active: false },
    { time: "9:15 AM", label: "Diagnostic complete", done: true, active: false },
    { time: "1:40 PM", label: "Repair in progress", done: false, active: true },
    { time: "4:00 PM", label: "Returned, keys in hand", done: false, active: false },
  ];
  return (
    <div className="text-[var(--mkt-ink)]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
        <span>Today · Ford F-250 (Unit 07)</span>
        <span className="inline-flex items-center gap-1 text-[var(--mkt-gold)]">
          <ArrowLeftRight className="h-3 w-3" />
          Same-day swap
        </span>
      </div>
      <ol className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3">
            <div
              className={clsx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black",
                s.done && "bg-[var(--mkt-green)] text-white",
                s.active &&
                  "bg-[var(--mkt-ink)] text-white ring-4 ring-[var(--mkt-yellow)]/50",
                !s.done && !s.active && "bg-[var(--mkt-paper-soft)] text-[var(--mkt-text-on-light-muted)]",
              )}
            >
              {s.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <div className="flex-1">
              <div
                className={clsx(
                  "text-xs font-black",
                  s.active ? "text-[var(--mkt-ink)]" : "text-[var(--mkt-ink)]/85",
                )}
              >
                {s.label}
              </div>
            </div>
            <div className="text-[10px] font-bold tabular-nums text-[var(--mkt-text-on-light-muted)]">
              {s.time}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PreviewSchedule() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const rows: Array<{ slot: string; type: "shop" | "after" }> = [
    { slot: "AM 7–10", type: "shop" },
    { slot: "AM 10–1", type: "shop" },
    { slot: "PM 1–4", type: "shop" },
    { slot: "PM 4–6", type: "shop" },
    { slot: "PM 6–9", type: "after" },
  ];

  return (
    <div className="text-[var(--mkt-ink)]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
        <span>This week · Service windows</span>
        <span className="inline-flex items-center gap-1 text-[var(--mkt-gold)]">
          <CalendarClock className="h-3 w-3" />
          24/7 dispatch
        </span>
      </div>

      <div className="mt-3 grid grid-cols-[64px_repeat(7,1fr)] gap-px">
        <div />
        {days.map((d) => (
          <div
            key={d}
            className="px-1 py-1 text-center text-[9px] font-black uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]"
          >
            {d}
          </div>
        ))}
        {rows.map((row) => (
          <Fragment key={row.slot}>
            <div className="py-1.5 pr-1 text-right text-[9px] font-bold tabular-nums text-[var(--mkt-text-on-light-muted)]">
              {row.slot}
            </div>
            {days.map((d, di) => {
              const isWknd = d === "Sat" || d === "Sun";
              const isAfter = row.type === "after";
              let cls = "bg-[var(--mkt-ink)]/[0.06]";
              if (!isWknd && !isAfter) cls = "bg-[var(--mkt-green)]/80";
              else if (!isWknd && isAfter) cls = "bg-[var(--mkt-yellow)]/70";
              else if (d === "Sat" && !isAfter) cls = "bg-[var(--mkt-gold)]/60";
              return (
                <div
                  key={`${row.slot}-${di}`}
                  className={clsx("mx-px h-5 rounded-[2px]", cls)}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-[var(--mkt-text-on-light-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--mkt-green)]/80" />
          Shop hours
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--mkt-yellow)]/70" />
          After-hours fleet
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--mkt-gold)]/60" />
          Saturday service
        </span>
      </div>
    </div>
  );
}

function PreviewParts() {
  const parts = [
    { name: "Front brake pads (set)", sku: "NAPA · 7415", price: 89.4, warranty: "24 mo" },
    { name: "Brake rotors, pair", sku: "NAPA · R-2208", price: 142.0, warranty: "24 mo" },
    { name: "Caliper hardware kit", sku: "NAPA · CHK-44", price: 18.75, warranty: "12 mo" },
  ];
  return (
    <div className="text-[var(--mkt-ink)]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
        <span>Parts manifest · RO-0312</span>
        <span className="inline-flex items-center gap-1 rounded bg-[var(--mkt-green)] px-1.5 py-0.5 text-[9px] font-black text-white">
          <ShieldCheck className="h-3 w-3" />
          NAPA AutoCare
        </span>
      </div>
      <ul className="mt-3 divide-y divide-[var(--mkt-border-light)]">
        {parts.map((p) => (
          <li key={p.sku} className="flex items-center gap-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--mkt-gold)]/15 text-[var(--mkt-gold)]">
              <PackageCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-black text-[var(--mkt-ink)]">
                {p.name}
              </div>
              <div className="text-[10px] text-[var(--mkt-text-on-light-muted)]">
                {p.sku} · Warranty {p.warranty}
              </div>
            </div>
            <div className="text-xs font-black tabular-nums text-[var(--mkt-ink)]">
              ${p.price.toFixed(2)}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-1 flex items-center justify-between rounded-md bg-[var(--mkt-gold)]/10 px-3 py-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--mkt-gold)]">
          Backed by national NAPA warranty
        </span>
        <span className="text-xs font-black tabular-nums text-[var(--mkt-ink)]">
          $250.15
        </span>
      </div>
    </div>
  );
}

function PreviewEstimate() {
  const navigate = useNavigate();
  const photos = [
    { bg: "linear-gradient(135deg, #1f2937 0%, #374151 60%, #6b7280 100%)", label: "Pad wear" },
    { bg: "linear-gradient(135deg, #3f1d1d 0%, #7f1d1d 60%, #b91c1c 100%)", label: "Rotor" },
    { bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #475569 100%)", label: "Caliper" },
  ];
  return (
    <div className="text-[var(--mkt-ink)]">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
        <span>Estimate · Sent 11:42 AM</span>
        <span className="inline-flex items-center gap-1 text-[var(--mkt-gold)]">
          <Camera className="h-3 w-3" />
          3 photos attached
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div
            key={p.label}
            className="relative aspect-[4/3] overflow-hidden rounded-md ring-1 ring-[var(--mkt-border-light)]"
            style={{ background: p.bg }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 60%)",
              }}
            />
            <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
              {p.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-[var(--mkt-ink)]/80">
          <span>Front brake service</span>
          <span className="tabular-nums">$310.00</span>
        </div>
        <div className="flex items-center justify-between text-[var(--mkt-ink)]/80">
          <span>Labor (1.4 hr)</span>
          <span className="tabular-nums">$168.00</span>
        </div>
        <div className="flex items-center justify-between border-t border-[var(--mkt-border-light)] pt-2 text-[var(--mkt-ink)]">
          <span className="text-[10px] font-black uppercase tracking-wider">
            Total
          </span>
          <span className="text-base font-black tabular-nums">$478.00</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          toast.success("Estimate approved", {
            description: "Work order created - RO #4847",
          });
          navigate({ to: "/estimates/EST-4847" });
        }}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--mkt-gold)] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white transition-transform hover:scale-[1.01]"
      >
        Approve in one tap
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Values section - Safety, Transparency, Partnership
// ----------------------------------------------------------------------------

const VALUES = [
  {
    icon: Shield,
    label: "Safety",
    title: "Safety isn't a checkbox - it's the foundation.",
    body: "Every wrench turn ends with a vehicle that's safe for your driver, your team, and everyone sharing the road. We don't pass a vehicle until we'd put our own family in it.",
  },
  {
    icon: Eye,
    label: "Transparency",
    title: "We educate - not upsell.",
    body: "Most shops fix the problem and move on. We tell you what's wrong, why it happened, and what could happen if you skip the work. The estimate is the conversation, not a surprise.",
  },
  {
    icon: Handshake,
    label: "Partnership",
    title: "When your truck rolls by, we say 'that's ours.'",
    body: "We don't see customers - we see partners. Your fleet's uptime is our scoreboard. When you grow, we grow. When you call after-hours, we answer.",
  },
];

function ValuesSection() {
  return (
    <section className="bg-[var(--mkt-ink)] py-24 text-white md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold)]">
              <span aria-hidden className="h-px w-6 bg-[var(--mkt-yellow)]/80" />
              What we won't compromise on
              <span aria-hidden className="h-px w-6 bg-[var(--mkt-yellow)]/80" />
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mkt-display mt-3 text-4xl text-white md:text-5xl">
              Three values
              <br />
              everything builds on.
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <Reveal key={v.label} delay={i * 120}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--mkt-border-light)] bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--mkt-gold)]/40 hover:shadow-lg">
                  {/* Gold accent corner */}
                  <div className="absolute -right-px -top-px h-24 w-24 overflow-hidden">
                    <div className="absolute right-0 top-0 h-px w-12 bg-gradient-to-l from-[var(--mkt-gold)] to-transparent transition-all duration-500 group-hover:w-24" />
                    <div className="absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-[var(--mkt-gold)] to-transparent transition-all duration-500 group-hover:h-24" />
                  </div>

                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
                    {String(i + 1).padStart(2, "0")} · {v.label}
                  </div>

                  <div className="mt-7 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--mkt-gold)]/10 transition-all duration-500 group-hover:bg-[var(--mkt-gold)]">
                    <Icon className="h-7 w-7 text-[var(--mkt-gold)] transition-colors duration-500 group-hover:text-white" strokeWidth={1.5} />
                  </div>

                  <h3 className="mkt-display mt-6 text-2xl text-[var(--mkt-ink)]">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--mkt-text-on-light-muted)]">
                    {v.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Pull quote */}
        <Reveal delay={400}>
          <div className="mx-auto mt-20 max-w-3xl rounded-2xl border border-[var(--mkt-gold)]/30 bg-white/[0.03] p-8 text-center md:p-12">
            <Quote
              className="mx-auto h-10 w-10 text-[var(--mkt-gold)]"
              strokeWidth={1.5}
            />
            <blockquote className="mkt-display mt-6 text-2xl leading-tight text-white md:text-3xl">
              Our passion is to empower the business owner to focus on their
              end client - and not let maintenance be a distraction from that.
            </blockquote>
            <figcaption className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
              Andy Andrews · Co-founder
            </figcaption>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Services preview - 6 service cards
// ----------------------------------------------------------------------------

const SERVICES = [
  {
    icon: Truck,
    title: "Mobile Fleet Maintenance",
    body: "We bring the shop to you. Preventative maintenance, diagnostics, and minor repairs on-site at your yard or jobsite.",
  },
  {
    icon: Wrench,
    title: "Engine & Transmission",
    body: "From regular oil changes to full engine or transmission replacement. Diesel and gas, light and heavy duty.",
  },
  {
    icon: Zap,
    title: "Electrical & Diagnostics",
    body: "Modern diagnostic tools paired with old-school know-how. We chase the gremlins others give up on.",
  },
  {
    icon: Shield,
    title: "Brakes, Tires & Steering",
    body: "The safety triangle. Full brake service, tire mounting and rotation, alignment, and steering / suspension repair.",
  },
  {
    icon: Clock,
    title: "Preventative Maintenance",
    body: "Scheduled service intervals based on miles, hours, or whatever schedule fits your fleet. We track it for you.",
  },
  {
    icon: Sparkles,
    title: "Fleet Management Services",
    body: "Beyond the wrench: maintenance scheduling, recordkeeping, vehicle history, and reporting for your whole fleet.",
  },
];

function ServicesPreview() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold-deep)]">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--mkt-yellow)]" />
                What we do
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mkt-display mt-3 text-4xl text-[var(--mkt-ink)] md:text-5xl">
                Built for the trucks
                <br />
                that keep your business running.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--mkt-ink)] hover:text-[var(--mkt-gold-deep)]"
            >
              View all services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 80}>
                <Link
                  to="/services"
                  className="group relative block h-full overflow-hidden rounded-2xl border border-[var(--mkt-border-light)] bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--mkt-ink)]/30 hover:shadow-xl">
                  <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[var(--mkt-gold)]/0 transition-all duration-500 group-hover:bg-[var(--mkt-gold)]/15" />
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--mkt-ink)] text-[var(--mkt-gold)] transition-all duration-500 group-hover:bg-[var(--mkt-gold)] group-hover:text-[var(--mkt-ink)]">
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-5 text-xl font-black text-[var(--mkt-ink)]">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--mkt-text-on-light-muted)]">
                      {s.body}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[var(--mkt-ink)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Learn more
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Testimonials
// ----------------------------------------------------------------------------

const TESTIMONIALS = [
  {
    quote:
      "Andy's takes our box trucks no questions asked. Estimates are clear, turnaround is faster than the dealer, and our drivers don't lose hours dropping the truck off.",
    author: "Dana W.",
    role: "Fleet Manager · 14-vehicle delivery fleet",
  },
  {
    quote:
      "Stuart came to our yard the same day. Did the brake job right in front of us, walked us through every wear surface he replaced. Hard to find that level of transparency anywhere.",
    author: "Roberto R.",
    role: "Store Manager · Local NAPA Auto Parts",
  },
  {
    quote:
      "We've used a dozen shops over the years. Andy's is the only one where I never wonder if I'm being upsold. They show me what's wrong, explain why, and let me decide.",
    author: "Jim F.",
    role: "Owner · Classic + commercial vehicles",
  },
  {
    quote:
      "Honest. Reliable. And the work is dead-on. Stuart's done a half-dozen repairs for me and every one was right the first time. That's rare.",
    author: "Angel O.",
    role: "Repeat customer",
  },
];

function Testimonials() {
  return (
    <section
      className="relative overflow-hidden bg-white text-[var(--mkt-ink)]"
      style={{ minHeight: "min(900px, 95vh)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/images/testimonials-bg.jpg')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/70 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--mkt-gold)]/30 bg-[var(--mkt-gold)]/10 px-3 py-1.5">
              <Star className="h-3 w-3 fill-[var(--mkt-yellow)] text-[var(--mkt-yellow)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
                5.0 · 25+ Google reviews
              </span>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mkt-display mt-5 text-4xl md:text-5xl">
              Real fleet owners.
              <br />
              <span className="text-[var(--mkt-gold)]">Real reviews.</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.author} delay={i * 100}>
              <figure className="group flex h-full flex-col rounded-2xl border border-[var(--mkt-border-light)] bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--mkt-gold)]/40 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <Quote
                    className="h-8 w-8 text-[var(--mkt-gold)]"
                    strokeWidth={1.5}
                  />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-3.5 w-3.5 fill-[var(--mkt-yellow)] text-[var(--mkt-yellow)]"
                      />
                    ))}
                  </div>
                </div>
                <blockquote className="mt-6 flex-1 text-base leading-relaxed text-[var(--mkt-ink)]/85">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--mkt-border-light)] pt-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--mkt-gold)] text-sm font-black text-white">
                    {t.author
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-black text-[var(--mkt-ink)]">{t.author}</div>
                    <div className="text-[11px] text-[var(--mkt-text-on-light-muted)]">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div className="mt-12 text-center">
            <a
              href="https://goo.gl/maps/s1Bk7rNLzCFT978s9"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[var(--mkt-gold)] hover:text-[var(--mkt-ink)]"
            >
              Read all Google reviews
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// FAQ accordion
// ----------------------------------------------------------------------------

const FAQS = [
  {
    tag: "The fit",
    q: "What types of businesses typically work with Andy's?",
    a: "Fleets of 3 to 20 vehicles is our sweet spot. Most customers are in HVAC, landscape, pest control, construction, pool service, delivery, security, medical, school / government, moving, custodial, plumbing, and food service. If your business doesn't fit that list - call us anyway.",
  },
  {
    tag: "The math",
    q: "How does Andy's save my company money?",
    a: "Four ways. First, your trucks stay on the road making revenue instead of sitting at a shop. Second, our preventative maintenance catches small problems before they become expensive ones. Third, regular service extends the life of your fleet. Fourth, properly inflated tires and tuned engines consume less fuel.",
  },
  {
    tag: "The difference",
    q: "How is Andy's different from other fleet maintenance providers?",
    a: "Two things. We come to you - most shops force you to deliver. And we don't rotate the technician working on your fleet. The same team services your trucks every time, so they actually learn your vehicles, your modifications, and your preferences.",
  },
  {
    tag: "The people",
    q: "How does Andy's attract and retain quality technicians?",
    a: "We pay our techs what they're worth, offer profit sharing, and treat them like family. The result is consistency: customers see the same faces year after year, and the tech who serviced your truck last quarter is the one diagnosing it today.",
  },
  {
    tag: "The hours",
    q: "Do you handle after-hours or emergency service?",
    a: "Yes. Active fleet customers get a 24/7 dispatch line. Most off-hour calls get a same-day response, even on weekends. Our team is structured to keep your business running, not just our shop.",
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section className="relative overflow-hidden bg-white py-24 md:py-32">
      {/* Decorative watermark */}
      <div
        aria-hidden
        className="mkt-display pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none text-[180px] font-black uppercase leading-none tracking-tighter text-[var(--mkt-paper-soft)] md:text-[280px]"
      >
        FAQ
      </div>
      {/* Diagonal accent stripes */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-40 w-40 rotate-12 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--mkt-ink) 0 2px, transparent 2px 12px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-20 left-0 h-40 w-40 -rotate-12 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--mkt-gold) 0 2px, transparent 2px 12px)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 md:px-6">
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-[var(--mkt-yellow)] to-[var(--mkt-gold)]" />
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--mkt-gold-deep)]">
                <Sparkles className="h-3 w-3" />
                Frequently asked
              </span>
              <span className="h-px w-10 bg-gradient-to-l from-[var(--mkt-yellow)] to-[var(--mkt-gold)]" />
            </div>
            <h2 className="mkt-display mt-4 text-4xl text-[var(--mkt-ink)] md:text-6xl">
              The honest{" "}
              <span className="italic text-[var(--mkt-gold)]">answers.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-[var(--mkt-text-on-light-muted)] md:text-base">
              No corporate-speak. No fine print. Just straight talk from the
              shop floor.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            const num = String(i + 1).padStart(2, "0");
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div
                  className={clsx(
                    "group relative overflow-hidden rounded-xl border bg-white transition-all duration-500",
                    isOpen
                      ? "border-[var(--mkt-ink)] shadow-[0_8px_30px_-12px_rgba(225,6,0,0.25)]"
                      : "border-[var(--mkt-border-light)] hover:border-[var(--mkt-ink)]/40 hover:shadow-sm",
                  )}
                >
                  {/* Left accent bar */}
                  <span
                    aria-hidden
                    className={clsx(
                      "absolute inset-y-0 left-0 w-1 transition-all duration-500",
                      isOpen
                        ? "bg-[var(--mkt-gold)]"
                        : "bg-transparent group-hover:bg-[var(--mkt-gold)]/30",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left md:gap-6"
                  >
                    <span
                      className={clsx(
                        "mkt-display shrink-0 text-xl font-black tabular-nums transition-colors duration-500 md:text-2xl",
                        isOpen
                          ? "text-[var(--mkt-gold)]"
                          : "text-[var(--mkt-ink)]/25 group-hover:text-[var(--mkt-ink)]/50",
                      )}
                    >
                      {num}
                    </span>
                    <div className="flex-1">
                      <span
                        className={clsx(
                          "block text-[9px] font-black uppercase tracking-[0.25em] transition-colors duration-300",
                          isOpen
                            ? "text-[var(--mkt-gold-deep)]"
                            : "text-[var(--mkt-text-on-light-muted)]",
                        )}
                      >
                        {f.tag}
                      </span>
                      <span className="mt-1 block text-base font-black text-[var(--mkt-ink)] md:text-lg">
                        {f.q}
                      </span>
                    </div>
                    <span
                      className={clsx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                        isOpen
                          ? "rotate-[135deg] border-[var(--mkt-gold)] bg-[var(--mkt-ink)] text-[var(--mkt-gold)]"
                          : "border-[var(--mkt-border-light)] bg-white text-[var(--mkt-ink)] group-hover:border-[var(--mkt-ink)]",
                      )}
                    >
                      <span className="text-2xl leading-none">+</span>
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-500 ease-out"
                    style={{
                      maxHeight: isOpen ? 500 : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="px-6 pb-6 pl-[3.5rem] md:pl-[4.5rem]">
                      <div className="border-l-2 border-[var(--mkt-gold)]/30 pl-4">
                        <p className="text-sm leading-relaxed text-[var(--mkt-text-on-light-muted)] md:text-base">
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Closing CTA */}
        <Reveal delay={300}>
          <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl border border-[var(--mkt-border-light)] bg-[var(--mkt-paper-soft)] px-6 py-8 text-center md:flex-row md:justify-between md:gap-4 md:text-left">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--mkt-ink)] text-[var(--mkt-gold)]">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold-deep)]">
                  Still got questions?
                </div>
                <div className="mt-0.5 text-base font-black text-[var(--mkt-ink)]">
                  Talk to a human who's actually turned a wrench.
                </div>
              </div>
            </div>
            <Link
              to="/contact"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--mkt-ink)] px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-[var(--mkt-gold)] transition-all hover:bg-[var(--mkt-gold)] hover:text-[var(--mkt-ink)]"
            >
              Call the shop
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Final CTA
// ----------------------------------------------------------------------------

function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      {/* Decorative pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 16px)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 text-center md:px-6">
        <Reveal>
          <span
            aria-hidden
            className="mx-auto mb-5 block h-1 w-12 rounded-full bg-[var(--mkt-yellow)]"
          />
        </Reveal>
        <Reveal>
          <h2 className="mkt-display text-4xl text-[var(--mkt-ink)] md:text-6xl">
            Ready to put us
            <br />
            to work?
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mx-auto mt-6 max-w-2xl text-base text-[var(--mkt-ink)]/80 md:text-lg">
            Tell us what's wrong, where the truck is, and when you need it
            back. Most calls dispatched the same day.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="tel:+19042075191"
              className="group inline-flex items-center gap-3 rounded-md bg-[var(--mkt-ink)] px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-2xl shadow-[var(--mkt-ink)]/30 transition-all hover:shadow-3xl"
            >
              <Phone className="h-4 w-4" strokeWidth={3} />
              <span className="tabular-nums">(904) 207-5191</span>
            </a>
          </div>
        </Reveal>

        {/* Trust strip */}
        <Reveal delay={500}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[var(--mkt-ink)]/15 pt-8 text-[11px] font-bold uppercase tracking-wider text-[var(--mkt-ink)]/75">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Mon–Fri 7:30–6:00
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Sat 9:00–1:00
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              24/7 fleet dispatch
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Jacksonville &amp; surrounding
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
