const LOCAL_KEY = "sprout-research-logs-v1";

export const WHY_TRACKER_MATTERS = {
  headline: "Why this live tracker matters",
  body: "AI data centers are reshaping electricity demand, but most people only see headlines. Sprout logs dated research signals so the experiment has a memory: what we measured, when we measured it, and why that day matters for grid salience and household behavior.",
};

export const SEED_LOGS = [
  {
    id: "seed-launch",
    log_date: "2026-08-28",
    kind: "milestone",
    title: "Sprout goes live on marissacodes.com",
    summary:
      "Public companion map of known U.S. data center hubs with grid-stress guidance and a hardware waitlist.",
    why_important:
      "A living research surface: when AI demand is visible to regular people, we can study whether salience changes household timing of high-draw appliances.",
    meta: { phase: "launch", seed: true },
    source: "sprout",
    created_at: "2026-08-28T12:00:00.000Z",
  },
  {
    id: "seed-instrument",
    log_date: "2026-08-31",
    kind: "milestone",
    title: "Hardware waitlist + Carbonbench daily fact wired",
    summary:
      "Waitlist signups persist to Supabase and email. Daily AI energy tips pull Carbonbench with a curated snapshot fallback.",
    why_important:
      "Logging interest and daily energy tips creates a dated research trail instead of only ephemeral on-screen state.",
    meta: { phase: "instrumentation", seed: true },
    source: "sprout",
    created_at: "2026-08-31T12:00:00.000Z",
  },
  {
    id: "seed-tracker",
    log_date: "2026-09-14",
    kind: "milestone",
    title: "Live data tracker opened",
    summary:
      "Sprout now keeps a public, dated log of research signals so history is visible: daily facts, grid snapshots, and waitlist interest.",
    why_important:
      "Without dates, demos reset. A dated tracker proves the experiment is running over time and clarifies why the thesis matters.",
    meta: { phase: "tracker", seed: true },
    source: "sprout",
    created_at: "2026-09-14T12:00:00.000Z",
  },
];

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows.slice(0, 80)));
  } catch {
    /* ignore */
  }
}

export function rememberLocalLog(entry) {
  const rows = readLocal();
  const key = `${entry.log_date}|${entry.kind}|${entry.title}`;
  const next = [
    { ...entry, id: entry.id || key, created_at: entry.created_at || new Date().toISOString() },
    ...rows.filter((r) => `${r.log_date}|${r.kind}|${r.title}` !== key),
  ];
  writeLocal(next);
  return next;
}

export async function fetchResearchLogs() {
  const local = readLocal();
  try {
    const res = await fetch("/api/sprout-logs");
    if (!res.ok) {
      const fallback = mergeClientLogs(SEED_LOGS, local);
      return {
        ok: true,
        live: false,
        logs: fallback,
        note: res.status === 404
          ? "API endpoint not yet deployed. Showing seed milestones + local entries as fallback."
          : `API error (${res.status}). Showing seed milestones + local entries as fallback.`,
      };
    }
    const data = await res.json();
    if (!data?.ok) {
      const fallback = mergeClientLogs(SEED_LOGS, local);
      return { ok: true, live: false, logs: fallback, note: data?.error || "Using seed + local fallback." };
    }
    const merged = mergeClientLogs(data.logs || [], local);
    return { ok: true, live: Boolean(data.live), logs: merged, note: data.note || null };
  } catch (err) {
    const fallback = mergeClientLogs(SEED_LOGS, local);
    return {
      ok: true,
      live: false,
      logs: fallback,
      note: "Network error. Showing seed milestones + local entries as fallback.",
    };
  }
}

function mergeClientLogs(serverRows, localRows) {
  const byKey = new Map();
  for (const row of [...(serverRows || []), ...(localRows || [])]) {
    const key = `${row.log_date}|${row.kind}|${row.title}`;
    if (!byKey.has(key)) byKey.set(key, row);
  }
  return [...byKey.values()].sort((a, b) => {
    if (a.log_date === b.log_date) {
      return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    }
    return b.log_date.localeCompare(a.log_date);
  });
}

/** Fire-and-forget dated research signal (server + local backup). */
export async function logResearchEvent({
  kind,
  title,
  summary,
  why_important,
  meta = {},
  log_date = dayKey(),
}) {
  const entry = {
    kind,
    title,
    summary,
    why_important,
    meta,
    log_date,
    source: "sprout",
  };
  rememberLocalLog(entry);
  try {
    await fetch("/api/sprout-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch {
    /* local backup already stored */
  }
}

export function logDailyFactEvent(fact) {
  if (!fact) return Promise.resolve();
  const mode = fact.live ? "live Carbonbench" : fact.snapshot ? "curated snapshot" : "companion tip";
  return logResearchEvent({
    kind: "daily_fact",
    title: "Daily AI energy fact",
    summary: `${fact.headline || "Energy tip"}: ${fact.body || "Energy tip logged."} Source mode: ${mode}.`,
    why_important:
      "Daily facts turn abstract AI-energy intensity into a dated public signal people can act on, and they create a longitudinal record of what Sprout taught each day.",
    meta: {
      live: Boolean(fact.live),
      snapshot: Boolean(fact.snapshot),
      model: fact.model || null,
      metric: fact.metric || null,
      headline: fact.headline || null,
    },
  });
}

export function logGridSnapshotEvent(state) {
  if (!state) return Promise.resolve();
  return logResearchEvent({
    kind: "grid_snapshot",
    title: "Grid stress panel observed",
    summary: `Visitor session saw stress UX state "${state.label}" with reference price ${state.price}. Tip shown: ${state.tip}`,
    why_important:
      "Even before full CAISO/EIA ingestion, dated stress snapshots document what visitors saw and when. That timeline is the bridge from demo UX to real grid research history.",
    meta: { key: state.key, price: state.price, demo: true },
  });
}
