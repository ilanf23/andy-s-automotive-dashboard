import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Wrench,
  Zap,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  Phone,
  MapPin,
} from "lucide-react";
import { Reveal, AnimatedCounter } from "@/lib/motion";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
});

const SERVICES = [
  {
    icon: Truck,
    category: "On-site",
    title: "Mobile Fleet Maintenance",
    blurb:
      "We bring the shop to you. Routine maintenance and minor diagnostics performed at your yard, jobsite, or driveway — so your trucks never leave production.",
    image:
      "https://images.unsplash.com/photo-1551522435-a13afa10f103?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Busy auto shop floor with multiple vehicles being serviced",
    includes: [
      "Oil and filter service",
      "Tire rotation and pressure checks",
      "Brake inspection",
      "Fluid top-offs and flushes",
      "Diagnostic scans and code reads",
      "Battery and electrical checks",
    ],
  },
  {
    icon: Sparkles,
    category: "Pickup & Drop-off",
    title: "We pick up. We bring it back.",
    blurb:
      "For repairs that need shop time, we send a driver. You don't pull two employees off a jobsite to deliver a broken truck.",
    image:
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Vehicle parked inside a service garage",
    includes: [
      "Pickup from your yard or jobsite",
      "Photo handoff at our shop",
      "Estimate sent same day",
      "Drop-off when service is complete",
      "Service radius across Jacksonville + surrounding areas",
      "Insured during transport",
    ],
  },
  {
    icon: Wrench,
    category: "Heavy Mechanical",
    title: "Engine, Transmission & Drivetrain",
    blurb:
      "Diesel and gas, light to heavy duty. From regular service to full engine or transmission replacement — done right the first time.",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Close-up of engine belts and pulleys",
    includes: [
      "Engine rebuild and replacement",
      "Automatic + manual transmission service",
      "Drivetrain, differential, axle work",
      "Cooling system service",
      "Belt, hose, and serpentine replacement",
      "Timing service",
    ],
  },
  {
    icon: Zap,
    category: "Electrical & Diagnostics",
    title: "Diagnostics that actually find the problem.",
    blurb:
      "Modern scan tools paired with old-school know-how. Most shops chase codes. We chase root causes.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Vehicles on lifts inside a diagnostic bay",
    includes: [
      "Full OBD-II + heavy-duty diagnostic scans",
      "Wiring harness repair and tracing",
      "Battery, alternator, starter testing",
      "ABS, traction control, ECM programming",
      "Aftermarket equipment integration",
      "Module reset and key programming",
    ],
  },
  {
    icon: Shield,
    category: "Safety & Wear",
    title: "Brakes, Tires & Suspension",
    blurb:
      "The systems that keep your driver safe and your truck legal. Full inspection, transparent recommendations, no upsell.",
    image:
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Vehicle on the road showcasing braking and suspension",
    includes: [
      "Brake pad, rotor, drum, and shoe service",
      "Air brake systems for heavy duty",
      "Tire mounting, balancing, rotation",
      "Front-end alignment",
      "Steering and suspension repair",
      "Shock and strut replacement",
    ],
  },
  {
    icon: Clock,
    category: "Preventative Maintenance",
    title: "Scheduled before it breaks.",
    blurb:
      "We track your fleet's service intervals so you don't have to. Mileage-based, hour-based, or calendar-based — whatever fits your operation.",
    image:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Mechanic pouring fluid into an engine bay during scheduled service",
    includes: [
      "Custom maintenance schedules per vehicle",
      "Automated service reminders",
      "Pre-scheduled mobile or pickup service",
      "Service history recordkeeping",
      "Annual fleet reviews",
      "DOT inspection paperwork on file",
    ],
  },
];

function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--mkt-ink)] pb-24 pt-40 text-white md:pt-48">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 70% 40%, rgba(255,199,44,0.08), transparent 55%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold)]">
              Services
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mkt-display mt-4 max-w-3xl text-5xl md:text-7xl">
              Six service categories.
              <br />
              <span className="text-[var(--mkt-gold)]">Hundreds of variations.</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              If it has wheels and an engine and your business depends on it,
              we work on it. Mobile, in-shop, after-hours — we structure
              service around your operation, not ours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Services list */}
      <section className="bg-[var(--mkt-paper)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="space-y-16 md:space-y-24">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              const isEven = i % 2 === 0;
              return (
                <Reveal key={s.title}>
                  <div
                    className={`grid grid-cols-1 items-start gap-8 lg:grid-cols-[400px_1fr] ${
                      isEven ? "" : "lg:grid-cols-[1fr_400px]"
                    }`}
                  >
                    {/* Visual side */}
                    <div className={isEven ? "" : "lg:order-2"}>
                      <div className="group relative aspect-square overflow-hidden rounded-3xl bg-[var(--mkt-ink)] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
                        <img
                          src={s.image}
                          alt={s.imageAlt}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--mkt-ink)]/85 to-transparent" />
                        <div className="relative flex h-full flex-col justify-between p-8">
                          <div className="flex items-start justify-between">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--mkt-gold)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-ink)]">
                              {s.category}
                            </div>
                            <div className="rounded-full bg-[var(--mkt-ink)]/70 p-3 ring-1 ring-white/10 backdrop-blur-sm">
                              <Icon
                                className="h-6 w-6 text-[var(--mkt-gold)]"
                                strokeWidth={1.6}
                              />
                            </div>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                            {String(i + 1).padStart(2, "0")} of{" "}
                            {String(SERVICES.length).padStart(2, "0")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content side */}
                    <div className={isEven ? "" : "lg:order-1"}>
                      <h2 className="mkt-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
                        {s.title}
                      </h2>
                      <p className="mt-5 text-base leading-relaxed text-[var(--mkt-text-on-light-muted)] md:text-lg">
                        {s.blurb}
                      </p>

                      <h3 className="mt-8 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold-deep)]">
                        What's included
                      </h3>
                      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
                        {s.includes.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-gold-deep)]" />
                            <span className="text-[var(--mkt-ink)]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mid-page stat band */}
      <section className="bg-[var(--mkt-paper-soft)] py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 170, suffix: "+", label: "Trucks/month" },
              { value: 50, suffix: "+ mi", label: "Service radius" },
              { value: 13, suffix: "", label: "Industries" },
              { value: 24, suffix: "/7", label: "Fleet dispatch" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="text-center">
                  <div className="text-4xl font-black tabular-nums text-[var(--mkt-ink)] md:text-5xl">
                    <AnimatedCounter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
                    {s.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-[var(--mkt-gold)]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center md:px-6 md:py-16">
          <div>
            <h2 className="mkt-display text-3xl text-[var(--mkt-ink)] md:text-4xl">
              Don't see your job listed?
            </h2>
            <p className="mt-2 text-base text-[var(--mkt-ink)]/80">
              We've taken on plenty of things we couldn't put in a brochure.
              Call us — odds are we've seen something like it.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:+19042075191"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--mkt-ink)] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl"
            >
              <Phone className="h-4 w-4" strokeWidth={3} />
              <span className="tabular-nums">(904) 207-5191</span>
            </a>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-md border-2 border-[var(--mkt-ink)] bg-transparent px-6 py-3.5 text-sm font-black uppercase tracking-wider text-[var(--mkt-ink)] hover:bg-[var(--mkt-ink)] hover:text-[var(--mkt-gold)]"
            >
              Get a Quote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
