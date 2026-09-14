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

  const dates = [...new Set(logs.map((l) => l.log_date).filter(Boolean))];

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
          <span
            className="ml-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
            style={{
              background: live ? "rgba(143,168,118,0.22)" : "rgba(217,164,65,0.22)",
              color: live ? "#4f6b3f" : "#8a6a20",
            }}
          >
            {live ? "Live DB" : "Seed + local"}
          </span>
        </div>

        <h2 className="display-font text-3xl sm:text-4xl font-semibold" style={{ color: "#3A3A32" }}>
          Dated research log
        </h2>
        <p className="text-base font-semibold text-stone-600 mt-3 leading-relaxed max-w-3xl">
          Every entry below has a date. This is Sprout&apos;s memory: what was logged, when it was
          logged, and why that signal matters for AI-energy visibility.
        </p>

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

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>
            Logging window
          </span>
          {dates.length ? (
            dates.slice(0, 12).map((day) => (
              <span
                key={day}
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "#FFF8F4", color: "#7A3B36", border: "1.5px solid #E8A8A3" }}
              >
                {formatDate(day)}
              </span>
            ))
          ) : (
            <span className="text-sm font-semibold text-stone-500">No dates yet</span>
          )}
        </div>

        {note ? (
          <p className="mt-4 text-sm font-semibold italic" style={{ color: "#8a6a20" }}>
            {note}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm font-bold text-stone-500">Loading tracker…</p>
        ) : (
          <ol className="mt-8 space-y-4 list-none p-0 m-0">
            {logs.map((log) => {
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
