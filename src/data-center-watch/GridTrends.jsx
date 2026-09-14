import { useEffect, useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart,
} from "recharts";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REGIONS = ["CAISO", "ERCOT", "PJM"];

function formatPrice(val) {
  return val ? `$${Math.round(val)}` : "—";
}

function formatDemand(val) {
  return val ? `${Math.round(val / 1000)}k` : "—";
}

function getStressColor(stress) {
  if (stress >= 0.75) return "#C9634B";
  if (stress >= 0.40) return "#D9A441";
  return "#8FA876";
}

function getStressLabel(stress) {
  if (stress >= 0.75) return "Stressed";
  if (stress >= 0.40) return "Moderate";
  return "Calm";
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div
      className="rounded-xl p-3 shadow-lg"
      style={{
        background: "rgba(250,246,240,0.98)",
        border: "1.5px solid rgba(143,168,118,0.35)",
      }}
    >
      <p className="text-xs font-bold text-stone-800 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toFixed(2) || "—"}
        </p>
      ))}
    </div>
  );
};

export default function GridTrends({ InfoIcon }) {
  const [region, setRegion] = useState("CAISO");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [heatmapMode, setHeatmapMode] = useState("stress"); // stress, price, demand
  const [timeRange, setTimeRange] = useState("168"); // hours

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sprout-grid?region=${region}&hours=${timeRange}`);
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
  }, [region, timeRange]);

  const heatmapGrid = data?.heatmap || [];
  const trends = data?.trends || [];
  const hourlyProfile = data?.hourlyProfile || [];
  const stressDistribution = data?.stressDistribution || [];
  const topSpikes = data?.topSpikes || [];
  const provenance = data?.provenance || {};

  // Reshape heatmap
  const heatmapByDay = Array(7).fill(null).map((_, day) =>
    heatmapGrid.filter(cell => cell.day === day).sort((a, b) => a.hour - b.hour)
  );

  // Format trends for recharts
  const trendsFormatted = trends.map(t => ({
    ...t,
    time: new Date(t.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' }),
  }));

  // Format hourly profile
  const profileFormatted = hourlyProfile.map(h => ({
    ...h,
    hourLabel: `${h.hour}:00`,
  }));

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16" role="tabpanel" aria-label="Grid trends and analytics">
      <div
        className="rounded-[2rem] p-6 sm:p-8"
        style={{
          background: "linear-gradient(160deg, #FFF9F5 0%, #F1EDE4 55%, #EDE6DA 100%)",
          border: "2px solid rgba(242,198,194,0.45)",
          boxShadow: "0 18px 40px rgba(58,58,50,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold mb-2" style={{ color: "#8FA876" }}>
          {InfoIcon ? <InfoIcon size={16} color="#8FA876" /> : null}
          In-depth grid analytics
        </div>

        <h2 className="display-font text-3xl sm:text-4xl font-semibold" style={{ color: "#3A3A32" }}>
          Regional demand deep dive
        </h2>
        <p className="text-base font-semibold text-stone-600 mt-3 leading-relaxed max-w-4xl">
          Multi-series time series, stress distribution, hour-of-day profiles, and peak spike identification. Interview-ready analytics for grid demand research.
        </p>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>Region</span>
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
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>Range</span>
            {[["24", "24h"], ["168", "7d"], ["336", "14d"]].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setTimeRange(val)}
                className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-all"
                style={{
                  background: timeRange === val ? "#8FA876" : "#FFF8F4",
                  color: timeRange === val ? "#FFF" : "#6b6358",
                  border: `1.5px solid ${timeRange === val ? "#8FA876" : "#E8DFD2"}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Provenance */}
        {data && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-stone-600">
            <span><strong>{data.dataPoints}</strong> readings</span>
            <span><strong>{Math.round(data.hoursCovered / 24)}</strong> days coverage</span>
            {provenance.seed > 0 && (
              <span className="px-2 py-0.5 rounded" style={{ background: "rgba(217,164,65,0.15)", color: "#8a6a20" }}>
                <strong>{provenance.seed}</strong> seed • <strong>{provenance.live}</strong> live ({Math.round(provenance.pctLive * 100)}% live)
              </span>
            )}
          </div>
        )}

        {/* Honesty Label */}
        <div
          className="mt-4 rounded-2xl px-4 py-3 text-xs font-semibold leading-relaxed"
          style={{ background: "rgba(242,198,194,0.18)", color: "#7A3B36", border: "1.5px solid rgba(232,168,163,0.35)" }}
        >
          <span className="font-extrabold">Methodology:</span> Regional price + demand from {region} public feeds (source: {provenance.seed > 0 ? "SEED data" : "live"}).
          This is NOT per-facility data-center load. Individual facility energy isn&apos;t public; data centers contribute to regional demand patterns.
        </div>

        {loading ? (
          <div className="mt-8 text-center py-8">
            <p className="text-sm font-bold text-stone-500">Loading analytics…</p>
          </div>
        ) : error ? (
          <div className="mt-8 text-center py-8">
            <p className="text-sm font-bold text-stone-600">{error}</p>
            <p className="text-xs font-semibold text-stone-500 mt-2">
              Apply <code className="bg-stone-200 px-1 rounded">sprout/schema/grid_readings_postgres.sql</code> in Supabase.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-12">
            
            {/* 1. MULTI-SERIES TIME SERIES */}
            <div>
              <h3 className="display-font text-2xl font-semibold mb-4" style={{ color: "#3A3A32" }}>
                Time Series: Price, Demand, Stress (6h buckets)
              </h3>
              <div className="rounded-xl p-4" style={{ background: "rgba(250,246,240,0.9)", border: "1.5px solid rgba(143,168,118,0.22)" }}>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={trendsFormatted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD2" />
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#6b6358" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#6b6358" }} label={{ value: "$/MWh & MW/100", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b6358" } }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tick={{ fontSize: 11, fill: "#6b6358" }} label={{ value: "Stress", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#6b6358" } }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                    <Area yAxisId="right" type="monotone" dataKey="avgStress" name="Stress Score" fill="#8FA87640" stroke="#8FA876" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="avgPrice" name="Price ($/MWh)" stroke="#D9A441" strokeWidth={2} dot={false} />
                    <Line yAxisId="left" type="monotone" dataKey="avgDemand" name="Demand (MW÷100)" stroke="#C9634B" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. HOUR-OF-DAY PROFILE */}
            <div>
              <h3 className="display-font text-2xl font-semibold mb-4" style={{ color: "#3A3A32" }}>
                Hour-of-Day Average Profile (UTC)
              </h3>
              <div className="rounded-xl p-4" style={{ background: "rgba(250,246,240,0.9)", border: "1.5px solid rgba(143,168,118,0.22)" }}>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={profileFormatted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD2" />
                    <XAxis dataKey="hourLabel" tick={{ fontSize: 10, fill: "#6b6358" }} interval={2} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b6358" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                    <Line type="monotone" dataKey="avgStress" name="Avg Stress" stroke="#8FA876" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs font-semibold text-stone-600 mt-2 text-center">
                  Peak stress typically 5pm-8pm UTC (afternoon/evening in US timezones)
                </p>
              </div>
            </div>

            {/* 3. STRESS DISTRIBUTION HISTOGRAM */}
            <div>
              <h3 className="display-font text-2xl font-semibold mb-4" style={{ color: "#3A3A32" }}>
                Stress Score Distribution
              </h3>
              <div className="rounded-xl p-4" style={{ background: "rgba(250,246,240,0.9)", border: "1.5px solid rgba(143,168,118,0.22)" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stressDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD2" />
                    <XAxis dataKey="bin" tick={{ fontSize: 10, fill: "#6b6358" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b6358" }} label={{ value: "Count", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#6b6358" } }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Readings" fill="#D9A441" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold text-stone-700">
                  <div><span className="text-stone-500">Calm (&lt;0.4):</span> {stressDistribution.slice(0,4).reduce((a,c) => a+c.count, 0)}</div>
                  <div><span className="text-stone-500">Moderate (0.4-0.75):</span> {stressDistribution.slice(4,8).reduce((a,c) => a+c.count, 0)}</div>
                  <div><span className="text-stone-500">Stressed (&gt;0.75):</span> {stressDistribution.slice(8).reduce((a,c) => a+c.count, 0)}</div>
                </div>
              </div>
            </div>

            {/* 4. TOP SPIKE HOURS TABLE */}
            <div>
              <h3 className="display-font text-2xl font-semibold mb-4" style={{ color: "#3A3A32" }}>
                Top 10 Peak Stress Hours
              </h3>
              <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(143,168,118,0.22)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead style={{ background: "rgba(143,168,118,0.15)" }}>
                      <tr className="text-left">
                        <th className="px-3 py-2 font-extrabold" style={{ color: "#6b6358" }}>Timestamp (UTC)</th>
                        <th className="px-3 py-2 font-extrabold text-right" style={{ color: "#6b6358" }}>Avg Stress</th>
                        <th className="px-3 py-2 font-extrabold text-right" style={{ color: "#6b6358" }}>Max Stress</th>
                        <th className="px-3 py-2 font-extrabold text-right" style={{ color: "#6b6358" }}>Avg Price</th>
                        <th className="px-3 py-2 font-extrabold text-right" style={{ color: "#6b6358" }}>Readings</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: "rgba(250,246,240,0.9)" }}>
                      {topSpikes.length === 0 ? (
                        <tr><td colSpan="5" className="px-3 py-4 text-center text-stone-500 font-semibold">No spike data available</td></tr>
                      ) : (
                        topSpikes.map((spike, i) => (
                          <tr key={i} className="border-t" style={{ borderColor: "#E8DFD2" }}>
                            <td className="px-3 py-2 font-semibold text-stone-800">
                              {new Date(spike.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-3 py-2 text-right font-bold" style={{ color: getStressColor(spike.avgStress) }}>
                              {spike.avgStress.toFixed(3)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-stone-700">
                              {spike.maxStress.toFixed(3)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-stone-700">
                              {formatPrice(spike.avgPrice)}/MWh
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-stone-600">
                              {spike.count}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 5. ENHANCED HEATMAP */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h3 className="display-font text-2xl font-semibold" style={{ color: "#3A3A32" }}>
                  Stress Heatmap: Day × Hour
                </h3>
                <div className="flex gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: "#6b6358" }}>View</span>
                  {[["stress", "Stress"], ["price", "Price"], ["demand", "Demand"]].map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setHeatmapMode(mode)}
                      className="rounded-full px-3 py-1 text-xs font-bold transition-all"
                      style={{
                        background: heatmapMode === mode ? "#7A3B36" : "#FFF8F4",
                        color: heatmapMode === mode ? "#FFF" : "#6b6358",
                        border: `1.5px solid ${heatmapMode === mode ? "#7A3B36" : "#E8DFD2"}`,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="grid grid-cols-[auto_repeat(24,_1fr)] gap-0.5" style={{ minWidth: "800px" }}>
                    <div className="text-xs font-bold text-stone-600 flex items-center justify-end pr-2">Hour</div>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="text-xs font-bold text-center text-stone-600 py-1">{i}</div>
                    ))}

                    {heatmapByDay.map((dayCells, dayIdx) => (
                      <>
                        <div key={`label-${dayIdx}`} className="text-xs font-bold text-stone-600 flex items-center justify-end pr-2">
                          {DAY_LABELS[dayIdx]}
                        </div>
                        {dayCells.map((cell, hour) => {
                          const value = heatmapMode === "stress" ? cell.avgStress : heatmapMode === "price" ? cell.avgPrice / 100 : cell.avgDemand / 40000;
                          const color = getStressColor(value);
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
                              title={`${DAY_LABELS[dayIdx]} ${hour}:00`}
                            />
                          );
                        })}
                      </>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: "#8FA876" }} />
                      <span>Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: "#D9A441" }} />
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: "#C9634B" }} />
                      <span>High</span>
                    </div>
                  </div>

                  {hoveredCell && (() => {
                    const cell = heatmapByDay[hoveredCell.day]?.[hoveredCell.hour];
                    if (!cell || cell.count === 0) return null;
                    return (
                      <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(242,198,194,0.18)", border: "1.5px solid rgba(232,168,163,0.35)" }}>
                        <p className="text-sm font-bold" style={{ color: "#3A3A32" }}>
                          {DAY_LABELS[hoveredCell.day]} {hoveredCell.hour}:00-{hoveredCell.hour + 1}:00 UTC
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-3 text-xs font-semibold text-stone-700">
                          <div><span className="text-stone-500">Avg Stress:</span> {cell.avgStress.toFixed(3)} ({getStressLabel(cell.avgStress)})</div>
                          <div><span className="text-stone-500">Stressed %:</span> {Math.round(cell.stressedPct * 100)}%</div>
                          <div><span className="text-stone-500">Avg Price:</span> {formatPrice(cell.avgPrice)}/MWh</div>
                          <div><span className="text-stone-500">Readings:</span> {cell.count}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}
