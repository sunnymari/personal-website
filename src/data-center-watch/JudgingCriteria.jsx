import { useState } from "react";

// Paste the demo video's public URL here (YouTube / Instagram / X). The embed
// block and its stats only render once this is set.
const DEMO_VIDEO_URL = "";

const SHARE_URL = "https://marissacodes.com/sprout";

const CRITERIA = [
  {
    id: "feasibility",
    label: "Technical Feasibility",
    question: "Does it actually work?",
    lead: "Yes. It runs on real data today: the grid reading comes from CAISO's live public feed, and Gemini writes the plan.",
    working: [
      "Live grid reading from CAISO's public real-time demand feed, refreshed every 5 minutes, with a labelled demo fallback if the feed is down.",
      "Ask Sprout: Gemini turns that reading, your utility, and your plan into a run-now-or-wait schedule.",
      "3D satellite map of seven real U.S. data center hubs, from Northern Virginia to Phoenix.",
      "Daily AI energy fact from Carbonbench's API, with an automatic fallback so it never breaks.",
      "Public dated tracker on a Vercel API and Supabase.",
      "Hardware waitlist that saves to Supabase and emails every signup.",
    ],
    next: [
      "The live reading covers California (CAISO) only. Next: EIA data for Virginia, Texas, and other hubs.",
      "Ship the companion smart plug and kitchen display. In development, not shipped.",
    ],
  },
  {
    id: "innovation",
    label: "Innovation & Novelty",
    question: "Is the approach creative or clever?",
    lead: "Other data center trackers serve advocates and investors. Sprout serves the person at the dishwasher.",
    working: [
      "Connects \u201cdata centers are straining the grid\u201d to \u201cshift your laundry tonight.\u201d No existing tracker makes that link.",
      "Tests an open question: does blaming strain on AI demand move behavior more than generic \u201cpeak hours\u201d? Visitors vote anonymously on which framing would make them act sooner.",
      "Covers both sides of the meter: household timing here, low-carbon AI routing in the Daily fact.",
    ],
    next: [],
  },
  {
    id: "applicability",
    label: "Real-World Applicability",
    question: "Would people genuinely use it?",
    lead: "One small, familiar ask that saves money: run big appliances at cheaper hours.",
    working: [
      "A plain-language bill tip. No account, no install.",
      "Maps onto time-of-use plans utilities already sell.",
      "Waitlist captures city and utility, so demand is measured where the grid is stressed.",
      "Says plainly what it can't show: per-facility energy use isn't public.",
    ],
    next: [],
  },
  {
    id: "market",
    label: "Market Potential & Fundability",
    question: "Could this become venture-backable?",
    lead: "The device is the wedge. The asset is household demand-response data that utilities can't easily collect.",
    working: [
      "Tailwind: FERC Order 2222 opens wholesale markets to aggregated small flexible loads, while AI is driving load growth.",
      "Two buyers: households save money, utilities and aggregators get evidence of how AI-framed signals shift timing.",
      "Capital-light: hardware demand is validated by waitlist before any manufacturing spend.",
    ],
    next: [
      "Today: pre-revenue research prototype. Next proof points are measured behavior change and a utility pilot.",
      "Risks: consumer hardware margins and utility partnerships.",
    ],
  },
  {
    id: "traction",
    label: "Go-to-Market Traction",
    question: "Are people engaging?",
    lead: "Short-form demo video drives visits, visits convert to the waitlist, and every signup is logged by date.",
    working: [
      "Top of funnel: views, likes, and shares on the demo video.",
      "Conversion: hardware waitlist signups, visible on the Live tracker.",
    ],
    next: [],
  },
];

function Bullet({ children, color }) {
  return (
    <li className="flex gap-3 text-sm font-semibold text-stone-600 leading-relaxed">
      <span
        aria-hidden="true"
        className="mt-2 shrink-0 rounded-full"
        style={{ width: 7, height: 7, background: color }}
      />
      <span>{children}</span>
    </li>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = {
      title: "Sprout — make AI's grid demand visible",
      text: "See where data centers sit on the grid and when to run your appliances.",
      url: SHARE_URL,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <button
      type="button"
      className="dcw-tab"
      onClick={share}
      style={{
        background: "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)",
        color: "#7A3B36",
        border: "2px solid #E8A8A3",
        boxShadow: "0 8px 18px rgba(242,198,194,0.4)",
      }}
    >
      {copied ? "Link copied" : "Share Sprout"}
    </button>
  );
}

export default function JudgingCriteria({ InfoIcon, onOpenTab }) {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-16" role="tabpanel" aria-label="Why Sprout">
      <div
        className="rounded-[2rem] p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
          border: "2px solid rgba(242,198,194,0.45)",
          boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
        }}
      >
        <div className="flex items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
          <InfoIcon size={16} color="#8FA876" />
          Why Sprout
        </div>
        <h2 className="display-font text-3xl sm:text-4xl font-semibold" style={{ color: "#3A3A32" }}>
          Judged on five questions
        </h2>
        <p className="text-base font-semibold text-stone-600 mt-3 leading-relaxed max-w-3xl">
          Sprout makes AI-driven grid demand visible, then tells households what to do about it
          tonight. Each answer below separates what is live from what is still ahead.
        </p>

        <nav aria-label="Judging criteria" className="mt-5 flex flex-wrap gap-2">
          {CRITERIA.map((c, i) => (
            <a
              key={c.id}
              href={`#judging-${c.id}`}
              className="rounded-full px-3 py-1.5 text-xs font-extrabold"
              style={{
                background: "rgba(250,246,240,0.9)",
                border: "1.5px solid rgba(143,168,118,0.3)",
                color: "#6b6358",
                textDecoration: "none",
              }}
            >
              {i + 1}. {c.label}
            </a>
          ))}
        </nav>

        <ol className="mt-8 space-y-5 list-none p-0 m-0">
          {CRITERIA.map((c, i) => (
            <li
              key={c.id}
              id={`judging-${c.id}`}
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: "rgba(250,246,240,0.85)",
                border: "1.5px solid rgba(143,168,118,0.22)",
                scrollMarginTop: "1.5rem",
              }}
            >
              <div className="flex gap-4">
                <span
                  className="display-font shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
                  style={{ background: "#F2C6C2", color: "#7A3B36" }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="display-font text-xl font-bold" style={{ color: "#3A3A32" }}>
                    {c.label}
                  </h3>
                  <p className="text-sm font-extrabold" style={{ color: "#8FA876" }}>
                    {c.question}
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold text-stone-700 mt-4 leading-relaxed">{c.lead}</p>

              <ul className="mt-4 space-y-2.5 list-none p-0 m-0">
                {c.working.map((line) => (
                  <Bullet key={line} color="#8FA876">
                    {line}
                  </Bullet>
                ))}
              </ul>

              {c.next.length ? (
                <div
                  className="mt-4 rounded-xl p-4"
                  style={{ background: "rgba(242,198,194,0.22)" }}
                >
                  <div className="text-xs font-extrabold uppercase tracking-wide mb-2" style={{ color: "#7A3B36" }}>
                    Still ahead
                  </div>
                  <ul className="space-y-2.5 list-none p-0 m-0">
                    {c.next.map((line) => (
                      <Bullet key={line} color="#C9634B">
                        {line}
                      </Bullet>
                    ))}
                  </ul>
                </div>
              ) : null}

              {c.id === "traction" ? (
                <div className="mt-5">
                  {DEMO_VIDEO_URL ? (
                    <a
                      href={DEMO_VIDEO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dcw-about-link display-font text-lg font-bold"
                      style={{ color: "#7A3B36" }}
                    >
                      Watch the Sprout demo video
                    </a>
                  ) : null}
                  <div className="flex flex-wrap gap-3 mt-3">
                    <ShareButton />
                    <button
                      type="button"
                      className="dcw-tab"
                      onClick={() => onOpenTab("hardware")}
                      style={{
                        background: "rgba(241,237,228,0.9)",
                        color: "#6b6358",
                        border: "2px solid rgba(143,168,118,0.35)",
                      }}
                    >
                      Join the hardware waitlist
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="dcw-tab mt-8"
          onClick={() => onOpenTab("watch")}
          style={{
            background: "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)",
            color: "#7A3B36",
            boxShadow: "0 8px 18px rgba(242,198,194,0.4)",
            border: "2px solid #E8A8A3",
          }}
        >
          See it working →
        </button>
      </div>
    </section>
  );
}
