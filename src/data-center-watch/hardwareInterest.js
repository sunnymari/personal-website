const STORAGE_KEY = "sprout-hardware-interest-v1";

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
