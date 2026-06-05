import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Shield,
  Eye,
  Handshake,
  Quote,
  Star,
  Phone,
  Award,
  Users,
  Heart,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Reveal, AnimatedCounter, Marquee, Parallax } from "@/lib/motion";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const TEAM = [
  {
    name: "Andy Andrews",
    role: "Co-Founder · Owner",
    initials: "AA",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=faces&q=80",
  },
  {
    name: "Stuart",
    role: "Co-Founder · Lead Technician",
    initials: "ST",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop&crop=faces&q=80",
  },
  {
    name: "Cody",
    role: "Service & Customer Care",
    initials: "CD",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=faces&q=80",
  },
  {
    name: "Cameron",
    role: "Service Advisor",
    initials: "CM",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop&crop=faces&q=80",
  },
  {
    name: "Marcus",
    role: "Diesel Specialist",
    initials: "MR",
    photo:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&h=600&fit=crop&crop=faces&q=80",
  },
  {
    name: "Jose",
    role: "Hydraulics Specialist",
    initials: "JA",
    photo:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&crop=faces&q=80",
  },
  {
    name: "Andre",
    role: "Electrical Specialist",
    initials: "AB",
    photo:
      "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600&h=600&fit=crop&crop=faces&q=80",
  },
  {
    name: "Trevor",
    role: "General Technician",
    initials: "TH",
    photo:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=600&fit=crop&crop=faces&q=80",
  },
];

const SHOP_GALLERY = [
  "https://images.unsplash.com/photo-1551830820-330a71b99659?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610647929723-a8922852cd44?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1554734867-bf3c00a49371?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1601252300554-4ad551483bd2?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1605504835488-e8c6d37beb43?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1619025873875-59dfdd2bbbd6?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1624339024061-b435d9261c1d?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1612057473117-3e16246121e6?w=600&h=800&fit=crop&q=80",
];

const VALUES = [
  {
    icon: Shield,
    title: "Safety",
    body: "We view safety as the foundation - for your vehicles, your employees, and everyone on the road. If we wouldn't put our own family in it, it doesn't leave the shop.",
  },
  {
    icon: Eye,
    title: "Transparency",
    body: "We explain what's wrong, why it happened, and what could go wrong if you skip it. The estimate is the start of a conversation, never a surprise.",
  },
  {
    icon: Handshake,
    title: "Partnership",
    body: "When your truck rolls down the freeway, we think 'there goes our truck.' Your uptime is our scoreboard. Your growth is our win.",
  },
];

function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--mkt-ink)] pb-24 pt-40 text-white md:pt-48">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse at 30% 30%, rgba(255,199,44,0.08), transparent 60%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-[1.1fr_0.9fr] md:px-6">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold)]">
                <span aria-hidden className="h-px w-6 bg-[var(--mkt-yellow)]" />
                About Andy's
              </span>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mkt-display mt-4 max-w-4xl text-5xl md:text-7xl">
                The shop we built
                <br />
                <span className="text-[var(--mkt-gold)]">for fleet owners</span>
                <br />
                like ourselves.
              </h1>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
                Andy Andrews started this shop after years of watching fleet
                owners waste time, money, and patience on mechanic shops that
                didn't put them first. A decade later, we're still building the
                shop we wished we'd had on the other side of the counter.
              </p>
            </Reveal>
          </div>

          <Reveal direction="left" delay={200} duration={900}>
            <div className="relative">
              <Parallax speed={0.15}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1649793395985-967862a3b73f?w=900&h=1100&fit=crop&q=80"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1686715018049-f73970aa97d3?w=900&h=1100&fit=crop&q=80";
                    }}
                    alt="Silver RAM pickup truck serviced by Andy's ATS"
                    className="h-full w-full object-cover transition-transform duration-[1500ms] hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--mkt-ink)]/60 via-transparent to-transparent" />
                </div>
              </Parallax>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sliding shop gallery */}
      <section className="relative overflow-hidden bg-[var(--mkt-ink)] py-12">
        <Marquee speedSec={45}>
          {SHOP_GALLERY.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                toast.info("Gallery", {
                  description: "Full gallery - coming soon",
                })
              }
              className="mx-3 block h-64 w-80 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/10 transition-shadow hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mkt-gold)]"
              aria-label="Open shop gallery"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </Marquee>
      </section>

      {/* Founder quote */}
      <section className="relative bg-[var(--mkt-paper)] py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <Reveal>
            <Quote
              className="mx-auto h-12 w-12 text-[var(--mkt-gold)]"
              strokeWidth={1.5}
            />
          </Reveal>
          <Reveal delay={150}>
            <blockquote className="mkt-display mt-8 text-3xl leading-tight text-[var(--mkt-ink)] md:text-4xl">
              Our passion is to empower the business owner to focus on their
              end client - and not let maintenance be a distraction from that.
              Simply put, if we can safely and transparently keep your vehicle
              on the road during your business hours, we've hit success.
            </blockquote>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-[var(--mkt-gold)] ring-offset-2 ring-offset-[var(--mkt-paper)]">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=faces&q=80"
                  alt="Andy Andrews"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-left">
                <div className="text-sm font-black text-[var(--mkt-ink)]">
                  Andy Andrews
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--mkt-gold-deep)]">
                  Co-Founder · Andy's ATS
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values - Manifesto Stack */}
      <section className="relative overflow-hidden bg-[var(--mkt-ink)] text-white">
        {/* Drifting diagonal stripes */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[20%] opacity-[0.06]"
          style={{
            background:
              "repeating-linear-gradient(115deg, transparent 0 90px, var(--mkt-gold) 90px 91px, transparent 91px 180px)",
            animation: "valuesDrift 32s linear infinite",
          }}
        />
        {/* Spotlight wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[55%] h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.18] blur-[140px]"
          style={{
            background:
              "radial-gradient(closest-side, var(--mkt-gold), transparent)",
          }}
        />

        {/* Marquee ticker - top */}
        <div className="relative border-y border-white/10 bg-black/40 backdrop-blur-sm">
          <Marquee speedSec={45} pauseOnHover={false}>
            <div className="flex items-center gap-10 py-4 pr-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/45">
              <span>No compromise</span>
              <span aria-hidden className="text-[var(--mkt-gold)]">◣</span>
              <span>Safety first</span>
              <span aria-hidden className="text-[var(--mkt-gold)]">◣</span>
              <span>Transparent estimates</span>
              <span aria-hidden className="text-[var(--mkt-gold)]">◣</span>
              <span>True partnership</span>
              <span aria-hidden className="text-[var(--mkt-gold)]">◣</span>
              <span>Family standards</span>
              <span aria-hidden className="text-[var(--mkt-gold)]">◣</span>
            </div>
          </Marquee>
        </div>

        {/* Heading */}
        <div className="relative mx-auto max-w-7xl px-4 pt-24 md:px-6 md:pt-32">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_1.4fr] md:items-end">
            <Reveal>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--mkt-gold)]">
                <span className="h-px w-8 bg-[var(--mkt-gold)]" />
                Our values · 03
              </div>
              <h2 className="mkt-display mt-5 text-5xl leading-[0.92] tracking-tight md:text-7xl">
                Three things
                <br />
                <span className="font-light italic text-white/45">
                  we won't{" "}
                </span>
                <span className="relative inline-block">
                  compromise
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 right-0 h-[7px] origin-left bg-[var(--mkt-gold)]"
                    style={{
                      animation:
                        "valuesUnderline 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both",
                    }}
                  />
                </span>
                .
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="text-base leading-relaxed text-white/65 md:pb-3 md:text-lg">
                Walt Disney said "when your values are clear, your decisions
                are easy." Everything we do comes back to these three.{" "}
                <span className="text-white">
                  No exceptions, no negotiations, no asterisks.
                </span>
              </p>
            </Reveal>
          </div>
        </div>

        {/* Pillars - manifesto rows */}
        <ul className="relative mx-auto mt-20 max-w-[1500px] px-4 md:mt-24 md:px-10">
          <li
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />
          {VALUES.map((v, i) => {
            const Icon = v.icon;
            return (
              <Reveal
                key={v.title}
                as="li"
                delay={i * 120}
                className="group relative block"
              >
                <div className="relative grid grid-cols-[1fr] items-start gap-6 py-12 transition-colors duration-500 md:grid-cols-[200px_1fr_minmax(0,_2.4fr)_auto] md:gap-14 md:py-16">
                  {/* Hover-revealed scrolling title */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  >
                    <div
                      className="mkt-display absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-[160px] font-extrabold leading-none tracking-tight text-[var(--mkt-gold)]/[0.07]"
                      style={{
                        animation: "valuesScroll 22s linear infinite",
                      }}
                    >
                      {`${v.title.toUpperCase()} · ${v.title.toUpperCase()} · ${v.title.toUpperCase()} · ${v.title.toUpperCase()} · ${v.title.toUpperCase()} · `}
                    </div>
                  </div>

                  {/* Oversized numeral */}
                  <div className="relative">
                    <div
                      className="mkt-display relative inline-block text-[88px] font-black leading-none text-white/15 transition-colors duration-700 group-hover:text-[var(--mkt-gold)] md:text-[156px]"
                      style={{ letterSpacing: "-0.04em" }}
                    >
                      0{i + 1}
                      <span
                        aria-hidden
                        className="absolute -bottom-3 left-0 h-[3px] w-0 bg-[var(--mkt-gold)] transition-all duration-700 ease-out group-hover:w-full"
                      />
                    </div>
                  </div>

                  {/* Icon + title */}
                  <div className="relative">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-500 group-hover:rotate-[-8deg] group-hover:border-[var(--mkt-gold)]/50 group-hover:bg-[var(--mkt-gold)]/15">
                      <Icon
                        className="h-7 w-7 text-white/85 transition-colors duration-500 group-hover:text-[var(--mkt-gold)]"
                        strokeWidth={1.5}
                      />
                      <span
                        aria-hidden
                        className="absolute -inset-2 -z-10 rounded-2xl bg-[var(--mkt-gold)]/0 blur-xl transition-all duration-700 group-hover:bg-[var(--mkt-gold)]/30"
                      />
                    </div>
                    <h3 className="mkt-display mt-7 text-4xl leading-[0.95] tracking-tight md:text-5xl">
                      {v.title}.
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="relative md:pt-3">
                    <p className="max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
                      {v.body}
                    </p>
                    <div className="mt-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 transition-colors duration-500 group-hover:text-[var(--mkt-gold)]">
                      <span className="h-px w-6 bg-current transition-all duration-500 group-hover:w-12" />
                      Non-negotiable
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden items-start pt-4 md:flex">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:border-[var(--mkt-gold)] group-hover:bg-[var(--mkt-gold)] group-hover:text-[var(--mkt-ink)]">
                      <ArrowRight className="h-5 w-5" strokeWidth={2} />
                    </span>
                  </div>
                </div>

                {/* Row divider - lights up on hover */}
                <div
                  aria-hidden
                  className="relative h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
                >
                  <span className="absolute inset-y-0 left-0 w-0 bg-gradient-to-r from-[var(--mkt-gold)] via-[var(--mkt-gold)] to-transparent transition-all duration-1000 ease-out group-hover:w-1/2" />
                </div>
              </Reveal>
            );
          })}
        </ul>

        {/* Closing line */}
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 md:px-6 md:pb-32">
          <Reveal>
            <p className="mkt-display text-2xl leading-tight text-white/80 md:text-3xl">
              <span className="text-[var(--mkt-gold)]">↳</span> If we wouldn't
              put our own family in it,{" "}
              <span className="text-white">it doesn't leave the shop.</span>
            </p>
          </Reveal>
        </div>

        <style>{`
          @keyframes valuesDrift {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-180px, 90px); }
          }
          @keyframes valuesUnderline {
            0% { transform: scaleX(0); }
            100% { transform: scaleX(1); }
          }
          @keyframes valuesScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* Story */}
      <section className="bg-[var(--mkt-paper-soft)] py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <Reveal>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold-deep)]">
              Our story
            </span>
            <h2 className="mkt-display mt-3 text-4xl text-[var(--mkt-ink)] md:text-5xl">
              How we got here.
            </h2>
          </Reveal>

          <div className="mt-10 space-y-6 text-base leading-relaxed text-[var(--mkt-ink)]/85 md:text-lg">
            <Reveal delay={100}>
              <p>
                Andy spent years on the fleet owner's side of the counter,
                watching small problems become expensive ones because of slow
                shops, vague estimates, and inconsistent technicians. He
                started Andy's ATS to flip that experience entirely.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p>
                The first move was mobile service. If we could come to the
                customer's yard, they didn't have to send two employees and
                two trucks to deliver one broken vehicle. The second was
                consistency - same techs, same approach, every service
                interval. The third was transparency - every estimate
                explained, every recommendation reasoned.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p>
                Today we run a NAPA-affiliated shop and a mobile service
                operation that covers Jacksonville and the surrounding areas.
                Our customers don't think of us as their mechanic - they think
                of us as their fleet partner. When their truck rolls by, we
                think the same thing: "there goes our truck."
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-[var(--mkt-paper)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold-deep)]">
              The team
            </span>
            <h2 className="mkt-display mt-3 max-w-2xl text-4xl text-[var(--mkt-ink)] md:text-5xl">
              The people who actually
              <br />
              turn the wrenches.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {TEAM.map((m, i) => {
              const dir =
                i % 4 === 0
                  ? "right"
                  : i % 4 === 1
                    ? "up"
                    : i % 4 === 2
                      ? "up"
                      : "left";
              return (
                <Reveal
                  key={m.name}
                  delay={i * 80}
                  direction={dir as "up" | "left" | "right"}
                  distance={40}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(`${m.name}`, {
                        description: "Tech bio coming soon",
                      })
                    }
                    className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--mkt-border-light)] bg-white text-left transition-all duration-500 hover:-translate-y-2 hover:border-[var(--mkt-ink)]/30 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mkt-gold)]"
                    aria-label={`View bio for ${m.name}`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--mkt-ink)]">
                      <img
                        src={m.photo}
                        alt={m.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--mkt-ink)]/80 via-[var(--mkt-ink)]/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />
                      <div className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 text-left transition-transform duration-500 group-hover:translate-y-0">
                        <div className="text-base font-black leading-tight text-white">
                          {m.name}
                        </div>
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mkt-gold)]">
                          {m.role}
                        </div>
                      </div>
                      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mkt-gold)] text-[10px] font-black text-[var(--mkt-ink)] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        {m.initials}
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[var(--mkt-gold)]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 10, suffix: "+", label: "Years in business", icon: Award },
              { value: 2000, suffix: "+", label: "Trucks serviced", icon: Wrench },
              { value: 13, suffix: "", label: "Industries served", icon: Users },
              { value: 5, format: "decimal-1" as const, suffix: "★", label: "Google rating", icon: Heart },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.label} delay={i * 80}>
                  <div className="text-center">
                    <Icon
                      className="mx-auto h-7 w-7 text-[var(--mkt-ink)]/65"
                      strokeWidth={1.5}
                    />
                    <div className="mt-3 text-4xl font-black tabular-nums text-[var(--mkt-ink)] md:text-5xl">
                      <AnimatedCounter
                        to={s.value}
                        suffix={s.suffix}
                        format={s.format}
                      />
                    </div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-[var(--mkt-ink)]/75">
                      {s.label}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={400}>
            <div className="mt-12 text-center">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-md bg-[var(--mkt-ink)] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl hover:shadow-2xl"
              >
                Work with us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
