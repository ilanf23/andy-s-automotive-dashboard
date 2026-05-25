import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Check,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/lib/motion";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    vehicleCount: "",
    issue: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.issue) {
      toast.error("Please fill in name, phone, and issue");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Request received — we'll call you within 1 business hour");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--mkt-ink)] pb-20 pt-40 text-white md:pt-48">
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--mkt-gold)]">
              Get in touch
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="mkt-display mt-4 max-w-3xl text-5xl md:text-7xl">
              Tell us what's wrong.
              <br />
              <span className="text-[var(--mkt-gold)]">
                We'll tell you when we'll fix it.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              Quickest path: call us. If you'd rather type, use the form
              below — we'll call you back within one business hour.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Form + Side rail */}
      <section className="bg-[var(--mkt-paper-soft)] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <Reveal>
              <div>
                {submitted ? (
                  <div className="rounded-3xl border border-[var(--mkt-gold)]/30 bg-white p-10 text-center shadow-lg md:p-14">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--mkt-gold)] shadow-xl shadow-[var(--mkt-gold)]/30">
                      <Check
                        className="h-10 w-10 text-[var(--mkt-ink)]"
                        strokeWidth={3}
                      />
                    </div>
                    <h2 className="mkt-display mt-8 text-3xl text-[var(--mkt-ink)] md:text-4xl">
                      Got it, {form.name.split(" ")[0]}.
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-base text-[var(--mkt-text-on-light-muted)]">
                      We'll call you at{" "}
                      <span className="font-black tabular-nums text-[var(--mkt-ink)]">
                        {form.phone}
                      </span>{" "}
                      within one business hour. If it's after hours and it's
                      urgent fleet dispatch:
                    </p>
                    <a
                      href="tel:+19042075191"
                      className="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--mkt-ink)] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg hover:shadow-xl"
                    >
                      <Phone className="h-4 w-4" strokeWidth={3} />
                      (904) 207-5191
                    </a>
                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(false);
                          setForm({
                            name: "",
                            company: "",
                            phone: "",
                            email: "",
                            vehicleCount: "",
                            issue: "",
                          });
                        }}
                        className="text-[11px] font-bold uppercase tracking-wider text-[var(--mkt-text-on-light-muted)] hover:text-[var(--mkt-ink)]"
                      >
                        Submit another request
                      </button>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-[var(--mkt-border-light)] bg-white p-8 shadow-sm md:p-10"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[var(--mkt-gold-deep)]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold-deep)]">
                        Service Request
                      </span>
                    </div>
                    <h2 className="mkt-display mt-2 text-3xl text-[var(--mkt-ink)]">
                      Let's get your truck
                      <br />
                      back on the road.
                    </h2>

                    <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <Field
                        label="Your name *"
                        value={form.name}
                        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                        placeholder="John Smith"
                      />
                      <Field
                        label="Company"
                        value={form.company}
                        onChange={(v) => setForm((f) => ({ ...f, company: v }))}
                        placeholder="ABC Fleet Co."
                      />
                      <Field
                        label="Phone *"
                        type="tel"
                        value={form.phone}
                        onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                        placeholder="(904) 555-0100"
                      />
                      <Field
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                        placeholder="you@company.com"
                      />
                    </div>

                    <div className="mt-5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
                        Fleet size
                      </label>
                      <select
                        value={form.vehicleCount}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, vehicleCount: e.target.value }))
                        }
                        className="mt-1.5 w-full rounded-md border border-[var(--mkt-border-light)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--mkt-ink)] focus:ring-2 focus:ring-[var(--mkt-ink)]/20"
                      >
                        <option value="">Select…</option>
                        <option>1 vehicle</option>
                        <option>2-5 vehicles</option>
                        <option>6-10 vehicles</option>
                        <option>11-20 vehicles</option>
                        <option>20+ vehicles</option>
                      </select>
                    </div>

                    <div className="mt-5">
                      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
                        What's going on? *
                      </label>
                      <textarea
                        value={form.issue}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, issue: e.target.value }))
                        }
                        rows={4}
                        placeholder="Describe what's happening — symptoms, fault codes, anything you've already tried. More detail = faster diagnosis."
                        className="mt-1.5 w-full resize-none rounded-md border border-[var(--mkt-border-light)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--mkt-ink)] focus:ring-2 focus:ring-[var(--mkt-ink)]/20"
                      />
                    </div>

                    <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[var(--mkt-border-light)] pt-6 sm:flex-row sm:items-center">
                      <p className="max-w-xs text-[10px] text-[var(--mkt-text-on-light-muted)]">
                        By submitting you agree to be contacted about your
                        request. We'll never share your info.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-[var(--mkt-ink)] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Sending
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Request
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>

            {/* Side rail */}
            <aside className="space-y-4">
              <Reveal delay={100}>
                <div className="rounded-2xl bg-[var(--mkt-ink)] p-6 text-white shadow-lg">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold)]">
                    Or just call us
                  </h3>
                  <a
                    href="tel:+19042075191"
                    className="group mt-3 flex items-center gap-3"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--mkt-gold)] text-[var(--mkt-ink)] transition-transform group-hover:scale-110">
                      <Phone className="h-5 w-5" strokeWidth={3} />
                    </span>
                    <div>
                      <div className="text-xl font-black tabular-nums group-hover:text-[var(--mkt-gold)]">
                        (904) 207-5191
                      </div>
                      <div className="text-[10px] text-white/55">
                        24/7 for active fleet customers
                      </div>
                    </div>
                  </a>
                  <div className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm">
                    <ContactRow icon={Mail} label="service@AndysATS.com" href="mailto:service@AndysATS.com" />
                    <ContactRow
                      icon={MapPin}
                      label="Jacksonville & surrounding"
                      sub="Mobile · pickup & drop-off"
                    />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={180}>
                <div className="rounded-2xl border border-[var(--mkt-border-light)] bg-white p-6">
                  <h3 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold-deep)]">
                    <Clock className="h-3 w-3" />
                    Hours
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-[var(--mkt-text-on-light-muted)]">Mon–Fri</span>
                      <span className="font-black tabular-nums text-[var(--mkt-ink)]">7:30 – 6:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--mkt-text-on-light-muted)]">Saturday</span>
                      <span className="font-black tabular-nums text-[var(--mkt-ink)]">9:00 – 1:00</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--mkt-text-on-light-muted)]">Sunday</span>
                      <span className="font-semibold text-[var(--mkt-text-on-light-muted)]/60">Closed</span>
                    </li>
                  </ul>
                  <div className="mt-4 flex items-start gap-2 rounded-md bg-[var(--mkt-gold)]/15 px-3 py-2 text-[11px] text-[var(--mkt-gold-deep)]">
                    <Shield className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                      <strong>24/7 fleet dispatch line</strong> for active fleet customers.
                    </span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={260}>
                <div className="rounded-2xl border border-[var(--mkt-border-light)] bg-white p-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--mkt-gold-deep)]">
                    What happens next
                  </h3>
                  <ol className="mt-4 space-y-3 text-xs">
                    {[
                      { n: 1, t: "We call within 1 hr", b: "Cameron or Andy picks up — no call center." },
                      { n: 2, t: "Schedule mobile/pickup", b: "Most jobs we dispatch same-day." },
                      { n: 3, t: "Estimate w/ photos", b: "Inspection is digital. No surprises." },
                      { n: 4, t: "Truck back on road", b: "Most jobs done in 2-3 business days." },
                    ].map((step) => (
                      <li key={step.n} className="flex items-start gap-2.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--mkt-ink)] text-[10px] font-black text-[var(--mkt-gold)]">
                          {step.n}
                        </span>
                        <div>
                          <div className="font-black text-[var(--mkt-ink)]">{step.t}</div>
                          <div className="text-[var(--mkt-text-on-light-muted)]">{step.b}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-[var(--mkt-paper)] py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl border border-[var(--mkt-border-light)] bg-[var(--mkt-ink)]">
              <div className="relative text-center text-white">
                <MapPin className="mx-auto h-10 w-10 text-[var(--mkt-gold)]" />
                <p className="mt-3 text-sm font-bold">
                  Service area: Jacksonville &amp; surrounding · 50+ mile radius
                </p>
                <p className="mt-1 text-[11px] text-white/60">
                  Mobile and pickup service across Duval, Clay, Nassau, and St. Johns counties.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-wider text-[var(--mkt-text-on-light-muted)]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-[var(--mkt-border-light)] bg-white px-3.5 py-3 text-sm outline-none focus:border-[var(--mkt-ink)] focus:ring-2 focus:ring-[var(--mkt-ink)]/20"
      />
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  sub,
  href,
}: {
  icon: typeof Phone;
  label: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mkt-gold)]" />
      <div>
        <div className="font-bold text-white">{label}</div>
        {sub && <div className="text-[10px] text-white/55">{sub}</div>}
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:text-[var(--mkt-gold)]">
      {inner}
    </a>
  ) : (
    inner
  );
}
