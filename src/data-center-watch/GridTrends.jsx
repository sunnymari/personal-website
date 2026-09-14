import { useEffect, useState } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REGIONS = ["CAISO", "ERCOT", "PJM"];

function formatPrice(val) {
  return val ? `$${Math.round(val)}/MWh` : "—";
}

function formatDemand(val) {
  return val ? `${Math.round(val / 1000)}k MW` : "—";
}

function getStressColor(stress) {
  if (stress >= 0.75) return "#C9634B"; // stressed - red
  if (stress >= 0.40) return "#D9A441"; // moderate - amber
  return "#8FA876"; // calm - green
}

function getStressLabel(stress) {
  if (stress >= 0.75) return "Stressed";
  if (stress >= 0.40) return "Moderate";
  return "Calm";
}

export default function GridTrends({ InfoIcon }) {
  const [region, setRegion] = useState("CAISO");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sprout-grid?region=${region}&hours=168`);
        const result = await res.json();
        if (cancelled) return;
        
        if (!result.ok) {
          setError(result.message || result.error || "Grid data unavailable");
          setData(null);
        } else {
          setData(result);
        }
      } catch (err) {
        if (cancelled) return;
        setError("Failed to load grid data");
        setData(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [region]);

  const heatmapGrid = data?.heatmap || [];
  const trends = data?.trends || [];

  // Reshape heatmap from flat array to 2D grid
  const heatmapByDay = Array(7).fill(null).map((_, day) =>
    heatmapGrid.filter(cell => cell.day === day).sort((a, b) => a.hour - b.hour)
  );

  return (
    <section className="max-w-6xl mx-auto px-6 pb-16" role="tabpanel" aria-label="Grid trends and heatmap">
      <div
        className="rounded-[2rem] p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
          border: "2px solid rgba(242,198,194,0.45)",
          boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
        }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
          {InfoIcon ? <InfoIcon size={16} color="#8FA876" /> : null}
          Grid trends & heatmap
        </div>

        <h2 className="display-font text-3xl sm:text-4xl font-semibold" style={{ color: "#3A3A32" }}>
          Regional demand patterns
        </h2>
        <p className="text-base font-semibold text-stone-600 mt-3 leading-relaxed max-w-3xl">
          Stress heatmap shows when grid demand peaks (day × hour). Trend comparison reveals price and demand evolution over the past week.
        </p>

        {/* Region Selector */}
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>
            Region
          </span>
          {REGIONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-all"
              style={{
                background: region === r ? "#7A3B36" : "#FFF8F4",
                color: region === r ? "#FFF8F4" : "#6b6358",
                border: `1.5px solid ${region === r ? "#7A3B36" : "#E8DFD2"}`,
              }}
            >
              {r}
            </button>
          ))}
          {data && (
            <span className="ml-2 text-xs font-bold text-stone-500">
              {data.dataPoints} readings • {Math.round(data.hoursCovered / 24)} days
            </span>
          )}
        </div>

        {/* Honesty Label */}
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-xs font-semibold leading-relaxed"
          style={{ background: "rgba(242,198,194,0.18)", color: "#7A3B36", border: "1.5px solid rgba(232,168,163,0.35)" }}
        >
          <span className="font-extrabold">Methodology:</span> Regional price + demand from {region} public feeds.
          This is NOT per-facility data-center load — individual facility energy use isn&apos;t public.
          Data centers contribute to regional demand; they don&apos;t uniquely cause stress patterns.
        </div>

        {loading ? (
          <div className="mt-8 text-center py-8">
            <p className="text-sm font-bold text-stone-500">Loading grid data…</p>
          </div>
        ) : error ? (
          <div className="mt-8 text-center py-8">
            <p className="text-sm font-bold text-stone-600">{error}</p>
            <p className="text-xs font-semibold text-stone-500 mt-2">
              Apply <code className="bg-stone-200 px-1 rounded">sprout/schema/grid_readings_postgres.sql</code> in Supabase to enable grid data.
            </p>
          </div>
        ) : (
          <>
            {/* HEATMAP */}
            <div className="mt-8">
              <h3 className="display-font text-2xl font-semibold mb-4" style={{ color: "#3A3A32" }}>
                Stress Heatmap: Day × Hour (UTC)
              </h3>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid grid-cols-[auto_repeat(24,_1fr)] gap-0.5" style={{ minWidth: "800px" }}>
                    {/* Header row: hours */}
                    <div className="text-xs font-bold text-stone-600 flex items-center justify-end pr-2">Hour</div>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="text-xs font-bold text-center text-stone-600 py-1">
                        {i}
                      </div>
                    ))}

                    {/* Data rows: one per day */}
                    {heatmapByDay.map((dayCells, dayIdx) => (
                      <>
                        <div key={`label-${dayIdx}`} className="text-xs font-bold text-stone-600 flex items-center justify-end pr-2">
                          {DAY_LABELS[dayIdx]}
                        </div>
                        {dayCells.map((cell, hour) => {
                          const color = getStressColor(cell.avgStress);
                          const isHovered = hoveredCell?.day === dayIdx && hoveredCell?.hour === hour;
                          return (
                            <div
                              key={`${dayIdx}-${hour}`}
                              className="relative aspect-square rounded cursor-pointer transition-transform hover:scale-110 hover:z-10"
                              style={{
                                backgroundColor: cell.count === 0 ? "#F5F5F5" : color,
                                opacity: cell.count === 0 ? 0.3 : 0.85,
                                border: isHovered ? "2px solid #3A3A32" : "1px solid rgba(255,255,255,0.5)",
                              }}
                              onMouseEnter={() => setHoveredCell({ day: dayIdx, hour })}
                              onMouseLeave={() => setHoveredCell(null)}
                              title={`${DAY_LABELS[dayIdx]} ${hour}:00 - ${getStressLabel(cell.avgStress)} - ${formatPrice(cell.avgPrice)}`}
                            />
                          );
                        })}
                      </>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: "#8FA876" }} />
                      <span>Calm (&lt;0.40)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: "#D9A441" }} />
                      <span>Moderate (0.40-0.75)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: "#C9634B" }} />
                      <span>Stressed (&gt;0.75)</span>
                    </div>
                  </div>

                  {hoveredCell && (
                    <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(242,198,194,0.18)", border: "1.5px solid rgba(232,168,163,0.35)" }}>
                      <p className="text-sm font-bold" style={{ color: "#3A3A32" }}>
                        {DAY_LABELS[hoveredCell.day]} {hoveredCell.hour}:00-{hoveredCell.hour + 1}:00 UTC
                      </p>
                      {(() => {
                        const cell = heatmapByDay[hoveredCell.day]?.[hoveredCell.hour];
                        if (!cell || cell.count === 0) return <p className="text-xs text-stone-500 mt-1">No data</p>;
                        return (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold text-stone-700">
                            <div>
                              <span className="text-stone-500">Status:</span>{" "}
                              <span style={{ color: getStressColor(cell.avgStress) }}>
                                {getStressLabel(cell.avgStress)}
                              </span>
                            </div>
                            <div><span className="text-stone-500">Avg Price:</span> {formatPrice(cell.avgPrice)}</div>
                            <div><span className="text-stone-500">Stress Score:</span> {cell.avgStress.toFixed(2)}</div>
                            <div><span className="text-stone-500">Readings:</span> {cell.count}</div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TREND COMPARISON */}
            <div className="mt-12">
              <h3 className="display-font text-2xl font-semibold mb-4" style={{ color: "#3A3A32" }}>
                Trend Comparison: Past 7 Days
              </h3>
              
              {trends.length === 0 ? (
                <p className="text-sm font-semibold text-stone-600">No trend data available.</p>
              ) : (
                <div className="space-y-6">
                  {/* Price Trend */}
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: "#6b6358" }}>
                      Price ($/MWh)
                    </h4>
                    <div className="relative h-32 rounded-xl p-4" style={{ background: "rgba(250,246,240,0.9)", border: "1.5px solid rgba(143,168,118,0.22)" }}>
                      <svg viewBox="0 0 1000 100" className="w-full h-full" preserveAspectRatio="none">
                        <polyline
                          points={trends.map((t, i) => `${(i / (trends.length - 1)) * 1000},${100 - t.avgPrice}`).join(" ")}
                          fill="none"
                          stroke="#D9A441"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="absolute top-2 left-4 text-xs font-bold text-stone-700">
                        Max: {formatPrice(Math.max(...trends.map(t => t.avgPrice)))}
                      </div>
                      <div className="absolute bottom-2 left-4 text-xs font-bold text-stone-700">
                        Min: {formatPrice(Math.min(...trends.map(t => t.avgPrice)))}
                      </div>
                    </div>
                  </div>

                  {/* Demand Trend */}
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: "#6b6358" }}>
                      Demand (MW)
                    </h4>
                    <div className="relative h-32 rounded-xl p-4" style={{ background: "rgba(250,246,240,0.9)", border: "1.5px solid rgba(143,168,118,0.22)" }}>
                      <svg viewBox="0 0 1000 100" className="w-full h-full" preserveAspectRatio="none">
                        <polyline
                          points={trends.map((t, i) => `${(i / (trends.length - 1)) * 1000},${100 - (t.avgDemand / 400)}`).join(" ")}
                          fill="none"
                          stroke="#8FA876"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="absolute top-2 left-4 text-xs font-bold text-stone-700">
                        Max: {formatDemand(Math.max(...trends.map(t => t.avgDemand)))}
                      </div>
                      <div className="absolute bottom-2 left-4 text-xs font-bold text-stone-700">
                        Min: {formatDemand(Math.min(...trends.map(t => t.avgDemand)))}
                      </div>
                    </div>
                  </div>

                  {/* Stress Percentage */}
                  <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wide mb-2" style={{ color: "#6b6358" }}>
                      Stressed Readings (%)
                    </h4>
                    <div className="relative h-32 rounded-xl p-4" style={{ background: "rgba(250,246,240,0.9)", border: "1.5px solid rgba(143,168,118,0.22)" }}>
                      <svg viewBox="0 0 1000 100" className="w-full h-full" preserveAspectRatio="none">
                        <polyline
                          points={trends.map((t, i) => `${(i / (trends.length - 1)) * 1000},${100 - (t.stressedPct * 100)}`).join(" ")}
                          fill="none"
                          stroke="#C9634B"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="absolute top-2 left-4 text-xs font-bold text-stone-700">
                        Max: {Math.round(Math.max(...trends.map(t => t.stressedPct)) * 100)}%
                      </div>
                      <div className="absolute bottom-2 left-4 text-xs font-bold text-stone-700">
                        Min: {Math.round(Math.min(...trends.map(t => t.stressedPct)) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
