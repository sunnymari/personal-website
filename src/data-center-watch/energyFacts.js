const CARBONBENCH = "/api/carbonbench";
const CACHE_KEY = "dcw-daily-ai-energy-fact-v2";
const MODEL_ROTATION = ["llama", "gpt", "claude", "mistral", "gemma", "qwen", "deepseek"];

const FALLBACK_FACTS = [
  {
    headline: "Shift AI work to cleaner grids",
    body: "The same model can emit very different CO₂ per million tokens depending on the region’s grid mix. Routing inference to a cleaner zone is one of the easiest energy wins.",
    source: "Sprout companion tip",
    metric: null,
  },
  {
    headline: "Batch prompts off-peak",
    body: "Data center + home demand often peak together in late afternoon. Batching non-urgent AI jobs overnight cuts both carbon and your utility bill on time-of-use plans.",
    source: "Sprout companion tip",
    metric: null,
  },
  {
    headline: "Smaller models, big savings",
    body: "When quality allows, prefer smaller open models for drafts and classification. Less GPU time means less electricity — and usually lower cost per million tokens.",
    source: "Sprout companion tip",
    metric: null,
  },
];

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function pickModelForDay(d = new Date()) {
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  const day = Math.floor((d - start) / 86400000);
  return MODEL_ROTATION[day % MODEL_ROTATION.length];
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.day === dayKey() && parsed?.fact?.live) return parsed.fact;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(fact) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ day: dayKey(), fact }));
  } catch {
    /* ignore */
  }
}

export function clearDailyFactCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem("dcw-daily-ai-energy-fact-v1");
  } catch {
    /* ignore */
  }
}

function latestIntensity(region) {
  const points = region?.data;
  if (!Array.isArray(points) || !points.length) return null;
  return points[points.length - 1]?.value ?? null;
}

async function fetchRecommend(model) {
  const res = await fetch(
    `${CARBONBENCH}/recommend?model=${encodeURIComponent(model)}`,
  );
  if (!res.ok) throw new Error(`recommend ${res.status}`);
  return res.json();
}

async function fetchCarbonAll() {
  const res = await fetch(`${CARBONBENCH}/carbon/all`);
  if (!res.ok) throw new Error(`carbon/all ${res.status}`);
  return res.json();
}

function buildFactFromApi({ recommend, carbonAll, model }) {
  const insight = recommend?.insight?.trim();
  const rec = recommend?.recommendation;
  const virginia = Array.isArray(carbonAll?.data)
    ? carbonAll.data.find((r) => r.id === "us-east-1" || /virginia/i.test(r.label || ""))
    : null;
  const intensity = latestIntensity(virginia);

  const headline = rec
    ? `Today’s greener pick: ${rec.displayName}`
    : "Daily AI energy fact";

  const parts = [];
  if (insight) parts.push(insight);
  if (rec?.carbonPerMTokens != null) {
    parts.push(
      `About ${rec.carbonPerMTokens} gCO₂ per million tokens via ${rec.provider} in ${rec.region}.`,
    );
  }
  if (intensity != null) {
    parts.push(
      `Northern Virginia grid intensity is roughly ${Math.round(intensity)} gCO₂eq/kWh right now — useful context for the Ashburn cluster on the map.`,
    );
  }
  if (!parts.length) {
    parts.push(
      "Live carbon-aware routing data is temporarily unavailable. Check back later, or use the Watch tab tips meanwhile.",
    );
  }

  return {
    headline,
    body: parts.join(" "),
    source: "Carbonbench · Electricity Maps + AI Energy Score",
    metric:
      intensity != null
        ? { label: "VA grid intensity", value: `${Math.round(intensity)} gCO₂eq/kWh` }
        : rec?.carbonPerMTokens != null
          ? { label: "Carbon / M tokens", value: `${rec.carbonPerMTokens} gCO₂` }
          : null,
    model,
    updatedAt: rec?.calculatedAt || new Date().toISOString(),
    live: true,
  };
}

/**
 * @param {{ force?: boolean }} [opts]
 */
export async function getDailyAiEnergyFact(opts = {}) {
  if (opts.force) clearDailyFactCache();

  const cached = typeof localStorage !== "undefined" ? readCache() : null;
  if (cached) return { ...cached, fromCache: true };

  const model = pickModelForDay();
  try {
    // Recommend is required; carbon/all is nice-to-have (don't fail the whole tip)
    const recommend = await fetchRecommend(model);
    let carbonAll = null;
    try {
      carbonAll = await fetchCarbonAll();
    } catch {
      carbonAll = null;
    }
    const fact = buildFactFromApi({ recommend, carbonAll, model });
    if (typeof localStorage !== "undefined") writeCache(fact);
    return { ...fact, fromCache: false };
  } catch {
    const fallback = FALLBACK_FACTS[new Date().getDate() % FALLBACK_FACTS.length];
    return {
      ...fallback,
      model,
      updatedAt: new Date().toISOString(),
      live: false,
      fromCache: false,
    };
  }
}

export { CARBONBENCH, pickModelForDay };
