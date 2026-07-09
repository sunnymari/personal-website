import { useMemo, useState } from "react";
import {
  HARDWARE_OPTIONS,
  clearHardwareSignups,
  downloadHardwareSignups,
  loadHardwareSignups,
  saveHardwareSignup,
} from "./hardwareInterest.js";

const emptyForm = {
  name: "",
  email: "",
  city: "",
  utility: "",
  hardware: "both",
  notes: "",
};

export default function HardwareInterest({ SproutIcon }) {
  const [form, setForm] = useState(emptyForm);
  const [signups, setSignups] = useState(() =>
    typeof localStorage !== "undefined" ? loadHardwareSignups() : [],
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const count = signups.length;
  const hardwareLabel = useMemo(() => {
    const map = Object.fromEntries(HARDWARE_OPTIONS.map((o) => [o.id, o.label]));
    return (id) => map[id] || id;
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSubmitted(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    const email = form.email.trim();
    const name = form.name.trim();
    if (!name || !email) {
      setError("Name and email help us follow up when Sprout hardware ships.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email doesn’t look quite right.");
      return;
    }
    const next = saveHardwareSignup({
      name,
      email,
      city: form.city.trim(),
      utility: form.utility.trim(),
      hardware: form.hardware,
      notes: form.notes.trim(),
    });
    setSignups(next);
    setForm(emptyForm);
    setSubmitted(true);
  }

  return (
    <section className="max-w-5xl mx-auto px-6 pb-16" role="tabpanel" aria-label="Sprout hardware interest">
      <div className="grid md:grid-cols-5 gap-8">
        <div
          className="md:col-span-3 rounded-[2rem] p-6 sm:p-8"
          style={{
            background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
            border: "2px solid rgba(242,198,194,0.45)",
            boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
          }}
        >
          <div className="flex items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
            <SproutIcon size={18} />
            Sprout hardware waitlist
          </div>
          <h2 className="display-font text-3xl font-semibold" style={{ color: "#3A3A32" }}>
            Help us build the companion device
          </h2>
          <p className="text-sm font-semibold text-stone-600 mt-2 max-w-xl leading-relaxed">
            Tell us what hardware you want so Sprout can ship a plug / display that mirrors this page’s
            grid tips — and later the same CAISO / EIA live feed.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
                Name
                <input
                  className="dcw-input mt-1.5"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Marissa"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
                Email
                <input
                  className="dcw-input mt-1.5"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  required
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
                City / region
                <input
                  className="dcw-input mt-1.5"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Ashburn, VA"
                  autoComplete="address-level2"
                />
              </label>
              <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
                Utility (optional)
                <input
                  className="dcw-input mt-1.5"
                  value={form.utility}
                  onChange={(e) => update("utility", e.target.value)}
                  placeholder="PG&E, Dominion, ComEd…"
                />
              </label>
            </div>

            <fieldset>
              <legend className="text-sm font-bold" style={{ color: "#3A3A32" }}>
                Hardware interest
              </legend>
              <div className="mt-2 grid sm:grid-cols-2 gap-2">
                {HARDWARE_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold cursor-pointer"
                    style={{
                      background: form.hardware === opt.id ? "#F2C6C2" : "rgba(250,246,240,0.9)",
                      color: form.hardware === opt.id ? "#7A3B36" : "#3A3A32",
                      border: "1.5px solid rgba(143,168,118,0.25)",
                    }}
                  >
                    <input
                      type="radio"
                      name="hardware"
                      value={opt.id}
                      checked={form.hardware === opt.id}
                      onChange={() => update("hardware", opt.id)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm font-bold" style={{ color: "#3A3A32" }}>
              Notes for the Sprout build
              <textarea
                className="dcw-input mt-1.5"
                rows={3}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="TOU plan hours, must-have features, wall color vibes…"
              />
            </label>

            {error ? (
              <p className="text-sm font-bold" style={{ color: "#C9634B" }}>
                {error}
              </p>
            ) : null}
            {submitted ? (
              <p className="text-sm font-bold" style={{ color: "#4F6440" }}>
                Saved on this device — thanks for helping Sprout ship.
              </p>
            ) : null}

            <button
              type="submit"
              className="dcw-tab justify-self-start"
              style={{
                background: "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)",
                color: "#7A3B36",
                boxShadow: "0 8px 18px rgba(242,198,194,0.4)",
                border: "2px solid #E8A8A3",
              }}
            >
              Join hardware waitlist
            </button>
          </form>
        </div>

        <div
          className="md:col-span-2 rounded-[2rem] p-6"
          style={{
            background: "linear-gradient(165deg, #45453C 0%, #3A3A32 55%, #2F2F28 100%)",
            color: "#FAF6F0",
          }}
        >
          <div className="display-font text-xl font-bold">Collected on this browser</div>
          <p className="text-xs font-semibold mt-1" style={{ color: "#B9B4A6" }}>
            {count} signup{count === 1 ? "" : "s"} stored locally. Export JSON to sync into the Sprout
            project CRM / sheet. Nothing is sent to a server yet.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="dcw-tab"
              disabled={!count}
              onClick={() => downloadHardwareSignups(signups)}
              style={{
                background: count ? "#F2C6C2" : "#55554A",
                color: count ? "#7A3B36" : "#B9B4A6",
                opacity: count ? 1 : 0.7,
              }}
            >
              Export JSON
            </button>
            <button
              type="button"
              className="dcw-tab"
              disabled={!count}
              onClick={() => {
                clearHardwareSignups();
                setSignups([]);
                setSubmitted(false);
              }}
              style={{
                background: "transparent",
                color: "#D8D4C8",
                border: "1.5px solid #55554A",
              }}
            >
              Clear
            </button>
          </div>

          <ul className="mt-5 space-y-3 max-h-72 overflow-auto p-0 m-0 list-none">
            {signups.length === 0 ? (
              <li className="text-sm font-semibold" style={{ color: "#B9B4A6" }}>
                No hardware interest yet — be the first.
              </li>
            ) : (
              signups.slice(0, 8).map((s) => (
                <li
                  key={s.id}
                  className="rounded-2xl px-3.5 py-3"
                  style={{ background: "rgba(242,198,194,0.1)" }}
                >
                  <div className="text-sm font-bold" style={{ color: "#F2C6C2" }}>
                    {s.name}
                  </div>
                  <div className="text-xs font-semibold" style={{ color: "#D8D4C8" }}>
                    {s.email}
                    {s.city ? ` · ${s.city}` : ""}
                  </div>
                  <div className="text-xs font-semibold mt-1" style={{ color: "#B9B4A6" }}>
                    {hardwareLabel(s.hardware)}
                    {s.utility ? ` · ${s.utility}` : ""}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
