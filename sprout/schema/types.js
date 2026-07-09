/** Shared Sprout grid-history field definitions (site + future Pi logger). */

export const GRID_STATES = /** @type {const} */ (["calm", "moderate", "stressed"]);

/** UI labels used on Data Center Watch (map to GRID_STATES). */
export const GRID_STATE_UI = {
  calm: "Grid relaxed",
  moderate: "Demand climbing",
  stressed: "Peak overlap",
};

export const SOURCES = /** @type {const} */ (["CAISO", "EIA", "CAISO+EIA", "OTHER"]);

export const THRESHOLD_KINDS = /** @type {const} */ ([
  "price",
  "stress",
  "demand",
  "composite",
]);

export const COINCIDENCE_TAGS = /** @type {const} */ ([
  "evening_ramp",
  "heat_wave",
  "outage_elsewhere",
  "cold_snap",
  "unknown",
]);

/**
 * Minimal continuous reading — matches the concrete schema:
 * timestamp, region, price_per_mwh, demand_mw, grid_state, source
 * @typedef {object} GridReading
 * @property {string} timestamp ISO-8601 UTC
 * @property {string} region
 * @property {number|null} [price_per_mwh]
 * @property {number|null} [demand_mw]
 * @property {'calm'|'moderate'|'stressed'} grid_state
 * @property {'CAISO'|'EIA'|'CAISO+EIA'|'OTHER'} source
 * @property {number|null} [capacity_mw]
 * @property {number|null} [lmp_volatility]
 * @property {number|null} [stress_score]
 * @property {string|null} [source_detail]
 * @property {string|null} [notes]
 */

/**
 * @typedef {object} SpikeEvent
 * @property {string} region
 * @property {string} started_at
 * @property {string|null} [ended_at]
 * @property {number|null} [duration_minutes]
 * @property {number|null} [peak_price_per_mwh]
 * @property {number|null} [peak_demand_mw]
 * @property {number|null} [peak_stress_score]
 * @property {'calm'|'moderate'|'stressed'|null} [peak_grid_state]
 * @property {'price'|'stress'|'demand'|'composite'} threshold_kind
 * @property {number} threshold_value
 * @property {string|null} [coincidence]
 * @property {string|null} [coincidence_notes]
 * @property {'CAISO'|'EIA'|'CAISO+EIA'|'OTHER'} source
 * @property {boolean} [open]
 */

/** CSV header for the continuous series (Pi can append without SQLite). */
export const READING_CSV_HEADER =
  "timestamp,region,price_per_mwh,demand_mw,grid_state,source";

/** @param {GridReading} r */
export function readingToCsvRow(r) {
  const price = r.price_per_mwh == null ? "" : r.price_per_mwh;
  const demand = r.demand_mw == null ? "" : r.demand_mw;
  return [
    r.timestamp,
    r.region,
    price,
    demand,
    r.grid_state,
    r.source,
  ].join(",");
}

/**
 * Bucket a continuous stress score into the three-state classification.
 * Thresholds should also be logged in `stress_thresholds` when they change.
 * @param {number} score 0–1
 * @param {{ calmMax?: number, moderateMax?: number }} [t]
 */
export function classifyStress(score, t = {}) {
  const calmMax = t.calmMax ?? 0.33;
  const moderateMax = t.moderateMax ?? 0.66;
  if (score < calmMax) return "calm";
  if (score < moderateMax) return "moderate";
  return "stressed";
}

export const METHODOLOGY_DISCLAIMER =
  "Sprout's grid stress is a derived/simplified indicator from regional demand and price — not live per-facility data-center metering. Data centers contribute to regional load; they do not uniquely cause it.";
