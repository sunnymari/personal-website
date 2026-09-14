const LOCAL_KEY = "sprout-research-logs-v1";

export const WHY_TRACKER_MATTERS = {
  headline: "Why this live tracker matters",
  body: "AI data centers are reshaping electricity demand, but most people only see headlines. Sprout logs dated research signals so the experiment has a memory: what we measured, when we measured it, and why that day matters for grid salience and household behavior.",
};

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
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      return { ok: true, live: false, logs: local, note: data?.error || "Using local log cache." };
    }
    const merged = mergeClientLogs(data.logs || [], local);
    return { ok: true, live: Boolean(data.live), logs: merged, note: data.note || null };
  } catch {
    return { ok: true, live: false, logs: local, note: "Offline: showing local research log cache." };
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
