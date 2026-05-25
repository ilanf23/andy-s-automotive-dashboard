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
import { Reveal, AnimatedCounter, Marquee, Parallax } from "@/lib/motion";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const TEAM = [
  {
    name: "Andy Andrews",
    role: "Co-Founder · Owner",
    initials: "AA",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Stuart",
    role: "Co-Founder · Lead Technician",
    initials: "ST",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Cody",
    role: "Service & Customer Care",
    initials: "CD",
    photo: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    name: "Cameron",
    role: "Service Advisor",
    initials: "CM",
    photo: "https://randomuser.me/api/portraits/men/64.jpg",
  },
  {
    name: "Marcus",
    role: "Diesel Specialist",
    initials: "MR",
    photo: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    name: "Jose",
    role: "Hydraulics Specialist",
    initials: "JA",
    photo: "https://randomuser.me/api/portraits/men/83.jpg",
  },
  {
    name: "Andre",
    role: "Electrical Specialist",
    initials: "AB",
    photo: "https://randomuser.me/api/portraits/men/91.jpg",
  },
  {
    name: "Trevor",
    role: "General Technician",
    initials: "TH",
    photo: "https://randomuser.me/api/portraits/men/15.jpg",
  },
];

const SHOP_GALLERY = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=600&h=800&fit=crop&q=80",
];

const VALUES = [
  {
    icon: Shield,
    title: "Safety",
    body: "We view safety as the foundation — for your vehicles, your employees, and everyone on the road. If we wouldn't put our own family in it, it doesn't leave the shop.",
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold)]">
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
                    src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&h=1100&fit=crop&q=80"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&h=1100&fit=crop&q=80";
                    }}
                    alt="Fleet truck serviced by Andy's ATS"
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
            <div
              key={i}
              className="mx-3 h-64 w-80 shrink-0 overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
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
              end client — and not let maintenance be a distraction from that.
              Simply put, if we can safely and transparently keep your vehicle
              on the road during your business hours, we've hit success.
            </blockquote>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 flex items-center justify-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-[var(--mkt-gold)] ring-offset-2 ring-offset-[var(--mkt-paper)]">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
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

      {/* Values */}
      <section className="bg-[var(--mkt-ink)] py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <Reveal>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold)]">
                Our values
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="mkt-display mt-3 text-4xl md:text-5xl">
                Three things
                <br />
                we won't compromise on.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mx-auto mt-5 max-w-2xl text-base text-white/70">
                Walt Disney said "when your values are clear, your decisions
                are easy." Everything we do comes back to these three.
              </p>
            </Reveal>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 120}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--mkt-gold)]/40 hover:bg-white/[0.06]">
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--mkt-gold)]/10 transition-all duration-500 group-hover:bg-[var(--mkt-gold)]">
                      <Icon
                        className="h-7 w-7 text-[var(--mkt-gold)] transition-colors duration-500 group-hover:text-[var(--mkt-ink)]"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="mkt-display mt-6 text-3xl text-white">
                      {v.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      {v.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
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
                consistency — same techs, same approach, every service
                interval. The third was transparency — every estimate
                explained, every recommendation reasoned.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <p>
                Today we run a NAPA-affiliated shop and a mobile service
                operation that covers Jacksonville and the surrounding areas.
                Our customers don't think of us as their mechanic — they think
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
                  <div className="group overflow-hidden rounded-2xl border border-[var(--mkt-border-light)] bg-white transition-all duration-500 hover:-translate-y-2 hover:border-[var(--mkt-ink)]/30 hover:shadow-2xl">
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
                  </div>
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
