import { useState, useEffect, useCallback } from "react";
import UsClusterMap from "./UsClusterMap.jsx";
import DailyEnergyFact from "./DailyEnergyFact.jsx";
import HardwareInterest from "./HardwareInterest.jsx";
import AboutProject, { AboutFooterBlurb } from "./AboutProject.jsx";

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
  { id: "watch", label: "Watch" },
  { id: "fact", label: "Daily fact" },
  { id: "hardware", label: "Hardware" },
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
    body: "The dark panel cycles through relaxed, climbing, and peak states. Marker colors match that stress level. Today this is a demo cycle — later it will pull the same live CAISO / EIA feed as Sprout hardware.",
  },
  {
    title: "Check the Daily fact tab",
    body: "Each day we pull a live AI energy-saving insight from Carbonbench (lowest-carbon model routing + Virginia grid intensity). It’s cached once per day in your browser.",
  },
  {
    title: "Join the Hardware waitlist",
    body: "Tell Sprout what device you want (smart plug, display, or both). Your email is sent to marissacurry@berkeley.edu so we can follow up — a local backup also stays in this browser.",
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
  const state = GRID_STATES[idx];
  const [hovered, setHovered] = useState(null);
  const [tab, setTab] = useState("watch");
  const onHoverChange = useCallback((name) => setHovered(name), []);

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
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <a
          href="/"
          className="home-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold mb-6 transition-all"
          style={{
            background: "linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%)",
            color: "#7A3B36",
            border: "2px solid #E8A8A3",
            textDecoration: "none",
            boxShadow: "0 8px 18px rgba(242,198,194,0.35)",
          }}
        >
          ← Home
        </a>

        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/pixel_sprout_dancing.gif"
            alt="Sprout dancing"
            className="dcw-sprout-dance"
            width={140}
            height={140}
          />
          <div className="flex items-center justify-center gap-2 text-sm font-bold mt-1" style={{ color: "#8FA876" }}>
            <span className="uppercase display-font tracking-wide">
              Tiny Sprout Smarter Grid
            </span>
          </div>
        </div>

        <h1
          className="display-font text-5xl sm:text-6xl font-semibold mt-2 leading-tight text-center sm:text-left"
          style={{ color: "#3A3A32" }}
        >
          Sprout Data Center Watch
        </h1>
        <p className="text-lg mt-3 max-w-2xl text-stone-600 font-semibold">
          Where major data center clusters sit on the grid, and what the current
          demand picture means for when it&apos;s cheapest to run your own appliances.
        </p>

        <div
          className="mt-4 inline-flex items-start sm:items-center gap-2 rounded-2xl sm:rounded-full px-4 py-2.5 text-sm font-bold max-w-xl"
          style={{ background: "#F2C6C2", color: "#7A3B36" }}
          role="note"
        >
          <span className="mt-0.5 sm:mt-0 shrink-0">
            <InfoIcon size={15} color="#7A3B36" />
          </span>
          <span>
            Shows publicly known cluster locations and regional demand — not live
            per-facility tracking.
          </span>
        </div>

        <div
          className="dcw-tablist mt-6 inline-flex gap-1 p-1.5 rounded-full"
          style={{ background: "rgba(241,237,228,0.9)", border: "1.5px solid rgba(242,198,194,0.55)" }}
          role="tablist"
          aria-label="Data Center Watch sections"
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

      {tab === "fact" ? (
        <DailyEnergyFact
          InfoIcon={InfoIcon}
          LightbulbIcon={LightbulbIcon}
          ZapIcon={ZapIcon}
        />
      ) : null}

      {tab === "hardware" ? <HardwareInterest SproutIcon={SproutIcon} /> : null}

      {tab === "about" ? <AboutProject InfoIcon={InfoIcon} /> : null}

      {tab === "howto" ? (
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
              Use Data Center Watch to decide when to run high-draw appliances based on
              regional grid stress near major data center hubs — and help Sprout ship hardware.
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
              Back to Watch →
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
                  markerColor={state.color}
                  hovered={hovered}
                  onHoverChange={onHoverChange}
                  visible={tab === "watch"}
                />
              </div>
              <div className="mt-2 text-sm font-semibold text-stone-500 min-h-[20px]">
                {hovered
                  ? `${hovered} — ${CLUSTERS.find((c) => c.name === hovered)?.note}`
                  : "Hover or tap a marker · drag to pan · right-drag / two-finger to tilt"}
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
                <div className="flex items-center gap-1.5" aria-label="Grid stress cycle">
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
                {state.price}
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color: "#B9B4A6" }}>
                est. regional marginal price · demo cycle
              </div>

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
                Live CAISO / EIA feed coming with Sprout hardware. Today&apos;s states auto-cycle so you can preview the experience.
              </div>
            </div>
          </section>

          {/* QUICK TIPS */}
          <section className="max-w-5xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(180deg, #FFF9F5 0%, #F1EDE4 100%)",
                border: "1.5px solid rgba(143,168,118,0.25)",
              }}
            >
              <ClockIcon size={22} color="#8FA876" />
              <h3 className="display-font text-lg font-bold mt-2" style={{ color: "#3A3A32" }}>
                Check before you run big loads
              </h3>
              <p className="text-sm font-semibold text-stone-600 mt-1">
                Dishwasher, laundry, EV charging, and AC pre-cooling cost less when
                the grid isn&apos;t stretched thin.
              </p>
            </div>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(180deg, #FFF9F5 0%, #F1EDE4 100%)",
                border: "1.5px solid rgba(217,164,65,0.22)",
              }}
            >
              <TrendingDownIcon size={22} color="#D9A441" />
              <h3 className="display-font text-lg font-bold mt-2" style={{ color: "#3A3A32" }}>
                Match your utility&apos;s TOU plan
              </h3>
              <p className="text-sm font-semibold text-stone-600 mt-1">
                If you&apos;re on time-of-use billing, peak windows here usually line up
                with your utility&apos;s most expensive hours too.
              </p>
            </div>
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(180deg, #FFF9F5 0%, #F1EDE4 100%)",
                border: "1.5px solid rgba(201,99,75,0.2)",
              }}
            >
              <MapPinIcon size={22} color="#C9634B" />
              <h3 className="display-font text-lg font-bold mt-2" style={{ color: "#3A3A32" }}>
                Clusters, not exact meters
              </h3>
              <p className="text-sm font-semibold text-stone-600 mt-1">
                Markers show publicly known data center hub locations. Individual
                facility energy use isn&apos;t public data — this shows regional
                demand context instead.
              </p>
            </div>
          </section>
      </div>

      <AboutFooterBlurb />
    </div>
  );
}
