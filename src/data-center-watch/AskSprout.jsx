import { useEffect, useState } from "react";

const APPLIANCE_OPTIONS = [
  { id: "dishwasher", label: "Dishwasher" },
  { id: "laundry", label: "Washer + dryer" },
  { id: "ev", label: "EV charging" },
  { id: "ac", label: "AC pre-cooling" },
  { id: "water_heater", label: "Water heater" },
];

const GRID_OPTIONS = [
  { id: "low", label: "Grid relaxed" },
  { id: "rising", label: "Demand climbing" },
  { id: "peak", label: "Peak overlap" },
];

const ACTION_STYLE = {
  run_now: { label: "Run now", bg: "#E4EDD9", color: "#4F6B3A" },
  wait: { label: "Wait", bg: "#F6E3C0", color: "#8A5F12" },
  either: { label: "Flexible", bg: "#ECE6DA", color: "#6b6358" },
};

const cardStyle = {
  background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
  border: "2px solid rgba(242,198,194,0.45)",
  boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
};

function VoteResult({ tally }) {
  const total = tally.ai + tally.generic;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  return (
    <div aria-live="polite">
      <p className="text-sm font-extrabold" style={{ color: "#3A3A32" }}>
        Thanks. Votes so far ({total} total)
      </p>
      <p className="text-sm font-semibold text-stone-600 mt-1">
        AI demand framing: {pct(tally.ai)}% ({tally.ai}) · Peak hours framing: {pct(tally.generic)}% ({tally.generic})
      </p>
    </div>
  );
}

const VOTE_KEY = "sprout-framing-vote-v1";
const today = () => new Date().toISOString().slice(0, 10);

function alreadyVotedToday() {
  try {
    return localStorage.getItem(VOTE_KEY) === today();
  } catch {
    return false;
  }
}

export default function AskSprout({ InfoIcon, SproutIcon, gridKey, live }) {
  const [grid, setGrid] = useState(gridKey);
  const [gridTouched, setGridTouched] = useState(false);
  const [voted, setVoted] = useState(alreadyVotedToday);
  const [tally, setTally] = useState(null);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    if (!gridTouched) setGrid(gridKey);
  }, [gridKey, gridTouched]);
  const [city, setCity] = useState("");
  const [utility, setUtility] = useState("");
  const [planNotes, setPlanNotes] = useState("");
  const [question, setQuestion] = useState("");
  const [appliances, setAppliances] = useState(["dishwasher", "laundry"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);

  function toggle(id) {
    setAppliances((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
    setError("");
  }

  async function castVote(choice) {
    setVoteError("");
    try {
      const res = await fetch("/api/framing-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.tally) throw new Error(data.error || "Couldn’t record your vote right now.");
      setTally(data.tally);
      setVoted(true);
      try {
        localStorage.setItem(VOTE_KEY, today());
      } catch {
        /* ignore */
      }
    } catch (err) {
      setVoteError(err.message || "Couldn’t record your vote right now.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!appliances.length) {
      setError("Pick at least one appliance.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ask-sprout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid,
          appliances,
          city,
          utility,
          planNotes,
          question,
          live: live && live.stateKey === grid ? live : undefined,
          localTime: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.plan) {
        throw new Error(data.error || "Couldn’t get a plan right now. Please try again.");
      }
      setPlan(data.plan);
    } catch (err) {
      setPlan(null);
      setError(err.message || "Couldn’t get a plan right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16" role="tabpanel" aria-label="Ask Sprout">
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 rounded-[2rem] p-6 sm:p-8" style={cardStyle}>
          <div className="flex items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
            <SproutIcon size={18} />
            Ask Sprout · powered by Gemini
          </div>
          <h2 className="display-font text-3xl font-semibold" style={{ color: "#3A3A32" }}>
            Get tonight’s plan
          </h2>
          <p className="text-sm font-semibold text-stone-600 mt-2 leading-relaxed">
            Tell Sprout your utility and plan. Gemini turns the grid state into a run-now-or-wait
            schedule for your appliances.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
              Grid right now
              <select
                className="dcw-input mt-1.5"
                value={grid}
                onChange={(e) => {
                  setGrid(e.target.value);
                  setGridTouched(true);
                }}
              >
                {GRID_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              {live ? (
                <span className="block text-xs font-semibold text-stone-500 mt-1.5">
                  Live CAISO (California): {(live.currentMW / 1000).toFixed(1)} GW, {live.pctOfPeak}% of
                  today’s forecast peak
                  {live.price ? `, wholesale $${live.price.usdPerMWh.toFixed(2)}/MWh` : ""}
                </span>
              ) : null}
            </label>

            <fieldset className="border-0 p-0 m-0">
              <legend className="text-sm font-bold mb-1.5" style={{ color: "#3A3A32" }}>
                Appliances
              </legend>
              <div className="flex flex-wrap gap-2">
                {APPLIANCE_OPTIONS.map((o) => {
                  const on = appliances.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(o.id)}
                      className="dcw-tab"
                      style={{
                        padding: "0.45rem 0.9rem",
                        fontSize: "0.85rem",
                        background: on ? "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)" : "rgba(241,237,228,0.9)",
                        color: on ? "#7A3B36" : "#6b6358",
                        border: `2px solid ${on ? "#E8A8A3" : "rgba(143,168,118,0.3)"}`,
                      }}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
                City
                <input
                  className="dcw-input mt-1.5"
                  value={city}
                  maxLength={60}
                  placeholder="Berkeley, CA"
                  onChange={(e) => setCity(e.target.value)}
                />
              </label>
              <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
                Utility
                <input
                  className="dcw-input mt-1.5"
                  value={utility}
                  maxLength={80}
                  placeholder="PG&E"
                  onChange={(e) => setUtility(e.target.value)}
                />
              </label>
            </div>

            <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
              Time-of-use plan (optional)
              <input
                className="dcw-input mt-1.5"
                value={planNotes}
                maxLength={300}
                placeholder="Peak 4–9pm, cheapest after 9pm"
                onChange={(e) => setPlanNotes(e.target.value)}
              />
              <button
                type="button"
                className="text-xs font-extrabold mt-1.5 underline"
                style={{ color: "#7A9464", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                onClick={() => setPlanNotes("Peak 4–9pm daily, cheaper otherwise (typical California time-of-use plan)")}
              >
                Use the typical California 4–9pm peak
              </button>
            </label>

            <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
              Anything else? (optional)
              <input
                className="dcw-input mt-1.5"
                value={question}
                maxLength={300}
                placeholder="I need the car charged by 7am"
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>

            {error ? (
              <p role="alert" className="text-sm font-bold" style={{ color: "#C9634B" }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="dcw-tab"
              style={{
                background: "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)",
                color: "#7A3B36",
                border: "2px solid #E8A8A3",
                boxShadow: "0 8px 18px rgba(242,198,194,0.4)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Asking Gemini…" : "Ask Sprout"}
            </button>
          </form>
        </div>

        <div className="md:col-span-3 rounded-[2rem] p-6 sm:p-8" style={cardStyle} aria-live="polite">
          {plan ? (
            <>
              <div className="flex items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
                <InfoIcon size={16} color="#8FA876" />
                Your plan
              </div>
              <p className="display-font text-xl font-semibold leading-snug" style={{ color: "#3A3A32" }}>
                {plan.summary}
              </p>

              <ul className="mt-5 space-y-3 list-none p-0 m-0">
                {plan.steps.map((s) => {
                  const a = ACTION_STYLE[s.action] || ACTION_STYLE.either;
                  return (
                    <li
                      key={s.appliance}
                      className="rounded-2xl p-4"
                      style={{ background: "rgba(250,246,240,0.85)", border: "1.5px solid rgba(143,168,118,0.22)" }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="display-font text-lg font-bold" style={{ color: "#3A3A32" }}>
                          {s.appliance}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-xs font-extrabold"
                          style={{ background: a.bg, color: a.color }}
                        >
                          {a.label}
                        </span>
                        <span className="text-sm font-bold text-stone-500">{s.when}</span>
                      </div>
                      <p className="text-sm font-semibold text-stone-600 mt-1 leading-relaxed">{s.why}</p>
                    </li>
                  );
                })}
              </ul>

              {plan.assumption ? (
                <p className="text-xs font-semibold text-stone-500 mt-3">Assumed: {plan.assumption}</p>
              ) : null}

              <div className="mt-6 pt-5" style={{ borderTop: "1.5px solid rgba(143,168,118,0.25)" }}>
                <h3 className="display-font text-lg font-bold" style={{ color: "#3A3A32" }}>
                  Same advice, two framings
                </h3>
                <p className="text-xs font-semibold text-stone-500 mt-1">
                  Which one would make you act sooner? That is the question Sprout’s research tests.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div className="rounded-2xl p-4" style={{ background: "rgba(143,168,118,0.16)" }}>
                    <div className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#4F6B3A" }}>
                      Framed around AI demand
                    </div>
                    <p className="text-sm font-semibold mt-1.5 leading-relaxed" style={{ color: "#3A3A32" }}>
                      {plan.framing_ai}
                    </p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: "rgba(242,198,194,0.3)" }}>
                    <div className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#7A3B36" }}>
                      Framed as generic peak hours
                    </div>
                    <p className="text-sm font-semibold mt-1.5 leading-relaxed" style={{ color: "#3A3A32" }}>
                      {plan.framing_generic}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(250,246,240,0.85)", border: "1.5px solid rgba(143,168,118,0.22)" }}>
                  {tally ? (
                    <VoteResult tally={tally} />
                  ) : voted ? (
                    <p className="text-sm font-bold text-stone-600">
                      Thanks, you already voted today. Your anonymous vote is part of Sprout’s research.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-extrabold" style={{ color: "#3A3A32" }}>
                        Which would make you act sooner? (anonymous)
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button type="button" className="dcw-tab" onClick={() => castVote("ai")}
                          style={{ padding: "0.45rem 0.9rem", fontSize: "0.85rem", background: "rgba(143,168,118,0.22)", color: "#4F6B3A", border: "2px solid rgba(143,168,118,0.5)" }}>
                          AI demand framing
                        </button>
                        <button type="button" className="dcw-tab" onClick={() => castVote("generic")}
                          style={{ padding: "0.45rem 0.9rem", fontSize: "0.85rem", background: "rgba(242,198,194,0.4)", color: "#7A3B36", border: "2px solid #E8A8A3" }}>
                          Peak hours framing
                        </button>
                      </div>
                      {voteError ? (
                        <p role="alert" className="text-xs font-bold mt-2" style={{ color: "#C9634B" }}>{voteError}</p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col justify-center text-center py-10">
              <p className="display-font text-2xl font-semibold" style={{ color: "#3A3A32" }}>
                Your plan shows up here
              </p>
              <p className="text-sm font-semibold text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Pick your appliances and hit Ask Sprout. Grid states are an illustrative demo cycle, not
                live metering, until the CAISO / EIA feed is wired in.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
