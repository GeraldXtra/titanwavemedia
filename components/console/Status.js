const ICONS = {
  alert: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.75v4" />
      <path d="M8 11.25h.01" />
    </>
  ),
  check: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="m5.5 8 1.8 1.8 3.2-3.6" />
    </>
  ),
  back: (
    <>
      <path d="M6 4 3 7l3 3" />
      <path d="M3 7h6.5a3.5 3.5 0 0 1 0 7H7" />
    </>
  ),
  slash: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="m3.8 12.2 8.4-8.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.2l2 1.3" />
    </>
  ),
  cross: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="m5.9 5.9 4.2 4.2M10.1 5.9l-4.2 4.2" />
    </>
  ),
  pause: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M6.6 5.8v4.4M9.4 5.8v4.4" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="m13.5 13.5-3.3-3.3" />
    </>
  ),
  send: (
    <>
      <path d="M14 2 7 9" />
      <path d="M14 2 9.5 14 7 9 2 6.5z" />
    </>
  ),
  reply: <path d="M2.5 3h11v8H7l-3.5 3v-3h-1z" />,
  inbox: (
    <>
      <path d="M2.5 9.5 4.5 3.5h7l2 6v3h-11z" />
      <path d="M2.5 9.5h3l1 1.5h3l1-1.5h3" />
    </>
  ),
  plan: <path d="M3 4.5h10M3 8h10M3 11.5h6" />,
  doc: (
    <>
      <path d="M4 1.75h5.5L12 4.25v10H4z" />
      <path d="M9.5 1.75v2.5H12" />
      <path d="M6 8h4M6 10.5h4" />
    </>
  ),
  build: <path d="M10.2 2.3a3.2 3.2 0 0 0-3.9 4.1L2.5 10.2a1.4 1.4 0 0 0 2 2l3.8-3.8a3.2 3.2 0 0 0 4.1-3.9l-2 2-1.6-.4-.4-1.6z" />,
  test: (
    <>
      <path d="M6 2h4M6.5 2v4.2L3 12.6a1 1 0 0 0 .9 1.4h8.2a1 1 0 0 0 .9-1.4L9.5 6.2V2" />
      <path d="M4.6 10h6.8" />
    </>
  ),
  live: <path d="M1.5 8h3l1.5-3.5 3 7L10.5 8h4" />,
  power: (
    <>
      <path d="M8 2v5.5" />
      <path d="M4.6 4.2a5 5 0 1 0 6.8 0" />
    </>
  ),
  off: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8h5" />
    </>
  ),
  question: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M6.4 6.3a1.7 1.7 0 1 1 2.3 1.6c-.5.2-.7.6-.7 1v.4" />
      <path d="M8 11.3h.01" />
    </>
  ),
  person: (
    <>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3 14a5 5 0 0 1 10 0" />
    </>
  ),
};

const KINDS = {
  invoice: { due: ["act", "alert"], paid: ["ok", "check"], refunded: [null, "back"], void: [null, "slash"] },
  receipt: { paid: ["ok", "check"], refund_requested: [null, "clock"], refunded: [null, "back"] },
  payment: { success: ["ok", "check"], failed: ["act", "cross"], abandoned: [null, "pause"], pending: [null, "clock"], review: [null, "search"] },
  help: { new: [null, "send"], replied: ["act", "reply"], waiting: ["act", "reply"], solved: ["ok", "check"] },
  inbox: { new: ["act", "inbox"], replied: [null, "reply"], waiting: [null, "clock"], solved: ["ok", "check"] },
  refund: { requested: ["act", "alert"], processing: [null, "clock"], refunded: ["ok", "check"], declined: [null, "slash"], failed: ["act", "cross"] },
  payout: { success: ["ok", "check"], processing: [null, "clock"], pending: [null, "clock"], failed: ["act", "cross"] },
  project: { 1: [null, "send"], 2: [null, "plan"], quote: ["act", "doc"], 3: [null, "build"], 4: [null, "test"], 5: ["ok", "live"] },
  product: { live: ["ok", "live"], available: ["ok", "check"], soon: [null, "clock"] },
  assistant: { on: ["ok", "power"], off: [null, "off"] },
  outcome: { answered: ["ok", "check"], handed_over: ["act", "person"], unanswered: [null, "question"] },
  handover: { handled: ["ok", "check"], waiting: ["act", "person"] },
  service: { working: ["ok", "check"], down: ["act", "alert"] },
};

export default function Status({ kind, value, label, className }) {
  const [tone, icon] = (KINDS[kind] && KINDS[kind][value]) || [null, "clock"];
  const cls = ["c-status", tone && `c-status--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        {ICONS[icon]}
      </svg>
      {label}
    </span>
  );
}
