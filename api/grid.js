/**
 * Live grid reading from CAISO's public feeds (no API key): real-time demand plus the
 * real-time wholesale price (LMP) at the NP15 trading hub.
 * GET /api/grid -> { ok, source, asOf, currentMW, forecastPeakMW, pctOfPeak, stateKey, price }
 *
 * Covers the California ISO region only. Stress is current demand as a share of
 * today's day-ahead forecast peak.
 */

import { inflateRawSync } from "node:zlib";

const FEED = "https://www.caiso.com/outlook/current/demand.csv";
const OASIS = "https://oasis.caiso.com/oasisapi/SingleZip";
const PRICE_NODE = "TH_NP15_GEN-APND";
const PRICE_MAX_AGE_MS = 45 * 60 * 1000;
const PRICE_CACHE_MS = 4 * 60 * 1000;
let priceCache = { at: 0, value: null };
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


function unzipFirstFile(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not a zip");
  const cd = buf.readUInt32LE(eocd + 16);
  if (buf.readUInt32LE(cd) !== 0x02014b50) throw new Error("Bad zip directory");
  const method = buf.readUInt16LE(cd + 10);
  const compressedSize = buf.readUInt32LE(cd + 20);
  const localOffset = buf.readUInt32LE(cd + 42);
  const start = localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
  const data = buf.subarray(start, start + compressedSize);
  return method === 0 ? data : inflateRawSync(data);
}

function oasisStamp(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}-0000`;
}

async function fetchPrice() {
  if (Date.now() - priceCache.at < PRICE_CACHE_MS) return priceCache.value;
  let value = null;
  try {
    const now = new Date();
    const url =
      `${OASIS}?queryname=PRC_INTVL_LMP&version=1&market_run_id=RTM&node=${PRICE_NODE}&resultformat=6` +
      `&startdatetime=${oasisStamp(new Date(now.getTime() - PRICE_MAX_AGE_MS))}&enddatetime=${oasisStamp(now)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Sprout grid reader)" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) throw new Error(`OASIS ${res.status}`);
    const lines = unzipFirstFile(Buffer.from(await res.arrayBuffer())).toString("utf8").trim().split(/\r?\n/);
    const head = lines.shift().split(",");
    const iType = head.indexOf("LMP_TYPE");
    const iStart = head.indexOf("INTERVALSTARTTIME_GMT");
    const iVal = head.indexOf("MW");
    let best = null;
    for (const line of lines) {
      const c = line.split(",");
      if (c[iType] !== "LMP") continue;
      const price = Number(c[iVal]);
      const at = Date.parse(c[iStart]);
      if (Number.isFinite(price) && Number.isFinite(at) && (!best || at > best.at)) best = { at, price };
    }
    if (best && Date.now() - best.at <= PRICE_MAX_AGE_MS) {
      value = {
        usdPerMWh: Math.round(best.price * 100) / 100,
        hub: "NP15",
        intervalStart: new Date(best.at).toISOString(),
      };
    }
  } catch (err) {
    console.error("price feed failure", String(err?.message || err).slice(0, 200));
  }
  priceCache = { at: Date.now(), value };
  return value;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const pricePromise = fetchPrice();
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
        price: await pricePromise,
      },
      "public, s-maxage=240, stale-while-revalidate=300",
    );
  } catch (err) {
    console.error("grid feed failure", String(err?.message || err).slice(0, 200));
    json(res, 502, { error: "Live grid data unavailable." });
  }
}
