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
      _replyto: entry.email,
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
  if (!res.ok || data.success === "false" || data.success === false) {
    throw new Error(data.message || "Email delivery failed");
  }
  return { ok: true, via: "formsubmit", data };
}

/**
 * Collect the signup for real: POST /api/waitlist (Vercel → Supabase + email),
 * then always try browser FormSubmit if the API did not confirm email delivery
 * (FormSubmit often rejects server-side calls without a browser Origin).
 */
export async function submitWaitlist(entry) {
  let apiResult = null;

  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      apiResult = { ok: true, via: "api", data };
      if (data?.saved?.email) {
        return apiResult;
      }
      // DB may have saved; still attempt browser email so you get the inbox ping
    } else if (res.status !== 404) {
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        // validation errors should surface; still try FormSubmit as backup below
        apiResult = { ok: false, error: data.error, data };
      }
    }
  } catch (err) {
    if (!(err instanceof TypeError || /fetch/i.test(String(err?.message || "")))) {
      apiResult = { ok: false, error: err.message };
    }
  }

  try {
    const emailResult = await postFormSubmit(entry);
    if (apiResult?.ok) {
      return {
        ok: true,
        via: "api+formsubmit",
        data: {
          ...(apiResult.data || {}),
          message:
            "You’re on the list — check your inbox if FormSubmit asks you to confirm once.",
          saved: {
            ...(apiResult.data?.saved || {}),
            email: true,
            supabase: Boolean(apiResult.data?.saved?.supabase),
          },
        },
      };
    }
    return emailResult;
  } catch (emailErr) {
    if (apiResult?.ok) {
      // Supabase (or API) saved even if email failed
      return {
        ok: true,
        via: "api",
        data: {
          ...(apiResult.data || {}),
          message:
            apiResult.data?.message ||
            "Saved to the waitlist. If you don’t get an email, FormSubmit may need a one-time confirm — or email marissacurry@berkeley.edu.",
        },
      };
    }
    if (apiResult?.error) {
      throw new Error(apiResult.error);
    }
    throw emailErr;
  }
}
