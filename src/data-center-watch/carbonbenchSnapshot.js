/**
 * Curated Carbonbench-shaped snapshot used when carbonbench.ai's DB is down.
 * Numbers are illustrative of typical green-routing advice (EU / hydro-heavy regions),
 * not a live scrape — UI labels this as a snapshot.
 */

const SNAPSHOT_AT = "2026-04-17T15:00:01.000Z";

const BY_FAMILY = {
  llama: {
    recommendation: {
      modelId: "meta-llama/llama-3.1-8b",
      displayName: "Llama 3.1 8B",
      provider: "gcp",
      region: "GCP Europe West (Netherlands)",
      regionCode: "europe-west4",
      costPerMTokens: 0.2,
      carbonPerMTokens: 4,
      tokensPerSec: 100,
      calculatedAt: SNAPSHOT_AT,
    },
    insight:
      "GCP Netherlands is typically among the lowest-carbon homes for Llama-class models — hydro-heavy grid mix, often ~4 gCO₂ per million tokens versus much higher US East options.",
  },
  gpt: {
    recommendation: {
      modelId: "openai/gpt-4o-mini",
      displayName: "GPT-4o mini",
      provider: "azure",
      region: "Azure Sweden Central",
      regionCode: "swedencentral",
      costPerMTokens: 0.3,
      carbonPerMTokens: 6,
      tokensPerSec: 90,
      calculatedAt: SNAPSHOT_AT,
    },
    insight:
      "For GPT-family inference, Nordic Azure regions often win on carbon thanks to high renewable share — smaller variants cut energy further when quality allows.",
  },
  claude: {
    recommendation: {
      modelId: "anthropic/claude-3-5-haiku",
      displayName: "Claude 3.5 Haiku",
      provider: "aws",
      region: "AWS Europe (Frankfurt)",
      regionCode: "eu-central-1",
      costPerMTokens: 0.4,
      carbonPerMTokens: 8,
      tokensPerSec: 85,
      calculatedAt: SNAPSHOT_AT,
    },
    insight:
      "Haiku-class Claude models keep GPU-seconds down. Prefer EU regions when latency budgets allow — denser renewables than peak US East afternoon grids.",
  },
  mistral: {
    recommendation: {
      modelId: "mistralai/mistral-small",
      displayName: "Mistral Small",
      provider: "together",
      region: "EU West",
      regionCode: "eu-west-1",
      costPerMTokens: 0.15,
      carbonPerMTokens: 5,
      tokensPerSec: 120,
      calculatedAt: SNAPSHOT_AT,
    },
    insight:
      "Compact Mistral deployments in EU West tend to land in a sweet spot: low carbon per million tokens without giving up usable speed for drafting and classification.",
  },
  gemma: {
    recommendation: {
      modelId: "google/gemma-2-9b",
      displayName: "Gemma 2 9B",
      provider: "gcp",
      region: "GCP Europe West (Netherlands)",
      regionCode: "europe-west4",
      costPerMTokens: 0.18,
      carbonPerMTokens: 5,
      tokensPerSec: 110,
      calculatedAt: SNAPSHOT_AT,
    },
    insight:
      "Gemma on GCP Netherlands usually tracks other small open models: clean grid + modest parameter count = a strong everyday green default.",
  },
  qwen: {
    recommendation: {
      modelId: "qwen/qwen2.5-7b",
      displayName: "Qwen2.5 7B",
      provider: "together",
      region: "US West",
      regionCode: "us-west-2",
      costPerMTokens: 0.16,
      carbonPerMTokens: 9,
      tokensPerSec: 130,
      calculatedAt: SNAPSHOT_AT,
    },
    insight:
      "When EU latency is too high, Pacific Northwest grids (Oregon) are often cleaner than Virginia for Qwen-class 7B inference — still favor smaller checkpoints when you can.",
  },
  deepseek: {
    recommendation: {
      modelId: "deepseek/deepseek-chat",
      displayName: "DeepSeek Chat",
      provider: "together",
      region: "US West",
      regionCode: "us-west-2",
      costPerMTokens: 0.14,
      carbonPerMTokens: 7,
      tokensPerSec: 100,
      calculatedAt: SNAPSHOT_AT,
    },
    insight:
      "DeepSeek chat endpoints are efficient per token; pairing them with US West or EU regions beats defaulting everything to US East peak hours.",
  },
};

const CARBON_ALL_SNAPSHOT = {
  data: [
    {
      id: "us-east-1",
      label: "AWS US East (N. Virginia)",
      data: [
        { time: 1713340800, value: 380 },
        { time: 1713344400, value: 365 },
        { time: 1713348000, value: 372 },
      ],
    },
    {
      id: "us-west-2",
      label: "AWS US West (Oregon)",
      data: [
        { time: 1713340800, value: 193 },
        { time: 1713344400, value: 187 },
        { time: 1713348000, value: 198 },
      ],
    },
    {
      id: "europe-west4",
      label: "GCP Europe West (Netherlands)",
      data: [
        { time: 1713340800, value: 120 },
        { time: 1713344400, value: 115 },
        { time: 1713348000, value: 118 },
      ],
    },
  ],
};

export function snapshotRecommend(model = "llama") {
  const key = String(model || "llama").toLowerCase();
  const entry = BY_FAMILY[key] || BY_FAMILY.llama;
  return {
    recommendation: entry.recommendation,
    alternatives: [],
    insight: entry.insight,
    constraints: {
      model: BY_FAMILY[key] ? key : "llama",
      maxLatencyMs: null,
      maxCostPerMTokens: null,
    },
    meta: { source: "sprout-snapshot", carbonbenchOnline: false },
  };
}

export function snapshotCarbonAll() {
  return {
    ...CARBON_ALL_SNAPSHOT,
    meta: { source: "sprout-snapshot", carbonbenchOnline: false },
  };
}

export { BY_FAMILY };
