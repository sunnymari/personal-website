-- Sprout / Data Center Watch — grid history schema (SQLite)
-- Purpose: persist every CAISO/EIA pull as research history, not only on-screen state.
--
-- Methodological note (keep this distinction clean in papers/decks):
--   grid_state is a DERIVED / simplified indicator from regional price + demand
--   (and optional LMP volatility). It is NOT a direct measurement of data-center
--   facility load. Public feeds do not expose per-facility consumption.
--   Data centers contribute to regional demand/price; they do not uniquely cause them.

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Continuous series: one row per successful API pull
-- Graphs that fall out of this table:
--   - time series of price_per_mwh / demand_mw
--   - overlay of grid_state vs price (sanity-check thresholds)
--   - spike frequency by hour-of-day / month (via spike_events + this table)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grid_readings (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp         TEXT    NOT NULL,  -- ISO-8601 UTC, e.g. 2026-07-09T13:05:00Z
  region            TEXT    NOT NULL,  -- e.g. CAISO, PJM, ERCOT, US-MIDA-PJM
  price_per_mwh     REAL,              -- market signal ($/MWh); NULL if source lacks price
  demand_mw         REAL,              -- physical load if available; NULL otherwise
  capacity_mw       REAL,              -- optional: available capacity for load/capacity ratio
  lmp_volatility    REAL,              -- optional: short-window LMP stdev or similar
  grid_state        TEXT    NOT NULL
                            CHECK (grid_state IN ('calm', 'moderate', 'stressed')),
  stress_score      REAL,              -- optional continuous 0–1 (or 0–100) before bucketing
  source            TEXT    NOT NULL
                            CHECK (source IN ('CAISO', 'EIA', 'CAISO+EIA', 'OTHER')),
  source_detail     TEXT,              -- endpoint / series id / OASIS report name
  notes             TEXT,              -- freeform (outage rumor, heat advisory, etc.)
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  UNIQUE (timestamp, region, source)
);

CREATE INDEX IF NOT EXISTS idx_readings_region_time
  ON grid_readings (region, timestamp);

CREATE INDEX IF NOT EXISTS idx_readings_state_time
  ON grid_readings (grid_state, timestamp);

CREATE INDEX IF NOT EXISTS idx_readings_price
  ON grid_readings (price_per_mwh);

-- ---------------------------------------------------------------------------
-- Spike events: discrete narratable episodes (not just a jagged continuous line)
-- For each spike: peak values, duration above threshold, and what coincided.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS spike_events (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  region               TEXT    NOT NULL,
  started_at           TEXT    NOT NULL,  -- ISO-8601 UTC when threshold first crossed
  ended_at             TEXT,              -- NULL while open / ongoing
  duration_minutes     REAL,              -- filled when closed: (ended_at - started_at)
  peak_price_per_mwh   REAL,
  peak_demand_mw       REAL,
  peak_stress_score    REAL,
  peak_grid_state      TEXT
                       CHECK (peak_grid_state IN ('calm', 'moderate', 'stressed')),
  threshold_kind       TEXT    NOT NULL
                       CHECK (threshold_kind IN ('price', 'stress', 'demand', 'composite')),
  threshold_value      REAL    NOT NULL,  -- the bar that defined "spike"
  coincidence          TEXT,              -- evening_ramp | heat_wave | outage_elsewhere |
                                          -- cold_snap | unknown | free text
  coincidence_notes    TEXT,              -- human-readable narrative for thesis / blog
  source               TEXT    NOT NULL
                       CHECK (source IN ('CAISO', 'EIA', 'CAISO+EIA', 'OTHER')),
  open                 INTEGER NOT NULL DEFAULT 1
                       CHECK (open IN (0, 1)),  -- 1 = still above threshold
  created_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_spikes_region_start
  ON spike_events (region, started_at);

CREATE INDEX IF NOT EXISTS idx_spikes_coincidence
  ON spike_events (coincidence);

CREATE INDEX IF NOT EXISTS idx_spikes_open
  ON spike_events (open) WHERE open = 1;

-- Optional link: which readings belong to a spike window
CREATE TABLE IF NOT EXISTS spike_reading_links (
  spike_id    INTEGER NOT NULL REFERENCES spike_events (id) ON DELETE CASCADE,
  reading_id  INTEGER NOT NULL REFERENCES grid_readings (id) ON DELETE CASCADE,
  PRIMARY KEY (spike_id, reading_id)
);

-- ---------------------------------------------------------------------------
-- Threshold config (so classification rules are versioned with the data)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stress_thresholds (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  region          TEXT    NOT NULL,
  effective_from  TEXT    NOT NULL,  -- ISO-8601 UTC
  effective_to    TEXT,              -- NULL = current
  calm_max        REAL    NOT NULL,  -- stress_score < calm_max → calm
  moderate_max    REAL    NOT NULL,  -- calm_max ≤ score < moderate_max → moderate
                                     -- else → stressed
  price_spike_usd REAL,              -- $/MWh bar for spike_events.threshold_kind='price'
  notes           TEXT,
  CHECK (calm_max < moderate_max)
);

-- ---------------------------------------------------------------------------
-- Research views (graphs "for free")
-- ---------------------------------------------------------------------------

-- Hour-of-day distribution of stressed readings (UTC; convert in analysis if needed)
CREATE VIEW IF NOT EXISTS v_stress_by_hour AS
SELECT
  region,
  CAST(strftime('%H', timestamp) AS INTEGER) AS hour_utc,
  COUNT(*) AS n_readings,
  SUM(CASE WHEN grid_state = 'stressed' THEN 1 ELSE 0 END) AS n_stressed,
  ROUND(
    1.0 * SUM(CASE WHEN grid_state = 'stressed' THEN 1 ELSE 0 END) / COUNT(*),
    4
  ) AS pct_stressed,
  AVG(price_per_mwh) AS avg_price_per_mwh,
  AVG(demand_mw) AS avg_demand_mw
FROM grid_readings
GROUP BY region, hour_utc;

-- Month distribution of spike events
CREATE VIEW IF NOT EXISTS v_spikes_by_month AS
SELECT
  region,
  strftime('%Y-%m', started_at) AS year_month,
  COUNT(*) AS n_spikes,
  AVG(duration_minutes) AS avg_duration_minutes,
  AVG(peak_price_per_mwh) AS avg_peak_price,
  SUM(CASE WHEN coincidence = 'evening_ramp' THEN 1 ELSE 0 END) AS n_evening_ramp,
  SUM(CASE WHEN coincidence = 'heat_wave' THEN 1 ELSE 0 END) AS n_heat_wave
FROM spike_events
WHERE open = 0
GROUP BY region, year_month;

-- Sanity-check: average price inside each derived grid_state bucket
CREATE VIEW IF NOT EXISTS v_price_by_grid_state AS
SELECT
  region,
  grid_state,
  COUNT(*) AS n,
  AVG(price_per_mwh) AS avg_price_per_mwh,
  MIN(price_per_mwh) AS min_price_per_mwh,
  MAX(price_per_mwh) AS max_price_per_mwh,
  AVG(demand_mw) AS avg_demand_mw
FROM grid_readings
GROUP BY region, grid_state;
