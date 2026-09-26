import { useState, useEffect, useCallback } from "react";
import UsClusterMap from "./UsClusterMap.jsx";
import DailyEnergyFact from "./DailyEnergyFact.jsx";
import HardwareInterest from "./HardwareInterest.jsx";
import AboutProject, { AboutFooterBlurb } from "./AboutProject.jsx";
import LiveDataTracker from "./LiveDataTracker.jsx";
import JudgingCriteria from "./JudgingCriteria.jsx";
import AskSprout from "./AskSprout.jsx";
import { logGridSnapshotEvent } from "./researchLog.js";

const CLUSTERS = [
  { name: "Northern Virginia", lat: 38.95, lng: -77.45, size: "largest", note: "Largest data center market in the world · Ashburn" },
  { name: "Silicon Valley", lat: 37.37, lng: -122.04, size: "large", note: "Dense hyperscale + enterprise cluster · Santa Clara" },
  { name: "Dallas–Fort Worth", lat: 32.93, lng: -97.04, size: "large", note: "Fast-growing hyperscale hub" },
  { name: "Chicago", lat: 41.88, lng: -87.63, size: "medium", note: "Major interconnection point" },
  { name: "Phoenix", lat: 33.45, lng: -112.07, size: "large", note: "Rapid hyperscale expansion" },
  { name: "Columbus", lat: 40.00, lng: -83.02, size: "medium", note: "Growing hyperscale corridor" },
  { name: "Atlanta", lat: 33.75, lng: -84.39, size: "medium", note: "Southeast hub" },
];

const GRID_STATES = [
  {
    key: "low",
    label: "Grid relaxed",
    color: "#8FA876",
    glow: "rgba(143,168,118,0.35)",
    price: "$28/MWh",
    tip: "Good time to run high-draw appliances — dishwasher, laundry, EV charging. Demand is low across the board.",
  },
  {
    key: "rising",
    label: "Demand climbing",
    color: "#D9A441",
    glow: "rgba(217,164,65,0.35)",
    price: "$74/MWh",
    tip: "Afternoon compute + cooling load is ramping up. Consider delaying non-urgent appliance use by a couple hours.",
  },
  {
    key: "peak",
    label: "Peak overlap",
    color: "#C9634B",
    glow: "rgba(201,99,75,0.4)",
    price: "$156/MWh",
    tip: "This is likely peak data-center + human demand overlap (late afternoon/evening). If you're on a time-of-use plan, this is the most expensive window — shift what you can to after 9pm.",
  },
];

const TABS = [
  { id: "watch", label: "Now" },
  { id: "ask", label: "Ask Sprout" },
  { id: "hardware", label: "Hardware" },
  { id: "research", label: "Research" },
];

const RESEARCH_TABS = [
  { id: "why", label: "Why Sprout" },
  { id: "tracker", label: "Live tracker" },
  { id: "fact", label: "Daily fact" },
  { id: "about", label: "About" },
  { id: "howto", label: "How to use" },
];

const HOW_TO_STEPS = [
  {
    title: "Read the map",
    body: "The satellite map shows publicly known U.S. data center hubs. Markers sit at real locations (Ashburn, Santa Clara, Dallas, and more). Drag to pan, scroll to zoom, right-drag or two-finger drag to tilt the 3D view.",
  },
  {
    title: "Watch the grid stress panel",
    body: "The dark panel cycles through relaxed, climbing, and peak states. Marker colors match that stress level. The reading comes from CAISO’s public real-time demand feed (California ISO only). If it is unavailable, Sprout falls back to a labelled demo cycle.",
  },
  {
    title: "Check the Daily fact tab",
    body: "Each day we show a green AI routing tip (lowest-carbon model region + Virginia grid context). When Carbonbench’s live API is up we use that; otherwise Sprout serves a curated snapshot so the tab still works.",
  },
  {
    title: "Open the Live tracker",
    body: "The Live tracker lists dated research logs: milestones, daily AI energy facts, grid snapshots, and waitlist interest by day, plus a clear note on why each signal matters.",
  },
  {
    title: "Join the Hardware waitlist",
    body: "Tell Sprout what device you want (smart plug, display, or both). Signups are stored in our waitlist database and emailed to marissacurry@berkeley.edu — a local backup also stays in this browser.",
  },
  {
    title: "Use the bill tip before big loads",
    body: "Under “What this means for your bill,” you’ll get a plain-language tip: run dishwasher / laundry / EV charging now, or wait. Check this before you start high-draw appliances.",
  },
  {
    title: "Remember the honesty line",
    body: "This page shows known cluster locations and regional demand context — not live per-facility metering. Individual data center energy use isn’t public data.",
  },
];

function useTicker(len, ms = 5000) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % len), ms);
    return () => clearInterval(id);
  }, [len, ms]);
  return i;
}

function useLiveGrid() {
  const [live, setLive] = useState(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/grid");
        const data = res.ok ? await res.json() : null;
        if (cancelled) return;
        if (data?.ok) {
          setLive(data);
          setStatus("live");
        } else {
          setStatus((prev) => (prev === "live" ? prev : "demo"));
        }
      } catch {
        if (!cancelled) setStatus((prev) => (prev === "live" ? prev : "demo"));
      }
    }
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  return { live, status };
}

function Icon({ children, size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function MapPinIcon({ size, color }) {
  return (
    <Icon size={size} color={color}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  );
}

function ZapIcon({ size, color }) {
  return (
    <Icon size={size} color={color}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Icon>
  );
}

function ClockIcon({ size, color }) {
  return (
    <Icon size={size} color={color}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Icon>
  );
}

function TrendingDownIcon({ size, color }) {
  return (
    <Icon size={size} color={color}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </Icon>
  );
}

function InfoIcon({ size, color }) {
  return (
    <Icon size={size} color={color}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </Icon>
  );
}

function LightbulbIcon({ size, color }) {
  return (
    <Icon size={size} color={color}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
    </Icon>
  );
}

function SproutIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22v-8" stroke="#8FA876" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M12 14c-4-1-7-4-7-8 4 0 7 3 7 8z"
        fill="#F2C6C2"
        stroke="#E8A8A3"
        strokeWidth="1.2"
      />
      <path
        d="M12 12c4-1 7-3.5 7-7.5-4 0-7 2.5-7 7.5z"
        fill="#8FA876"
        stroke="#7A9464"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default function DataCenterWatch() {
  const idx = useTicker(GRID_STATES.length);
  const { live, status: gridStatus } = useLiveGrid();
  const state = live ? GRID_STATES.find((g) => g.key === live.stateKey) || GRID_STATES[idx] : GRID_STATES[idx];
  const [hovered, setHovered] = useState(null);
  const [tab, setTab] = useState("watch");
  const [sub, setSub] = useState("why");
  const onHoverChange = useCallback((name) => setHovered(name), []);

  useEffect(() => {
    if (gridStatus === "live") logGridSnapshotEvent(state, live);
    else if (gridStatus === "demo") logGridSnapshotEvent(state, null);
    // Log once per page load once we know whether the live feed is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridStatus]);

  return (
    <div
      className="dcw-root min-h-screen w-full text-stone-800"
      style={{
        fontFamily: "'Nunito', sans-serif",
        background:
          "radial-gradient(ellipse at 12% 8%, rgba(242,198,194,0.55) 0%, transparent 42%), radial-gradient(ellipse at 88% 12%, rgba(143,168,118,0.28) 0%, transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(242,198,194,0.22) 0%, transparent 45%), #FAF6F0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        .dcw-root .display-font { font-family: 'Fredoka', sans-serif; }
        .dcw-root .pulse { animation: dcw-pulse 2.6s ease-in-out infinite; }
        @keyframes dcw-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.55; }
        }
        .dcw-root .fade { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .dcw-root .float-soft { animation: dcw-float 5.5s ease-in-out infinite; }
        @keyframes dcw-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .dcw-root .state-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          transition: transform 0.35s ease, background 0.35s ease, box-shadow 0.35s ease;
        }
        .dcw-root .state-dot.active {
          transform: scale(1.35);
          box-shadow: 0 0 0 4px rgba(242, 198, 194, 0.35);
        }
        .dcw-root a.home-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(143, 168, 118, 0.22);
        }
        .dcw-root .dcw-map-shell {
          position: relative;
          width: 100%;
          min-height: 320px;
          height: clamp(320px, 42vw, 440px);
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .dcw-root .maplibregl-ctrl-attrib {
          font-size: 10px;
          background: rgba(250, 246, 240, 0.85) !important;
        }
        .dcw-root .maplibregl-ctrl-group {
          border: 2px solid #F2C6C2 !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 8px 18px rgba(58, 58, 50, 0.12);
        }
        .dcw-root .dcw-tab {
          border: none;
          cursor: pointer;
          font-family: 'Fredoka', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.7rem 1.25rem;
          border-radius: 999px;
          transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
        }
        .dcw-root .dcw-tab:focus-visible {
          outline: 2px solid #8FA876;
          outline-offset: 3px;
        }
        .dcw-root .dcw-input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          border-radius: 1rem;
          border: 1.5px solid rgba(143, 168, 118, 0.35);
          background: rgba(250, 246, 240, 0.95);
          padding: 0.7rem 0.9rem;
          font-family: 'Nunito', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #3A3A32;
        }
        .dcw-root .dcw-input:focus {
          outline: 2px solid #8FA876;
          outline-offset: 2px;
        }
        .dcw-root .dcw-tablist {
          flex-wrap: wrap;
        }
        .dcw-root .dcw-about-link {
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 800;
        }
        .dcw-root .dcw-about-link:hover {
          opacity: 0.85;
        }
        .dcw-root .dcw-sprout-dance {
          width: clamp(96px, 18vw, 140px);
          height: auto;
          image-rendering: pixelated;
          image-rendering: crisp-edges;
          mix-blend-mode: multiply;
          filter: drop-shadow(0 10px 18px rgba(143, 168, 118, 0.28));
          animation: dcw-sprout-bob 1.1s ease-in-out infinite;
        }
        @keyframes dcw-sprout-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dcw-root .dcw-sprout-dance { animation: none; }
        }
      `}</style>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-8 pb-5">
        <a
          href="/"
          className="text-sm font-extrabold"
          style={{ color: "#7A9464", textDecoration: "none" }}
        >
          ← Home
        </a>

        <div className="flex items-center gap-4 mt-3">
          <img
            src="/pixel_sprout_dancing.gif"
            alt="Sprout dancing"
            className="dcw-sprout-dance"
            width={72}
            height={72}
            style={{ width: 72, height: 72 }}
          />
          <div>
            <h1
              className="display-font text-4xl sm:text-5xl font-semibold leading-tight"
              style={{ color: "#3A3A32" }}
            >
              Sprout
            </h1>
            <p className="text-base font-semibold text-stone-600 mt-1">
              Where data centers sit on the grid, and when to run your appliances.
            </p>
          </div>
        </div>

        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1.5px solid rgba(143,168,118,0.35)",
            color: live ? "#4F6B3A" : "#8A5F12",
          }}
          role="status"
        >
          <span
            className={live ? "pulse" : ""}
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: live ? "#8FA876" : "#D9A441",
              display: "inline-block",
            }}
          />
          {live
            ? `Live · CAISO ${(live.currentMW / 1000).toFixed(1)} GW · ${live.pctOfPeak}% of forecast peak · ${live.asOf}`
            : gridStatus === "loading"
              ? "Checking the grid…"
              : "Demo mode · live grid feed unavailable"}
        </div>

        <div
          className="dcw-tablist mt-4 flex gap-1 p-1.5 rounded-full w-fit max-w-full"
          style={{ background: "rgba(241,237,228,0.9)", border: "1.5px solid rgba(242,198,194,0.55)" }}
          role="tablist"
          aria-label="Sprout sections"
        >
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="dcw-tab"
                onClick={() => setTab(t.id)}
                style={{
                  background: active
                    ? "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)"
                    : "transparent",
                  color: active ? "#7A3B36" : "#6b6358",
                  boxShadow: active ? "0 6px 14px rgba(242,198,194,0.45)" : "none",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "ask" ? (
        <AskSprout InfoIcon={InfoIcon} SproutIcon={SproutIcon} gridKey={state.key} live={live} onOpenTab={setTab} />
      ) : null}

      {tab === "research" ? (
        <div className="max-w-5xl mx-auto px-6 pb-5">
          <div
            role="tablist"
            aria-label="Research sections"
            className="flex flex-wrap gap-x-6 gap-y-1"
            style={{ borderBottom: "1.5px solid rgba(143,168,118,0.3)" }}
          >
            {RESEARCH_TABS.map((t) => {
              const active = sub === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSub(t.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.55rem 0",
                    marginBottom: -1.5,
                    fontFamily: "'Fredoka', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: active ? "#7A3B36" : "#8a8478",
                    borderBottom: active ? "3px solid #E8A8A3" : "3px solid transparent",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === "research" && sub === "fact" ? (
        <DailyEnergyFact
          InfoIcon={InfoIcon}
          LightbulbIcon={LightbulbIcon}
          ZapIcon={ZapIcon}
        />
      ) : null}

      {tab === "research" && sub === "tracker" ? <LiveDataTracker InfoIcon={InfoIcon} /> : null}

      {tab === "hardware" ? <HardwareInterest SproutIcon={SproutIcon} /> : null}

      {tab === "research" && sub === "why" ? <JudgingCriteria InfoIcon={InfoIcon} onOpenTab={setTab} /> : null}

      {tab === "research" && sub === "about" ? <AboutProject InfoIcon={InfoIcon} /> : null}

      {tab === "research" && sub === "howto" ? (
        <section className="max-w-5xl mx-auto px-6 pb-16" role="tabpanel" aria-label="How to use this page">
          <div
            className="rounded-[2rem] p-6 sm:p-8"
            style={{
              background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
              border: "2px solid rgba(242,198,194,0.45)",
              boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
            }}
          >
            <div className="flex items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
              <InfoIcon size={16} color="#8FA876" />
              How to use this page
            </div>
            <h2 className="display-font text-3xl font-semibold" style={{ color: "#3A3A32" }}>
              A quick walkthrough
            </h2>
            <p className="text-sm font-semibold text-stone-600 mt-2 max-w-2xl">
              Use Sprout to decide when to run high-draw appliances based on
              regional grid stress near major data center hubs, and help ship hardware.
            </p>

            <ol className="mt-8 space-y-4 list-none p-0 m-0">
              {HOW_TO_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl p-4 sm:p-5"
                  style={{
                    background: "rgba(250,246,240,0.85)",
                    border: "1.5px solid rgba(143,168,118,0.22)",
                  }}
                >
                  <span
                    className="display-font shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
                    style={{ background: "#F2C6C2", color: "#7A3B36" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="display-font text-lg font-bold" style={{ color: "#3A3A32" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm font-semibold text-stone-600 mt-1 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <button
              type="button"
              className="dcw-tab mt-8"
              onClick={() => setTab("watch")}
              style={{
                background: "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)",
                color: "#7A3B36",
                boxShadow: "0 8px 18px rgba(242,198,194,0.4)",
                border: "2px solid #E8A8A3",
              }}
            >
              Back to Now →
            </button>
          </div>
        </section>
      ) : null}

      {/* Keep map mounted so tab switches don't reload MapLibre */}
      <div style={{ display: tab === "watch" ? "block" : "none" }} role="tabpanel" aria-hidden={tab !== "watch"}>
          {/* MAP + STATE PANEL */}
          <section className="max-w-5xl mx-auto px-6 pb-14 grid md:grid-cols-5 gap-8">
            <div
              className="md:col-span-3 rounded-[2rem] p-6 relative"
              style={{
                background: "linear-gradient(160deg, #F7F2E8 0%, #F1EDE4 55%, #EDE6DA 100%)",
                border: "2px solid rgba(242,198,194,0.45)",
                boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold" style={{ color: "#8FA876" }}>
                  <MapPinIcon size={16} color="#8FA876" />
                  Known U.S. clusters
                </div>
                <div className="text-xs font-bold text-stone-400">
                  {CLUSTERS.length} hubs · drag to tilt
                </div>
              </div>

              <div className="dcw-map-shell">
                <UsClusterMap
                  clusters={CLUSTERS}
                  markerColor={live ? "#8FA876" : state.color}
                  hovered={hovered}
                  onHoverChange={onHoverChange}
                  visible={tab === "watch"}
                />
              </div>
              <div className="mt-2 text-sm font-semibold text-stone-500 min-h-[20px]">
                {hovered
                  ? `${hovered} — ${CLUSTERS.find((c) => c.name === hovered)?.note}`
                  : "Known cluster locations and regional demand, not live per-facility tracking. Hover or tap a marker."}
              </div>
            </div>

            <div
              className="md:col-span-2 rounded-[2rem] p-6 fade"
              style={{
                background: "linear-gradient(165deg, #45453C 0%, #3A3A32 55%, #2F2F28 100%)",
                color: "#FAF6F0",
                boxShadow: `0 18px 40px rgba(58,58,50,0.18), 0 0 0 1px ${state.glow}`,
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <ZapIcon size={18} color={state.color} />
                  <span className="display-font text-xl font-bold">{state.label}</span>
                </div>
                <div className="flex items-center gap-1.5" aria-label="Grid stress cycle" style={{ display: live ? "none" : "flex" }}>
                  {GRID_STATES.map((s, i) => (
                    <span
                      key={s.key}
                      className={`state-dot${i === idx ? " active" : ""}`}
                      style={{ background: i === idx ? state.color : "#55554A" }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-3xl display-font font-bold fade" style={{ color: state.color }}>
                {live ? `${(live.currentMW / 1000).toFixed(1)} GW` : state.price}
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color: "#B9B4A6" }}>
                {live
                  ? `CAISO demand now · ${live.pctOfPeak}% of today's forecast peak · ${live.asOf}`
                  : "est. regional marginal price · demo cycle"}
              </div>
              {live?.price ? (
                <div className="mt-2 text-sm font-bold" style={{ color: "#F2C6C2" }}>
                  Wholesale price now: ${live.price.usdPerMWh.toFixed(2)}/MWh
                  <span className="block text-xs font-semibold mt-0.5" style={{ color: "#B9B4A6" }}>
                    CAISO {live.price.hub} hub, 5-minute real-time. Wholesale, not your retail rate.
                  </span>
                </div>
              ) : null}

              <div className="mt-5 pt-5" style={{ borderTop: "1px solid #55554A" }}>
                <div className="flex items-center gap-1.5 text-sm font-bold mb-1.5" style={{ color: "#F2C6C2" }}>
                  <LightbulbIcon size={15} color="#F2C6C2" />
                  What this means for your bill
                </div>
                <p className="text-sm font-semibold leading-relaxed fade" style={{ color: "#D8D4C8" }}>
                  {state.tip}
                </p>
              </div>

              <div
                className="mt-5 rounded-2xl px-3.5 py-3 text-xs font-semibold leading-relaxed"
                style={{ background: "rgba(242,198,194,0.12)", color: "#E8DFD2" }}
              >
                {live
                  ? "Live from CAISO's public demand feed, updated every 5 minutes. It covers the California ISO region only; other regions are not connected yet."
                  : "Live grid feed unavailable right now. These states auto-cycle as a labelled demo so you can preview the experience."}
              </div>

              <button
                type="button"
                className="dcw-tab mt-5 w-full"
                onClick={() => setTab("ask")}
                style={{
                  background: "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)",
                  color: "#7A3B36",
                  border: "2px solid #E8A8A3",
                }}
              >
                Get tonight&apos;s plan →
              </button>
            </div>
          </section>

          {/* QUICK TIPS */}
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <div
              className="rounded-2xl p-5 grid sm:grid-cols-2 gap-5"
              style={{
                background: "linear-gradient(180deg, #FFF9F5 0%, #F1EDE4 100%)",
                border: "1.5px solid rgba(143,168,118,0.25)",
              }}
            >
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5"><ClockIcon size={20} color="#8FA876" /></span>
                <p className="text-sm font-semibold text-stone-600">
                  <strong style={{ color: "#3A3A32" }}>Check before big loads.</strong>{" "}
                  Dishwasher, laundry, and EV charging cost less when the grid isn&apos;t stretched thin.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="shrink-0 mt-0.5"><TrendingDownIcon size={20} color="#D9A441" /></span>
                <p className="text-sm font-semibold text-stone-600">
                  <strong style={{ color: "#3A3A32" }}>Match your plan.</strong>{" "}
                  On time-of-use billing, peak windows here usually line up with your utility&apos;s priciest hours.
                </p>
              </div>
            </div>
          </section>
      </div>

      <AboutFooterBlurb />
    </div>
  );
}
