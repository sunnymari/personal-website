/**
 * Largest U.S. power plants and energy providers, from EIA's public U.S. Energy Atlas
 * (ArcGIS feature service, no API key). Nameplate capacity, not real-time output.
 * GET /api/providers -> { ok, plants: [...], providers: [...] }
 */

const LAYER =
  "https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/Power_Plants_in_the_US/FeatureServer/0/query";
const MIN_PLANT_MW = 1000;

function json(res, status, body, cache = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

function fuelGroup(src) {
  const s = String(src || "").toLowerCase();
  if (s.includes("nuclear")) return "nuclear";
  if (s.includes("coal")) return "coal";
  if (s.includes("natural gas")) return "gas";
  if (s.includes("hydro") || s.includes("pumped")) return "hydro";
  if (s.includes("solar")) return "solar";
  if (s.includes("wind")) return "wind";
  return "other";
}

async function query(params) {
  const url = `${LAYER}?${new URLSearchParams({ f: "json", ...params })}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`EIA layer ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`EIA layer error ${data.error.code}`);
  return data.features || [];
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    json(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const [plantRows, providerRows] = await Promise.all([
      query({
        where: `Total_MW >= ${MIN_PLANT_MW}`,
        outFields: "Plant_Name,Utility_Na,PrimSource,Total_MW,State,Longitude,Latitude",
        orderByFields: "Total_MW DESC",
        resultRecordCount: "400",
        returnGeometry: "false",
      }),
      query({
        where: "Total_MW > 0",
        groupByFieldsForStatistics: "Utility_Na",
        outStatistics: JSON.stringify([
          { statisticType: "sum", onStatisticField: "Total_MW", outStatisticFieldName: "mw" },
        ]),
        orderByFields: "mw DESC",
        resultRecordCount: "10",
        returnGeometry: "false",
      }),
    ]);

    const plants = plantRows
      .map((f) => f.attributes)
      .filter(
        (a) =>
          Number.isFinite(a.Longitude) && Number.isFinite(a.Latitude) &&
          a.Longitude > -130 && a.Longitude < -65 && a.Latitude > 22 && a.Latitude < 52,
      )
      .map((a) => ({
        name: String(a.Plant_Name || ""),
        utility: String(a.Utility_Na || ""),
        fuel: fuelGroup(a.PrimSource),
        source: String(a.PrimSource || ""),
        mw: Math.round(a.Total_MW),
        state: String(a.State || ""),
        lng: a.Longitude,
        lat: a.Latitude,
      }));

    const providers = providerRows
      .map((f) => f.attributes)
      .filter((a) => a.Utility_Na && Number.isFinite(a.mw))
      .map((a) => ({ name: String(a.Utility_Na), mw: Math.round(a.mw) }));

    if (!plants.length || !providers.length) throw new Error("Empty EIA response");

    json(res, 200, { ok: true, source: "EIA U.S. Energy Atlas", plants, providers }, "public, s-maxage=86400, stale-while-revalidate=604800");
  } catch (err) {
    console.error("providers failure", String(err?.message || err).slice(0, 200));
    json(res, 502, { error: "Provider data unavailable." });
  }
}
