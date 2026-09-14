/**
 * Sprout research logs API — dated public tracker (no PII).
 * GET  /api/sprout-logs → list (DB + seed + waitlist date aggregates)
 * POST /api/sprout-logs → upsert via service role when configured
 */

const KINDS = new Set([
  "daily_fact",
  "grid_snapshot",
  "waitlist_signal",
  "milestone",
  "session",
]);

const SEED_LOGS = [
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

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function supabaseConfig({ write = false } = {}) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const key = write ? service || anon : anon || service;
  return url && key ? { url, key, canWrite: Boolean(service) } : null;
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function normalizePost(payload) {
  const kind = String(payload.kind || "").trim();
  const title = String(payload.title || "").trim().slice(0, 160);
  const summary = String(payload.summary || "").trim().slice(0, 600);
  const why_important = String(payload.why_important || "").trim().slice(0, 600);
  const log_date = String(payload.log_date || todayUTC()).trim().slice(0, 10);
  const meta = payload.meta && typeof payload.meta === "object" ? payload.meta : {};

  if (!KINDS.has(kind)) return { error: "Invalid kind." };
  if (!title || !summary || !why_important) {
    return { error: "title, summary, and why_important are required." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(log_date)) {
    return { error: "log_date must be YYYY-MM-DD." };
  }

  return {
    kind,
    title,
    summary,
    why_important,
    log_date,
    meta,
    source: "sprout",
  };
}

function mergeLogs(...groups) {
  const byKey = new Map();
  for (const rows of groups) {
    for (const row of rows || []) {
      const key = `${row.log_date}|${row.kind}|${row.title}`;
      const prev = byKey.get(key);
      if (!prev || prev.meta?.seed === true) {
        byKey.set(key, row);
      }
    }
  }
  return [...byKey.values()].sort((a, b) => {
    if (a.log_date === b.log_date) {
      return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    }
    return b.log_date.localeCompare(a.log_date);
  });
}

async function fetchResearchLogs(cfg) {
  if (typeof fetch === 'undefined') {
    return { ok: false, status: 503, detail: 'fetch API not available in this runtime', rows: [] };
  }
  const res = await fetch(
    `${cfg.url}/rest/v1/sprout_research_logs?select=*&order=log_date.desc,created_at.desc&limit=120`,
    {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
    }
  );
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, status: res.status, detail: text.slice(0, 300), rows: [] };
  }
  const rows = await res.json();
  return { ok: true, rows: Array.isArray(rows) ? rows : [] };
}

async function fetchWaitlistDateSignals(cfg) {
  // Aggregate signup dates only — never return emails/names.
  const writeCfg = supabaseConfig({ write: true });
  if (!writeCfg?.canWrite) return [];
  if (typeof fetch === 'undefined') return [];

  const res = await fetch(
    `${writeCfg.url}/rest/v1/sprout_hardware_waitlist?select=created_at&order=created_at.asc`,
    {
      headers: {
        apikey: writeCfg.key,
        Authorization: `Bearer ${writeCfg.key}`,
      },
    }
  );
  if (!res.ok) return [];
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows.length) return [];

  const counts = new Map();
  for (const row of rows) {
    const day = String(row.created_at || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    counts.set(day, (counts.get(day) || 0) + 1);
  }

  return [...counts.entries()].map(([log_date, count]) => ({
    id: `waitlist-${log_date}`,
    log_date,
    kind: "waitlist_signal",
    title: `Hardware waitlist interest · ${count} signup${count === 1 ? "" : "s"}`,
    summary: `${count} person${count === 1 ? "" : "s"} joined the Sprout hardware waitlist on this date (names and emails stay private).`,
    why_important:
      "Waitlist dates show real demand for grid-aware hardware. That interest signal is part of the research record, not just a marketing list.",
    meta: { count, no_pii: true },
    source: "sprout",
    created_at: `${log_date}T12:00:00.000Z`,
  }));
}

async function upsertLog(cfg, row) {
  const writeCfg = supabaseConfig({ write: true });
  if (!writeCfg?.canWrite) {
    return { ok: false, status: 503, detail: "Service role key required to write logs." };
  }
  if (typeof fetch === 'undefined') {
    return { ok: false, status: 503, detail: "fetch API not available in this runtime." };
  }

  const res = await fetch(`${writeCfg.url}/rest/v1/sprout_research_logs`, {
    method: "POST",
    headers: {
      apikey: writeCfg.key,
      Authorization: `Bearer ${writeCfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify(row),
  });

  if (res.status === 201 || res.status === 200) {
    const data = await res.json().catch(() => []);
    return { ok: true, row: Array.isArray(data) ? data[0] : data };
  }
  if (res.status === 409) return { ok: true, duplicate: true };

  const text = await res.text();
  if (/duplicate|unique/i.test(text)) return { ok: true, duplicate: true };
  if (/relation .* does not exist|Could not find the table/i.test(text)) {
    return {
      ok: false,
      status: 503,
      detail: "Apply sprout/schema/research_logs.sql in Supabase to enable live writes.",
    };
  }
  return { ok: false, status: res.status, detail: text.slice(0, 300) };
}

export default async function handler(req, res) {
  try {
    console.log('[sprout-logs] Handler invoked, method:', req.method);
    console.log('[sprout-logs] fetch available:', typeof fetch !== 'undefined');
    
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.end();
      return;
    }

    const cfg = supabaseConfig();
    console.log('[sprout-logs] Config loaded, has config:', cfg !== null);

  if (req.method === "GET") {
    console.log('[sprout-logs] Processing GET request');
    let dbRows = [];
    let live = false;
    let note = null;

    if (cfg) {
      console.log('[sprout-logs] Fetching from DB');
      const result = await fetchResearchLogs(cfg);
      if (result.ok) {
        dbRows = result.rows;
        live = true;
      } else {
        note =
          result.status === 404 || /does not exist|Could not find the table/i.test(String(result.detail))
            ? "Research log table not applied yet. Showing milestones + waitlist date signals when available. Run sprout/schema/research_logs.sql in Supabase for full live writes."
            : "Database temporarily unavailable; showing seed milestones.";
      }
    } else {
      note = "Showing seed milestones until Supabase is linked.";
    }

    console.log('[sprout-logs] About to fetch waitlist signals, cfg:', cfg !== null);
    const waitlistSignals = await fetchWaitlistDateSignals(cfg);
    console.log('[sprout-logs] Waitlist signals fetched, count:', waitlistSignals.length);
    
    json(res, 200, {
      ok: true,
      live,
      logs: mergeLogs(SEED_LOGS, dbRows, waitlistSignals),
      note,
    });
    return;
  }

  if (req.method === "POST") {
    let payload;
    try {
      payload = await readBody(req);
    } catch {
      json(res, 400, { error: "Invalid JSON body" });
      return;
    }

    const row = normalizePost(payload);
    if (row.error) {
      json(res, 400, { error: row.error });
      return;
    }

    const saved = await upsertLog(cfg, row);
    if (saved.ok) {
      json(res, 200, { ok: true, saved: true, live: true, duplicate: Boolean(saved.duplicate) });
      return;
    }

    json(res, 200, {
      ok: true,
      saved: false,
      live: false,
      message: saved.detail || "Could not persist log yet.",
    });
    return;
  }

    json(res, 405, { error: "GET or POST only" });
  } catch (err) {
    console.error("Handler error:", err);
    json(res, 500, {
      error: "Internal server error",
      message: err.message,
      name: err.name,
      cause: err.cause?.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
}
