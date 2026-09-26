/**
 * Live grid reading from CAISO's public real-time demand feed (no API key).
 * GET /api/grid -> { ok, source, asOf, currentMW, forecastPeakMW, pctOfPeak, stateKey }
 *
 * Covers the California ISO region only. Stress is current demand as a share of
 * today's day-ahead forecast peak.
 */

const FEED = "https://www.caiso.com/outlook/current/demand.csv";
const RELAXED_BELOW = 75;
const PEAK_AT_OR_ABOVE = 90;

function json(res, status, body, cache = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

function parseDemand(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines.shift().split(",").map((h) => h.trim());
  const col = (name) => header.indexOf(name);
  const iTime = col("Time");
  const iForecast = col("Day ahead forecast");
  const iCurrent = col("Current demand");
  if (iTime < 0 || iForecast < 0 || iCurrent < 0) return null;

  let latest = null;
  let forecastPeak = 0;
  for (const line of lines) {
    const cells = line.split(",");
    const forecast = Number(cells[iForecast]);
    if (cells[iForecast]?.trim() && Number.isFinite(forecast)) {
      forecastPeak = Math.max(forecastPeak, forecast);
    }
    const current = Number(cells[iCurrent]);
    if (cells[iCurrent]?.trim() && Number.isFinite(current)) {
      latest = { time: cells[iTime].trim(), current };
    }
  }
  if (!latest || !forecastPeak) return null;
  return { latest, forecastPeak };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const upstream = await fetch(FEED, {
      headers: { "User-Agent": "Mozilla/5.0 (Sprout grid reader)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!upstream.ok) throw new Error(`CAISO ${upstream.status}`);

    const parsed = parseDemand(await upstream.text());
    if (!parsed) throw new Error("Unexpected CAISO format");

    const pctOfPeak = Math.round((parsed.latest.current / parsed.forecastPeak) * 1000) / 10;
    const stateKey =
      pctOfPeak >= PEAK_AT_OR_ABOVE ? "peak" : pctOfPeak < RELAXED_BELOW ? "low" : "rising";

    json(
      res,
      200,
      {
        ok: true,
        source: "CAISO",
        region: "California ISO",
        asOf: `${parsed.latest.time} PT`,
        currentMW: Math.round(parsed.latest.current),
        forecastPeakMW: Math.round(parsed.forecastPeak),
        pctOfPeak,
        stateKey,
      },
      "public, s-maxage=240, stale-while-revalidate=300",
    );
  } catch (err) {
    console.error("grid feed failure", String(err?.message || err).slice(0, 200));
    json(res, 502, { error: "Live grid data unavailable." });
  }
}
