import { useEffect, useState } from "react";
import { getDailyAiEnergyFact } from "./energyFacts.js";

export default function DailyEnergyFact({ InfoIcon, LightbulbIcon, ZapIcon }) {
  const [fact, setFact] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getDailyAiEnergyFact()
      .then((f) => {
        if (cancelled) return;
        setFact(f);
        setStatus(f.live ? "live" : "fallback");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16" role="tabpanel" aria-label="Daily AI energy fact">
      <div
        className="rounded-[2rem] p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
          border: "2px solid rgba(242,198,194,0.45)",
          boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: "#8FA876" }}>
            <LightbulbIcon size={16} color="#8FA876" />
            Daily AI energy fact
          </div>
          <span
            className="text-xs font-bold rounded-full px-3 py-1"
            style={{
              background: status === "live" ? "rgba(143,168,118,0.25)" : "rgba(242,198,194,0.45)",
              color: status === "live" ? "#4F6440" : "#7A3B36",
            }}
          >
            {status === "loading"
              ? "Fetching…"
              : status === "live"
                ? fact?.fromCache
                  ? "Cached for today · Carbonbench"
                  : "Live · Carbonbench"
                : status === "fallback"
                  ? "Offline tip · try again later"
                  : "Couldn’t load"}
          </span>
        </div>

        <h2 className="display-font text-3xl font-semibold" style={{ color: "#3A3A32" }}>
          {status === "loading" ? "Loading today’s tip…" : fact?.headline || "Energy tip"}
        </h2>

        <p className="text-base font-semibold text-stone-600 mt-3 leading-relaxed max-w-3xl">
          {status === "loading"
            ? "Pulling the lowest-carbon AI routing insight and Virginia grid intensity from Carbonbench."
            : fact?.body}
        </p>

        {fact?.metric ? (
          <div
            className="mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{ background: "#3A3A32", color: "#FAF6F0" }}
          >
            <ZapIcon size={16} color="#8FA876" />
            <span className="text-xs font-bold" style={{ color: "#B9B4A6" }}>
              {fact.metric.label}
            </span>
            <span className="display-font text-lg font-bold" style={{ color: "#F2C6C2" }}>
              {fact.metric.value}
            </span>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-start gap-2 text-xs font-semibold text-stone-500">
          <InfoIcon size={14} color="#8FA876" />
          <span>
            {fact?.source || "Carbonbench"} · rotates model family daily · pairs with Sprout’s upcoming
            CAISO / EIA live feed. Not live per-facility metering.
          </span>
        </div>
      </div>
    </section>
  );
}
