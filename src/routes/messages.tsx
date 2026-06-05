import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Mail,
  MoreHorizontal,
  CheckCheck,
  MessageSquare,
  Filter,
  Smile,
  X,
} from "lucide-react";
import { PageShell } from "@/components/shop/PageShell";
import clsx from "clsx";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

type Thread = {
  id: string;
  customer: string;
  vehicle?: string;
  channel: "SMS" | "Email" | "In-app";
  preview: string;
  time: string;
  unread: number;
  status: "open" | "awaiting-customer" | "resolved";
  ro?: string;
};

type Message = {
  id: string;
  from: "shop" | "customer";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
};

const initialThreads: Thread[] = [
  {
    id: "t1",
    customer: "Dana Whitfield · Med Trust",
    vehicle: "MT-47 · 2019 Ford E-450",
    channel: "SMS",
    preview: "Can we add an oil change to MT-47 while you have it?",
    time: "8m",
    unread: 2,
    status: "open",
    ro: "4847",
  },
  {
    id: "t2",
    customer: "Pat Henley · City Form",
    vehicle: "CF-304 · 2022 Isuzu NPR-HD",
    channel: "Email",
    preview: "Approved estimate EST-4847. Greenlight the work.",
    time: "47m",
    unread: 1,
    status: "open",
    ro: "4848",
  },
  {
    id: "t3",
    customer: "Sarah Hollis",
    vehicle: "2019 Toyota RAV4",
    channel: "SMS",
    preview: "Thanks! Will pick up Saturday morning around 10.",
    time: "1h",
    unread: 0,
    status: "resolved",
  },
  {
    id: "t4",
    customer: "Renee Patterson · FSCJ",
    vehicle: "FSCJ-09 · 2021 Ford F-350",
    channel: "Email",
    preview: "Need DOT inspection paperwork emailed by 5pm Friday",
    time: "2h",
    unread: 0,
    status: "awaiting-customer",
    ro: "4846",
  },
  {
    id: "t5",
    customer: "Marcus Bradley",
    vehicle: "2022 Ford F-150",
    channel: "SMS",
    preview: "What's the difference between the pads you quoted vs OEM?",
    time: "3h",
    unread: 0,
    status: "awaiting-customer",
  },
  {
    id: "t6",
    customer: "Greg O'Dell",
    vehicle: "2018 Ford F-150",
    channel: "SMS",
    preview: "Truck is making a weird noise on cold start, video attached",
    time: "5h",
    unread: 0,
    status: "open",
  },
  {
    id: "t7",
    customer: "Wes Carmichael · Reliable Ducks",
    vehicle: "RD-12 · 2020 Peterbilt 337",
    channel: "Email",
    preview: "Re: scheduled service - confirmed for next Tuesday 8am",
    time: "1d",
    unread: 0,
    status: "resolved",
  },
];

const initialConversations: Record<string, Message[]> = {
  t1: [
    {
      id: "t1-m1",
      from: "customer",
      text: "Hey Cameron - I dropped off MT-47 this morning for the brake service.",
      time: "Yesterday 8:14 AM",
    },
    {
      id: "t1-m2",
      from: "shop",
      text: "Got it Dana. Marcus has it in bay 3 now, running the inspection. Should have findings to you within 2 hours.",
      time: "Yesterday 8:22 AM",
      status: "read",
    },
    {
      id: "t1-m3",
      from: "shop",
      text: "Inspection done. We found 2 red items beyond the brake service: rear ABS sensor and a cracked DEF doser. Sending the full estimate now.",
      time: "Yesterday 10:47 AM",
      status: "read",
    },
    {
      id: "t1-m4",
      from: "customer",
      text: "Reviewing with fleet manager - back to you by EOD.",
      time: "Yesterday 11:12 AM",
    },
    {
      id: "t1-m5",
      from: "customer",
      text: "Approved on brake service + ABS sensor. Skip the DEF doser for now, we'll catch it on next visit.",
      time: "Yesterday 4:38 PM",
    },
    {
      id: "t1-m6",
      from: "shop",
      text: "Sounds good. Andre's starting on it first thing tomorrow. ETA ready for pickup Wednesday afternoon.",
      time: "Yesterday 4:51 PM",
      status: "read",
    },
    {
      id: "t1-m7",
      from: "customer",
      text: "Can we add an oil change to MT-47 while you have it?",
      time: "8m ago",
    },
    {
      id: "t1-m8",
      from: "customer",
      text: "Also - what's the cheapest option on the brake pads you quoted? Trying to keep this RO under $2k.",
      time: "8m ago",
    },
  ],
  t2: [
    {
      id: "t2-m1",
      from: "shop",
      text: "Hi Pat - estimate EST-4847 is ready for CF-304. Total comes to $3,284 covering the DPF regen, fuel filter, and front rotors. PDF attached.",
      time: "Yesterday 2:30 PM",
      status: "read",
    },
    {
      id: "t2-m2",
      from: "customer",
      text: "Looking it over now. Quick question - is the DPF regen something we could push to next service interval?",
      time: "Yesterday 3:15 PM",
    },
    {
      id: "t2-m3",
      from: "shop",
      text: "Not really - codes are showing 92% soot load. If we push it the truck will derate within ~500 miles and you'll be down hard.",
      time: "Yesterday 3:22 PM",
      status: "read",
    },
    {
      id: "t2-m4",
      from: "customer",
      text: "Understood. Approved estimate EST-4847. Greenlight the work.",
      time: "47m ago",
    },
  ],
  t3: [
    {
      id: "t3-m1",
      from: "shop",
      text: "Hi Sarah - your RAV4 is ready for pickup. Brakes, alignment, and the 60k service all wrapped up. Total was $842.",
      time: "Thursday 4:15 PM",
      status: "read",
    },
    {
      id: "t3-m2",
      from: "customer",
      text: "Awesome, thank you! I'm tied up Friday - can I grab it Saturday morning?",
      time: "Thursday 5:02 PM",
    },
    {
      id: "t3-m3",
      from: "shop",
      text: "Saturday works - we open at 8. Keys will be at the front desk.",
      time: "Thursday 5:08 PM",
      status: "read",
    },
    {
      id: "t3-m4",
      from: "customer",
      text: "Thanks! Will pick up Saturday morning around 10.",
      time: "1h ago",
    },
  ],
  t4: [
    {
      id: "t4-m1",
      from: "customer",
      text: "Hi - FSCJ-09 is due for its annual DOT inspection. Can we get it scheduled this week?",
      time: "Monday 9:14 AM",
    },
    {
      id: "t4-m2",
      from: "shop",
      text: "Yes - Thursday at 7 AM works. Plan on 3-4 hours. We'll need the current DOT paperwork on file.",
      time: "Monday 10:02 AM",
      status: "read",
    },
    {
      id: "t4-m3",
      from: "customer",
      text: "Thursday confirmed. I'll have the driver bring the binder.",
      time: "Monday 10:18 AM",
    },
    {
      id: "t4-m4",
      from: "shop",
      text: "Inspection passed - no defects. Need the signed paperwork back to you?",
      time: "Thursday 11:40 AM",
      status: "read",
    },
    {
      id: "t4-m5",
      from: "customer",
      text: "Need DOT inspection paperwork emailed by 5pm Friday - auditor is on-site Monday.",
      time: "2h ago",
    },
  ],
  t5: [
    {
      id: "t5-m1",
      from: "shop",
      text: "Hi Marcus - estimate for your F-150 front brake job is ready. Two pad options: Bosch QuietCast at $189/set or factory Motorcraft at $312/set. Rotors are still in spec.",
      time: "Today 10:14 AM",
      status: "read",
    },
    {
      id: "t5-m2",
      from: "customer",
      text: "What's the difference between the pads you quoted vs OEM?",
      time: "3h ago",
    },
  ],
  t6: [
    {
      id: "t6-m1",
      from: "customer",
      text: "Truck is making a weird noise on cold start, video attached",
      time: "5h ago",
    },
    {
      id: "t6-m2",
      from: "customer",
      text: "[Video attachment · 0:18]",
      time: "5h ago",
    },
  ],
  t7: [
    {
      id: "t7-m1",
      from: "shop",
      text: "Hi Wes - RD-12 is due for its scheduled service. We have openings Tuesday or Thursday next week.",
      time: "Yesterday 1:22 PM",
      status: "read",
    },
    {
      id: "t7-m2",
      from: "customer",
      text: "Tuesday 8 AM if you can take it then.",
      time: "Yesterday 2:08 PM",
    },
    {
      id: "t7-m3",
      from: "shop",
      text: "Booked. We'll send a reminder Monday afternoon.",
      time: "Yesterday 2:14 PM",
      status: "read",
    },
    {
      id: "t7-m4",
      from: "customer",
      text: "Re: scheduled service - confirmed for next Tuesday 8am",
      time: "1d ago",
    },
  ],
};

const filters = ["All", "Unread", "Open", "Awaiting Customer", "Resolved"] as const;

const channelFilters = ["all", "SMS", "Email", "In-app"] as const;
const templates = [
  "Ready for pickup - vehicle is done.",
  "Estimate approved - beginning work today.",
  "Past due reminder - please call us.",
];
const emojis = ["😀", "👍", "🔧", "✅", "⚠️"];

function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [conversations, setConversations] =
    useState<Record<string, Message[]>>(initialConversations);
  const [selectedId, setSelectedId] = useState<string>("t1");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [channelFilter, setChannelFilter] =
    useState<"all" | "SMS" | "Email" | "In-app">("all");
  const [draft, setDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const [newChannel, setNewChannel] = useState<"SMS" | "Email">("SMS");
  const [newBody, setNewBody] = useState("");
  const templateCursor = useRef(0);

  const selected = threads.find((t) => t.id === selectedId);
  const unreadTotal = threads.reduce((acc, t) => acc + t.unread, 0);

  const filtered = threads
    .filter((t) => {
      if (filter === "All") return true;
      if (filter === "Unread") return t.unread > 0;
      if (filter === "Open") return t.status === "open";
      if (filter === "Awaiting Customer") return t.status === "awaiting-customer";
      if (filter === "Resolved") return t.status === "resolved";
      return true;
    })
    .filter((t) => (channelFilter === "all" ? true : t.channel === channelFilter))
    .filter((t) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        t.customer.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q)
      );
    });

  const selectThread = (id: string) => {
    setSelectedId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const handleSend = () => {
    if (!draft.trim() || !selected) return;
    const channel = selected.channel;
    setConversations((prev) => ({
      ...prev,
      [selected.id]: [
        ...(prev[selected.id] || []),
        {
          id: `${selected.id}-m${Date.now()}`,
          from: "shop",
          text: draft,
          time: "Just now",
          status: "sent",
        },
      ],
    }));
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selected.id ? { ...t, preview: draft, time: "Just now" } : t,
      ),
    );
    setDraft("");
    toast.success(`Message sent via ${channel}`);
  };

  const handleInsertTemplate = () => {
    const tmpl = templates[templateCursor.current % templates.length];
    templateCursor.current += 1;
    setDraft((d) => (d ? `${d} ${tmpl}` : tmpl));
  };

  const handleEmoji = () => {
    const e = emojis[Math.floor(Math.random() * emojis.length)];
    setDraft((d) => `${d}${e}`);
  };

  const handleNewMessageSend = () => {
    toast.success("Message sent");
    setShowNew(false);
    setNewRecipient("");
    setNewChannel("SMS");
    setNewBody("");
  };

  return (
    <PageShell
      title="Messages"
      description={`${unreadTotal} unread · ${threads.filter((t) => t.status === "open").length} open threads`}
      actions={
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90"
        >
          <MessageSquare className="h-4 w-4" />
          New Message
        </button>
      }
    >
      <div className="grid h-[calc(100vh-13rem)] grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* ============== Thread list ============== */}
        <div className="flex min-h-0 flex-col rounded-lg border border-border bg-background">
          {/* Search + filters */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads…"
                className="w-full rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-0.5">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                    filter === f
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1 overflow-x-auto pb-0.5">
              {channelFilters.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannelFilter(c)}
                  className={clsx(
                    "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                    channelFilter === c
                      ? "border-accent bg-accent/20 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c === "all" ? "All channels" : c}
                </button>
              ))}
            </div>
          </div>

          {/* Thread list */}
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => selectThread(t.id)}
                  className={clsx(
                    "block w-full px-3 py-3 text-left transition-colors",
                    selectedId === t.id
                      ? "bg-accent/10"
                      : "hover:bg-surface/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {t.unread > 0 && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      )}
                      <span
                        className={clsx(
                          "truncate text-xs",
                          t.unread > 0 ? "font-bold" : "font-semibold",
                        )}
                      >
                        {t.customer}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {t.time}
                    </span>
                  </div>
                  {t.vehicle && (
                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {t.vehicle}
                      {t.ro && (
                        <>
                          {" · "}
                          <span className="font-semibold text-foreground">
                            RO #{t.ro}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <p
                    className={clsx(
                      "mt-1 truncate text-[11px]",
                      t.unread > 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {t.preview}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                        t.channel === "SMS"
                          ? "bg-[#E0E7FF] text-[#3730A3]"
                          : "bg-surface text-foreground",
                      )}
                    >
                      {t.channel}
                    </span>
                    {t.status === "awaiting-customer" && (
                      <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#92400E]">
                        Awaiting
                      </span>
                    )}
                    {t.status === "resolved" && (
                      <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success">
                        Resolved
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ============== Conversation pane ============== */}
        <div className="flex min-h-0 flex-col rounded-lg border border-border bg-background">
          {selected ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                      {selected.customer
                        .split("·")[0]
                        .trim()
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {selected.customer}
                      </div>
                      {selected.vehicle && (
                        <div className="truncate text-[11px] text-muted-foreground">
                          {selected.vehicle}
                          {selected.ro && (
                            <>
                              {" · "}
                              <span className="font-semibold text-foreground">
                                RO #{selected.ro}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toast.success(`Calling ${selected.customer}…`)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                    title="Call"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      toast.info("Email composer", {
                        description: "Switching channel - coming soon",
                      })
                    }
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                    title="Email"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      toast.info(
                        "More actions: Resolve, Assign, Mute, Archive - coming soon",
                      )
                    }
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                    title="More"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-surface/30 px-5 py-4">
                <div className="space-y-3">
                  {(conversations[selected.id] ?? []).map((m) => (
                    <div
                      key={m.id}
                      className={clsx(
                        "flex",
                        m.from === "shop" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div className="max-w-[70%]">
                        <div
                          className={clsx(
                            "rounded-2xl px-3.5 py-2 text-[13px]",
                            m.from === "shop"
                              ? "rounded-br-sm bg-foreground text-background"
                              : "rounded-bl-sm bg-background text-foreground border border-border",
                          )}
                        >
                          {m.text}
                        </div>
                        <div
                          className={clsx(
                            "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground",
                            m.from === "shop" ? "justify-end" : "justify-start",
                          )}
                        >
                          {m.time}
                          {m.status === "read" && (
                            <CheckCheck className="h-3 w-3 text-success" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Composer */}
              <div className="border-t border-border p-3">
                <div className="rounded-lg border border-border bg-background">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Reply to ${selected.customer.split("·")[0].trim()}…`}
                    rows={2}
                    className="w-full resize-none rounded-t-lg bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          toast.success(`Attached invoice_${Date.now()}.pdf`)
                        }
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                        title="Attach file"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={handleEmoji}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                        title="Emoji"
                      >
                        <Smile className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] text-muted-foreground">
                        Sending via {selected.channel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleInsertTemplate}
                        className="rounded-md border border-border px-2.5 py-1 text-[11px] font-medium hover:bg-surface"
                      >
                        Templates
                      </button>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!draft.trim()}
                        className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1 text-[11px] font-semibold text-background disabled:opacity-40"
                      >
                        <Send className="h-3 w-3" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              <div className="text-center">
                <Filter className="mx-auto mb-2 h-6 w-6" />
                Select a thread to view the conversation
              </div>
            </div>
          )}
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">New Message</h2>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recipient
                </label>
                <input
                  type="text"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="Customer name or phone/email"
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Channel
                </label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as "SMS" | "Email")}
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                >
                  <option value="SMS">SMS</option>
                  <option value="Email">Email</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Message
                </label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={4}
                  placeholder="Write your message…"
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewMessageSend}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
              >
                <Send className="h-3 w-3" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
