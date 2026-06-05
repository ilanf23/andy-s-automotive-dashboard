import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Linkedin,
  Video,
  Star,
  ArrowRight,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/lib/motion";

export function PublicFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribe = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Subscribed", { description: "Welcome to shop updates" });
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-[var(--mkt-ink)] text-[var(--mkt-text-on-dark)]">
      {/* Decorative top edge — red primary with yellow accent flanks */}
      <div className="flex h-[3px] w-full">
        <div className="h-full flex-1 bg-gradient-to-r from-transparent via-[var(--mkt-yellow)]/70 to-[var(--mkt-gold)]" />
        <div className="h-full w-24 bg-[var(--mkt-gold)]" />
        <div className="h-full flex-1 bg-gradient-to-l from-transparent via-[var(--mkt-yellow)]/70 to-[var(--mkt-gold)]" />
      </div>

      {/* Pre-footer CTA band */}
      <Reveal>
        <div className="border-b border-[var(--mkt-border-dark)]">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center md:px-6">
            <div>
              <h3 className="mkt-display text-3xl md:text-4xl">
                Truck down?
                <br />
                <span className="text-[var(--mkt-gold)]">We'll come to you.</span>
              </h3>
              <p className="mt-2 text-sm text-[var(--mkt-text-on-dark-muted)]">
                Mobile service · after-hours · weekends. Most calls dispatched the same day.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:+19042075191"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[var(--mkt-gold)] px-6 py-3 text-sm font-black uppercase tracking-wider text-[var(--mkt-ink)] shadow-lg shadow-[var(--mkt-gold)]/20 transition-all hover:shadow-xl hover:shadow-[var(--mkt-gold)]/30"
              >
                <Phone className="h-4 w-4" strokeWidth={3} />
                <span className="tabular-nums">(904) 207-5191</span>
              </a>
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-md border-2 border-white/30 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors hover:border-white hover:bg-white/10"
              >
                Get a Quote
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand block */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md border-2 border-[var(--mkt-gold)] text-base font-black text-[var(--mkt-gold)]">
                A
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-black tracking-tight">
                  ANDY'S<span className="ml-1.5 text-[var(--mkt-gold)]">ATS</span>
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Automotive &amp; Truck Services
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[var(--mkt-text-on-dark-muted)]">
              Jacksonville's fleet maintenance and management partner. We
              service your trucks where they live - your shop, your jobsite,
              your driveway. NAPA-affiliated, family-run, transparent in every
              estimate.
            </p>

            {/* Google rating badge */}
            <div className="mt-5 inline-flex items-center gap-3 rounded-md border border-[var(--mkt-border-dark)] bg-white/[0.03] px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--mkt-gold)] text-xs font-black text-[var(--mkt-ink)]">
                5.0
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-3 w-3 fill-[var(--mkt-yellow)] text-[var(--mkt-yellow)]"
                    />
                  ))}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/55">
                  25+ Google Reviews
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <SocialIcon icon={Facebook} href="https://www.facebook.com/AndysATS" />
              <SocialIcon icon={Linkedin} href="https://www.linkedin.com/company/andysats/" />
              <SocialIcon icon={Video} href="https://vimeo.com/AndysATS" />
            </div>
          </div>

          {/* Services */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
              Services
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <FooterLink to="/services" hash="mobile-fleet-service">
                Mobile Fleet Service
              </FooterLink>
              <FooterLink to="/services" hash="pickup-and-drop-off">
                Pickup &amp; Drop-off
              </FooterLink>
              <FooterLink to="/services" hash="preventative-maintenance">
                Preventative Maintenance
              </FooterLink>
              <FooterLink to="/services" hash="diesel-and-heavy-duty">
                Diesel &amp; Heavy Duty
              </FooterLink>
              <FooterLink to="/services" hash="engine-and-transmission">
                Engine &amp; Transmission
              </FooterLink>
              <FooterLink to="/services" hash="after-hours">
                After-Hours Service
              </FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
              Company
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <FooterLink to="/about" hash="about-andys">
                About Andy's
              </FooterLink>
              <FooterLink to="/about" hash="our-values">
                Our Values
              </FooterLink>
              <FooterLink to="/about" hash="the-team">
                The Team
              </FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/login">Staff Login</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
              Reach the Shop
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-gold)]" />
                <div>
                  <a
                    href="tel:+19042075191"
                    className="font-bold tabular-nums hover:text-[var(--mkt-gold)]"
                  >
                    (904) 207-5191
                  </a>
                  <div className="text-[11px] text-[var(--mkt-text-on-dark-faint)]">
                    Day or night for active fleet customers
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-gold)]" />
                <a
                  href="mailto:service@AndysATS.com"
                  className="font-medium hover:text-[var(--mkt-gold)]"
                >
                  service@AndysATS.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-gold)]" />
                <span className="text-[var(--mkt-text-on-dark-muted)]">
                  Serving Jacksonville &amp; surrounding areas
                  <br />
                  <span className="text-[11px] text-[var(--mkt-text-on-dark-faint)]">
                    Mobile service · pickup &amp; drop-off
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-gold)]" />
                <span>
                  <span className="block text-[var(--mkt-text-on-dark-muted)]">
                    Mon–Fri 7:30AM – 6:00PM
                  </span>
                  <span className="block text-[var(--mkt-text-on-dark-muted)]">
                    Sat 9:00AM – 1:00PM
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--mkt-gold)]">
                    + 24/7 fleet dispatch
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--mkt-border-dark)] bg-white/[0.02] p-6 md:flex-row md:items-center md:p-7">
          <div>
            <h4 className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--mkt-yellow)]" />
              Shop updates
            </h4>
            <p className="mt-1.5 text-sm text-[var(--mkt-text-on-dark-muted)]">
              Fleet tips, seasonal reminders, and shop news - once a month.
            </p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubscribe();
                }
              }}
              placeholder="your@email.com"
              className="flex-1 rounded-md border border-[var(--mkt-border-dark)] bg-[var(--mkt-ink)] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--mkt-gold)]"
            />
            <button
              type="button"
              onClick={handleSubscribe}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--mkt-gold)] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[var(--mkt-ink)] shadow-lg shadow-[var(--mkt-gold)]/15 transition-shadow hover:shadow-xl hover:shadow-[var(--mkt-gold)]/25"
            >
              <Send className="h-3.5 w-3.5" />
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-[var(--mkt-border-dark)] pt-6 text-[11px] text-[var(--mkt-text-on-dark-faint)] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Andy's Automotive &amp; Truck Services,
            LLC. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-2">
            <span>NAPA-affiliated · Insured · Florida licensed</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  to,
  hash,
  children,
}: {
  to: string;
  hash?: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={to as string}
        hash={hash}
        className="inline-block text-[var(--mkt-text-on-dark-muted)] transition-colors hover:text-[var(--mkt-gold)]"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({
  icon: Icon,
  href,
}: {
  icon: typeof Facebook;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--mkt-border-dark)] bg-white/[0.02] text-white/55 transition-all hover:border-[var(--mkt-gold)] hover:bg-[var(--mkt-gold)]/10 hover:text-[var(--mkt-gold)]"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
