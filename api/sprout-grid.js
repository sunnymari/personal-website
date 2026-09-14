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
        totalStress: 0,
        totalPrice: 0,
        totalDemand: 0,
        stressedCount: 0,
      });
    }
    
    const bucket = buckets.get(bucketKey);
    bucket.count++;
    bucket.totalStress += r.stress_score || 0;
    bucket.totalPrice += r.price_per_mwh || 0;
    bucket.totalDemand += r.demand_mw || 0;
    if (r.grid_state === 'stressed') bucket.stressedCount++;
  });

  return Array.from(buckets.values())
    .map(b => ({
      timestamp: b.timestamp,
      avgStress: b.count > 0 ? b.totalStress / b.count : 0,
      avgPrice: b.count > 0 ? b.totalPrice / b.count : 0,
      avgDemand: b.count > 0 ? b.totalDemand / b.count : 0,
      stressedPct: b.count > 0 ? b.stressedCount / b.count : 0,
      count: b.count,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
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

    json(res, 200, {
      ok: true,
      region,
      dataPoints: result.readings.length,
      hoursCovered: hours,
      heatmap,
      trends,
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
