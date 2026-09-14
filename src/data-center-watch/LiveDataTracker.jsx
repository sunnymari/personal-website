import { useEffect, useState } from "react";
import { WHY_TRACKER_MATTERS, fetchResearchLogs } from "./researchLog.js";

const KIND_LABEL = {
  milestone: "Milestone",
  daily_fact: "Daily fact",
  grid_snapshot: "Grid snapshot",
  waitlist_signal: "Waitlist",
  session: "Session",
};

const KIND_COLOR = {
  milestone: "#7A3B36",
  daily_fact: "#8FA876",
  grid_snapshot: "#D9A441",
  waitlist_signal: "#6B7FA8",
  session: "#8f5f79",
};

const ALL_KINDS = ["milestone", "daily_fact", "grid_snapshot", "waitlist_signal", "session"];

function formatDate(isoDay) {
  if (!isoDay) return "";
  const d = new Date(`${isoDay}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDay;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function LiveDataTracker({ InfoIcon }) {
  const [logs, setLogs] = useState([]);
  const [live, setLive] = useState(false);
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kindFilter, setKindFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchResearchLogs();
      if (cancelled) return;
      setLogs(result.logs || []);
      setLive(Boolean(result.live));
      setNote(result.note || null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredLogs = kindFilter === "all"
    ? logs
    : logs.filter((log) => log.kind === kindFilter);

  const dates = [...new Set(logs.map((l) => l.log_date).filter(Boolean))];
  const latestDate = dates.length ? dates[0] : null;
  const kindCounts = {};
  logs.forEach((log) => {
    const k = log.kind || "session";
    kindCounts[k] = (kindCounts[k] || 0) + 1;
  });

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16" role="tabpanel" aria-label="Live data tracker">
      <div
        className="rounded-[2rem] p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
          border: "2px solid rgba(242,198,194,0.45)",
          boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
        }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
          {InfoIcon ? <InfoIcon size={16} color="#8FA876" /> : null}
          Live data tracker
        </div>

        <h2 className="display-font text-3xl sm:text-4xl font-semibold" style={{ color: "#3A3A32" }}>
          Dated research log
        </h2>
        <p className="text-base font-semibold text-stone-600 mt-3 leading-relaxed max-w-3xl">
          Every entry below has a date. This is Sprout&apos;s memory: what was logged, when it was
          logged, and why that signal matters for AI-energy visibility.
        </p>

        <div
          className="mt-6 grid sm:grid-cols-2 gap-4"
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: live ? "rgba(143,168,118,0.15)" : "rgba(217,164,65,0.15)",
              border: live ? "1.5px solid rgba(143,168,118,0.35)" : "1.5px solid rgba(217,164,65,0.35)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>
                System status
              </span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                style={{
                  background: live ? "rgba(143,168,118,0.28)" : "rgba(217,164,65,0.28)",
                  color: live ? "#4f6b3f" : "#8a6a20",
                }}
              >
                {live ? "● Live DB" : "○ Seed/demo"}
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-700 leading-relaxed">
              {live
                ? "Connected to Supabase. Showing live research logs + seed milestones."
                : "API not yet live. Showing seed milestones + any local entries as fallback."}
            </p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(242,198,194,0.18)", border: "1.5px solid rgba(232,168,163,0.35)" }}
          >
            <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>
              Diagnostic stats
            </span>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold text-stone-700">
              <span>{logs.length} {logs.length === 1 ? "entry" : "entries"}</span>
              <span>{dates.length} {dates.length === 1 ? "day" : "days"} logged</span>
              {latestDate ? <span>Latest: {formatDate(latestDate)}</span> : null}
            </div>
          </div>
        </div>

        <div
          className="mt-6 rounded-2xl p-4 sm:p-5"
          style={{ background: "rgba(242,198,194,0.28)", border: "1.5px solid rgba(232,168,163,0.55)" }}
        >
          <h3 className="display-font text-xl font-semibold" style={{ color: "#7A3B36" }}>
            {WHY_TRACKER_MATTERS.headline}
          </h3>
          <p className="text-sm font-semibold text-stone-700 mt-2 leading-relaxed">
            {WHY_TRACKER_MATTERS.body}
          </p>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>
              Filter by kind
            </span>
            <span className="text-xs font-bold text-stone-500">({filteredLogs.length} shown)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setKindFilter("all")}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-all"
              style={{
                background: kindFilter === "all" ? "#3A3A32" : "#FFF8F4",
                color: kindFilter === "all" ? "#FFF8F4" : "#6b6358",
                border: `1.5px solid ${kindFilter === "all" ? "#3A3A32" : "#E8DFD2"}`,
              }}
            >
              All ({logs.length})
            </button>
            {ALL_KINDS.map((k) => {
              const count = kindCounts[k] || 0;
              const color = KIND_COLOR[k] || "#6b6358";
              const active = kindFilter === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKindFilter(k)}
                  disabled={count === 0}
                  className="rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: active ? color : "rgba(255,255,255,0.8)",
                    color: active ? "#FFF" : color,
                    border: `1.5px solid ${color}`,
                  }}
                >
                  {KIND_LABEL[k]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {note ? (
          <div
            className="mt-5 rounded-2xl p-4 text-sm font-semibold leading-relaxed"
            style={{ background: "rgba(217,164,65,0.15)", color: "#8a6a20", border: "1.5px solid rgba(217,164,65,0.3)" }}
          >
            <span className="font-extrabold">Note:</span> {note}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 text-center py-8">
            <p className="text-sm font-bold text-stone-500">Loading tracker…</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <p className="text-sm font-bold text-stone-500">
              No entries match {kindFilter === "all" ? "your filter" : `"${KIND_LABEL[kindFilter]}"`}.
            </p>
          </div>
        ) : (
          <ol className="mt-8 space-y-4 list-none p-0 m-0">
            {filteredLogs.map((log) => {
              const kind = log.kind || "session";
              const color = KIND_COLOR[kind] || "#6b6358";
              return (
                <li
                  key={log.id || `${log.log_date}-${log.title}`}
                  className="rounded-2xl p-4 sm:p-5"
                  style={{
                    background: "rgba(250,246,240,0.9)",
                    border: "1.5px solid rgba(143,168,118,0.22)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <time
                      dateTime={log.log_date}
                      className="rounded-full px-3 py-1 text-xs font-extrabold"
                      style={{ background: "#3A3A32", color: "#FFF8F4" }}
                    >
                      {formatDate(log.log_date)}
                    </time>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide"
                      style={{ background: "rgba(255,255,255,0.8)", color, border: `1.5px solid ${color}` }}
                    >
                      {KIND_LABEL[kind] || kind}
                    </span>
                  </div>
                  <h3 className="display-font text-xl font-semibold" style={{ color: "#3A3A32" }}>
                    {log.title}
                  </h3>
                  <p className="text-sm font-semibold text-stone-600 mt-2 leading-relaxed">{log.summary}</p>
                  <p className="text-sm font-bold mt-3 leading-relaxed" style={{ color: "#7A9464" }}>
                    Why this matters: {log.why_important}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
