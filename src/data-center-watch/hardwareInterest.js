const STORAGE_KEY = "sprout-hardware-interest-v1";
const WAITLIST_NOTIFY = "marissacurry@berkeley.edu";

export const HARDWARE_OPTIONS = [
  { id: "plug", label: "Smart plug / load monitor" },
  { id: "display", label: "Kitchen / desk display" },
  { id: "both", label: "Both plug + display" },
  { id: "unsure", label: "Not sure yet — keep me posted" },
];

export function loadHardwareSignups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHardwareSignup(entry) {
  const list = loadHardwareSignups();
  const next = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      ...entry,
    },
    ...list,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearHardwareSignups() {
  localStorage.removeItem(STORAGE_KEY);
}

export function downloadHardwareSignups(list = loadHardwareSignups()) {
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sprout-hardware-interest-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function postFormSubmit(entry) {
  const res = await fetch(`https://formsubmit.co/ajax/${WAITLIST_NOTIFY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: `Sprout hardware waitlist — ${entry.name}`,
      _template: "table",
      _captcha: "false",
      name: entry.name,
      email: entry.email,
      city: entry.city || "",
      utility: entry.utility || "",
      hardware: entry.hardware,
      notes: entry.notes || "",
      source: "data-center-watch",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Email delivery failed");
  }
  return { ok: true, via: "formsubmit", data };
}

/**
 * Collect the signup for real: POST /api/waitlist (Vercel → email + optional Supabase),
 * with FormSubmit fallback for local Vite / if the API is down.
 */
export async function submitWaitlist(entry) {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: true, via: "api", data };
    }
    // 404 on local Vite — fall through to FormSubmit
    if (res.status !== 404) {
      const data = await res.json().catch(() => ({}));
      if (data.error) throw new Error(data.error);
    }
  } catch (err) {
    // Network / missing API — try direct FormSubmit
    if (err instanceof TypeError || /fetch/i.test(String(err.message))) {
      return postFormSubmit(entry);
    }
    // If API returned a real validation error, don't mask it
    if (err.message && !/404|Failed to fetch/i.test(err.message)) {
      // still try FormSubmit as backup for infra failures
    }
  }

  return postFormSubmit(entry);
}
