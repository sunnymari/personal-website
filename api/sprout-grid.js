/**
 * Sprout grid readings API — heatmap + trend data
 * GET /api/sprout-grid → time series for visualization
 */

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=300"); // 5min cache for grid data
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(body));
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

async function fetchGridReadings(cfg, params = {}) {
  const { region = 'CAISO', hours = 168 } = params; // Default: last 7 days
  
  if (typeof fetch === 'undefined') {
    return { ok: false, error: 'fetch API not available', readings: [] };
  }

  try {
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
    const url = new URL(`${cfg.url}/rest/v1/grid_readings`);
    url.searchParams.set('select', 'timestamp,region,price_per_mwh,demand_mw,grid_state,stress_score');
    url.searchParams.set('region', `eq.${region}`);
    url.searchParams.set('timestamp', `gte.${since}`);
    url.searchParams.set('order', 'timestamp.asc');
    url.searchParams.set('limit', '1000');

    const res = await fetch(url.toString(), {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
    });

    if (!res.ok) {
      return { ok: false, error: `Database error: ${res.status}`, readings: [] };
    }

    const readings = await res.json();
    return { ok: true, readings: Array.isArray(readings) ? readings : [] };
  } catch (err) {
    console.error('[sprout-grid] Fetch error:', err.message);
    return { ok: false, error: err.message, readings: [] };
  }
}

function aggregateForHeatmap(readings) {
  // Create day-of-week × hour-of-day heatmap data
  const grid = Array(7).fill(null).map(() => Array(24).fill(null).map(() => ({
    count: 0,
    totalStress: 0,
    totalPrice: 0,
    stressedCount: 0,
  })));

  readings.forEach(r => {
    const date = new Date(r.timestamp);
    const dayOfWeek = date.getUTCDay(); // 0=Sunday
    const hour = date.getUTCHours();
    const cell = grid[dayOfWeek][hour];
    
    cell.count++;
    cell.totalStress += r.stress_score || 0;
    cell.totalPrice += r.price_per_mwh || 0;
    if (r.grid_state === 'stressed') cell.stressedCount++;
  });

  return grid.map((day, dayIdx) => 
    day.map((cell, hour) => ({
      day: dayIdx,
      hour,
      avgStress: cell.count > 0 ? cell.totalStress / cell.count : 0,
      avgPrice: cell.count > 0 ? cell.totalPrice / cell.count : 0,
      stressedPct: cell.count > 0 ? cell.stressedCount / cell.count : 0,
      count: cell.count,
    }))
  ).flat();
}

function aggregateForTrends(readings, bucketHours = 6) {
  // Group readings into time buckets for trend line
  if (readings.length === 0) return [];

  const buckets = new Map();
  readings.forEach(r => {
    const ts = new Date(r.timestamp).getTime();
    const bucketKey = Math.floor(ts / (bucketHours * 3600 * 1000)) * (bucketHours * 3600 * 1000);
    
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, {
        timestamp: new Date(bucketKey).toISOString(),
        count: 0,
        prices: [],
        stresses: [],
        demands: [],
        stressedCount: 0,
      });
    }
    
    const bucket = buckets.get(bucketKey);
    bucket.count++;
    if (r.stress_score != null) bucket.stresses.push(r.stress_score);
    if (r.price_per_mwh != null) bucket.prices.push(r.price_per_mwh);
    if (r.demand_mw != null) bucket.demands.push(r.demand_mw);
    if (r.grid_state === 'stressed') bucket.stressedCount++;
  });

  return Array.from(buckets.values())
    .map(b => ({
      timestamp: b.timestamp,
      avgStress: b.stresses.length > 0 ? b.stresses.reduce((a,c) => a+c, 0) / b.stresses.length : 0,
      minStress: b.stresses.length > 0 ? Math.min(...b.stresses) : 0,
      maxStress: b.stresses.length > 0 ? Math.max(...b.stresses) : 0,
      avgPrice: b.prices.length > 0 ? b.prices.reduce((a,c) => a+c, 0) / b.prices.length : 0,
      minPrice: b.prices.length > 0 ? Math.min(...b.prices) : 0,
      maxPrice: b.prices.length > 0 ? Math.max(...b.prices) : 0,
      avgDemand: b.demands.length > 0 ? b.demands.reduce((a,c) => a+c, 0) / b.demands.length : 0,
      minDemand: b.demands.length > 0 ? Math.min(...b.demands) : 0,
      maxDemand: b.demands.length > 0 ? Math.max(...b.demands) : 0,
      stressedPct: b.count > 0 ? b.stressedCount / b.count : 0,
      count: b.count,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function aggregateHourlyProfile(readings) {
  // Hour-of-day average profile (0-23)
  const hours = Array(24).fill(null).map(() => ({
    prices: [],
    stresses: [],
    demands: [],
    count: 0,
  }));

  readings.forEach(r => {
    const hour = new Date(r.timestamp).getUTCHours();
    const bucket = hours[hour];
    bucket.count++;
    if (r.price_per_mwh != null) bucket.prices.push(r.price_per_mwh);
    if (r.stress_score != null) bucket.stresses.push(r.stress_score);
    if (r.demand_mw != null) bucket.demands.push(r.demand_mw);
  });

  return hours.map((h, hour) => ({
    hour,
    avgPrice: h.prices.length > 0 ? h.prices.reduce((a,c) => a+c, 0) / h.prices.length : 0,
    avgStress: h.stresses.length > 0 ? h.stresses.reduce((a,c) => a+c, 0) / h.stresses.length : 0,
    avgDemand: h.demands.length > 0 ? h.demands.reduce((a,c) => a+c, 0) / h.demands.length : 0,
    count: h.count,
  }));
}

function getStressDistribution(readings) {
  // Histogram bins for stress scores
  const bins = Array(10).fill(0); // 0-0.1, 0.1-0.2, ..., 0.9-1.0
  let validCount = 0;

  readings.forEach(r => {
    if (r.stress_score != null) {
      validCount++;
      const bin = Math.min(Math.floor(r.stress_score * 10), 9);
      bins[bin]++;
    }
  });

  return bins.map((count, i) => ({
    bin: `${(i/10).toFixed(1)}-${((i+1)/10).toFixed(1)}`,
    binStart: i / 10,
    count,
    pct: validCount > 0 ? count / validCount : 0,
  }));
}

function getTopSpikeHours(readings, limit = 10) {
  // Find hours with highest average stress
  const hourBuckets = new Map();

  readings.forEach(r => {
    if (r.stress_score == null) return;
    const ts = new Date(r.timestamp);
    const hourKey = `${ts.toISOString().slice(0,13)}:00:00Z`;
    
    if (!hourBuckets.has(hourKey)) {
      hourBuckets.set(hourKey, {
        timestamp: hourKey,
        stresses: [],
        prices: [],
        demands: [],
      });
    }
    
    const bucket = hourBuckets.get(hourKey);
    bucket.stresses.push(r.stress_score);
    if (r.price_per_mwh != null) bucket.prices.push(r.price_per_mwh);
    if (r.demand_mw != null) bucket.demands.push(r.demand_mw);
  });

  return Array.from(hourBuckets.values())
    .map(h => ({
      timestamp: h.timestamp,
      avgStress: h.stresses.reduce((a,c) => a+c, 0) / h.stresses.length,
      maxStress: Math.max(...h.stresses),
      avgPrice: h.prices.length > 0 ? h.prices.reduce((a,c) => a+c, 0) / h.prices.length : 0,
      avgDemand: h.demands.length > 0 ? h.demands.reduce((a,c) => a+c, 0) / h.demands.length : 0,
      count: h.stresses.length,
    }))
    .sort((a, b) => b.avgStress - a.avgStress)
    .slice(0, limit);
}

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.end();
      return;
    }

    if (req.method !== "GET") {
      json(res, 405, { error: "GET only" });
      return;
    }

    const cfg = supabaseConfig();
    if (!cfg) {
      json(res, 200, {
        ok: false,
        message: "Database not configured. Apply sprout/schema/grid_readings_postgres.sql to enable grid data.",
        heatmap: [],
        trends: [],
        readings: [],
      });
      return;
    }

    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const region = url.searchParams.get('region') || 'CAISO';
    const hours = parseInt(url.searchParams.get('hours') || '168', 10);

    const result = await fetchGridReadings(cfg, { region, hours });
    
    if (!result.ok) {
      json(res, 200, {
        ok: false,
        error: result.error,
        message: "Grid data temporarily unavailable. Apply sprout/schema/grid_readings_postgres.sql if table doesn't exist.",
        heatmap: [],
        trends: [],
        readings: [],
      });
      return;
    }

    const heatmap = aggregateForHeatmap(result.readings);
    const trends = aggregateForTrends(result.readings, 6);
    const hourlyProfile = aggregateHourlyProfile(result.readings);
    const stressDistribution = getStressDistribution(result.readings);
    const topSpikes = getTopSpikeHours(result.readings, 10);

    // Data provenance
    const seedCount = result.readings.filter(r => r.source === 'SEED').length;
    const liveCount = result.readings.length - seedCount;

    json(res, 200, {
      ok: true,
      region,
      dataPoints: result.readings.length,
      hoursCovered: hours,
      provenance: {
        seed: seedCount,
        live: liveCount,
        pctLive: result.readings.length > 0 ? liveCount / result.readings.length : 0,
      },
      heatmap,
      trends,
      hourlyProfile,
      stressDistribution,
      topSpikes,
      readings: result.readings.slice(-100), // Last 100 raw points for detail view
    });

  } catch (err) {
    console.error("Handler error:", err);
    json(res, 500, {
      error: "Internal server error",
      message: err.message,
    });
  }
}
