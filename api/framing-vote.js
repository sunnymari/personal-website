/**
 * Anonymous framing vote for Ask Sprout.
 * POST /api/framing-vote { choice: "ai" | "generic" } -> { ok, tally }
 * GET  /api/framing-vote                              -> { ok, tally }
 *
 * Stores one aggregate row per day in sprout_research_logs (no PII, no user ids).
 * Read-modify-write, so simultaneous votes can occasionally undercount.
 */

const CHOICES = new Set(["ai", "generic"]);
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 1_000) {
        reject(new Error("Request too large."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function config() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function headers(cfg, extra = {}) {
  return {
    apikey: cfg.key,
    Authorization: `Bearer ${cfg.key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

const today = () => new Date().toISOString().slice(0, 10);
const titleFor = (day) => `Ask Sprout framing vote · ${day}`;

async function loadRow(cfg, day) {
  const q = `log_date=eq.${day}&kind=eq.session&title=eq.${encodeURIComponent(titleFor(day))}&select=id,meta&limit=1`;
  const res = await fetch(`${cfg.url}/rest/v1/sprout_research_logs?${q}`, { headers: headers(cfg) });
  if (!res.ok) throw new Error(`load ${res.status}`);
  const rows = await res.json();
  return rows[0] || null;
}

async function loadTotals(cfg) {
  const q = `kind=eq.session&title=like.${encodeURIComponent("Ask Sprout framing vote*")}&select=meta`;
  const res = await fetch(`${cfg.url}/rest/v1/sprout_research_logs?${q}`, { headers: headers(cfg) });
  if (!res.ok) throw new Error(`totals ${res.status}`);
  const rows = await res.json();
  return rows.reduce(
    (t, r) => ({
      ai: t.ai + (Number(r.meta?.ai) || 0),
      generic: t.generic + (Number(r.meta?.generic) || 0),
    }),
    { ai: 0, generic: 0 },
  );
}

async function recordVote(cfg, choice) {
  const day = today();
  const existing = await loadRow(cfg, day);
  const counts = {
    ai: Number(existing?.meta?.ai) || 0,
    generic: Number(existing?.meta?.generic) || 0,
  };
  counts[choice] += 1;

  const summary = `Visitors who tried Ask Sprout picked which framing would make them act sooner: AI-demand framing ${counts.ai}, generic peak-hours framing ${counts.generic}.`;
  const meta = { ...counts, no_pii: true };

  if (existing) {
    const res = await fetch(`${cfg.url}/rest/v1/sprout_research_logs?id=eq.${existing.id}`, {
      method: "PATCH",
      headers: headers(cfg, { Prefer: "return=minimal" }),
      body: JSON.stringify({ summary, meta }),
    });
    if (!res.ok) throw new Error(`patch ${res.status}`);
    return;
  }

  const res = await fetch(`${cfg.url}/rest/v1/sprout_research_logs`, {
    method: "POST",
    headers: headers(cfg, { Prefer: "resolution=ignore-duplicates,return=minimal" }),
    body: JSON.stringify({
      log_date: day,
      kind: "session",
      title: titleFor(day),
      summary,
      why_important:
        "Sprout's core research question is whether attributing grid strain to AI demand changes how persuasive an energy signal is. This anonymous tally is the first behavioral evidence.",
      meta,
      source: "sprout",
    }),
  });
  if (!res.ok && res.status !== 409) throw new Error(`insert ${res.status}`);
}

export default async function handler(req, res) {
  const cfg = config();
  if (!cfg) {
    json(res, 503, { error: "Voting isn’t available yet." });
    return;
  }

  try {
    if (req.method === "GET") {
      json(res, 200, { ok: true, tally: await loadTotals(cfg) });
      return;
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      json(res, 405, { error: "Method not allowed." });
      return;
    }

    const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
    if (rateLimited(ip)) {
      json(res, 429, { error: "Too many votes. Try again in a minute." });
      return;
    }

    const payload = await readBody(req).catch(() => null);
    const choice = String(payload?.choice || "");
    if (!CHOICES.has(choice)) {
      json(res, 400, { error: "Pick a framing." });
      return;
    }

    await recordVote(cfg, choice);
    json(res, 200, { ok: true, tally: await loadTotals(cfg) });
  } catch (err) {
    console.error("framing-vote failure", String(err?.message || err).slice(0, 200));
    json(res, 502, { error: "Couldn’t record your vote right now." });
  }
}
