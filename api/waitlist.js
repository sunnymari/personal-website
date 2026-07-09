/**
 * Vercel serverless: collect Sprout hardware waitlist emails.
 *
 * Priority:
 * 1. Supabase insert when SUPABASE_URL + SUPABASE_ANON_KEY (or SERVICE_ROLE) are set
 * 2. Forward to FormSubmit so marissacurry@berkeley.edu receives the signup
 */

const WAITLIST_EMAIL = "marissacurry@berkeley.edu";
const HARDWARE_OK = new Set(["plug", "display", "both", "unsure"]);

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
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

function normalize(payload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const city = String(payload.city || "").trim();
  const utility = String(payload.utility || "").trim();
  const hardware = String(payload.hardware || "both").trim();
  const notes = String(payload.notes || "").trim();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email doesn’t look quite right." };
  }
  if (!HARDWARE_OK.has(hardware)) {
    return { error: "Pick a hardware option." };
  }

  return {
    name,
    email,
    city: city || null,
    utility: utility || null,
    hardware,
    notes: notes || null,
  };
}

async function saveToSupabase(row, userAgent) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return { skipped: true };

  const res = await fetch(`${url}/rest/v1/sprout_hardware_waitlist`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      ...row,
      user_agent: userAgent || null,
      source: "data-center-watch",
    }),
  });

  if (res.status === 201 || res.status === 200 || res.status === 204) {
    return { ok: true, via: "supabase" };
  }

  const text = await res.text();
  // Unique email already stored — still count as success for the visitor
  if (res.status === 409 || /duplicate|unique/i.test(text)) {
    return { ok: true, via: "supabase", duplicate: true };
  }

  return { ok: false, via: "supabase", status: res.status, detail: text.slice(0, 300) };
}

async function forwardToFormSubmit(row) {
  const res = await fetch(`https://formsubmit.co/ajax/${WAITLIST_EMAIL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: `Sprout hardware waitlist — ${row.name}`,
      _template: "table",
      _captcha: "false",
      name: row.name,
      email: row.email,
      city: row.city || "",
      utility: row.utility || "",
      hardware: row.hardware,
      notes: row.notes || "",
      source: "data-center-watch",
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, via: "formsubmit", status: res.status, detail: data };
  }
  return { ok: true, via: "formsubmit", data };
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "POST only" });
    return;
  }

  let payload;
  try {
    payload = await readBody(req);
  } catch {
    json(res, 400, { error: "Invalid JSON body" });
    return;
  }

  const row = normalize(payload);
  if (row.error) {
    json(res, 400, { error: row.error });
    return;
  }

  const userAgent = req.headers["user-agent"] || "";
  const supabase = await saveToSupabase(row, userAgent);
  const formsubmit = await forwardToFormSubmit(row);

  if (supabase.ok || formsubmit.ok) {
    json(res, 200, {
      ok: true,
      saved: {
        supabase: Boolean(supabase.ok),
        email: Boolean(formsubmit.ok),
        duplicate: Boolean(supabase.duplicate),
      },
      message: formsubmit.ok
        ? "You’re on the list — check your inbox if FormSubmit asks you to confirm once."
        : "Saved. Thanks for helping Sprout ship.",
    });
    return;
  }

  json(res, 502, {
    error: "Couldn’t save your signup right now. Please email marissacurry@berkeley.edu directly.",
    detail: {
      supabase: supabase.skipped ? "not_configured" : supabase.detail || supabase.status,
      formsubmit: formsubmit.detail || formsubmit.status,
    },
  });
}
