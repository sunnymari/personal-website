-- Sprout Grid History Schema (Postgres/Supabase)
-- Continuous grid readings for heatmap + trend analysis
-- Methodological note: regional demand/price signals, NOT per-facility DC load

CREATE TABLE IF NOT EXISTS public.grid_readings (
  id                BIGSERIAL PRIMARY KEY,
  timestamp         TIMESTAMPTZ NOT NULL,
  region            TEXT NOT NULL,
  price_per_mwh     DECIMAL(10,2),
  demand_mw         DECIMAL(10,2),
  capacity_mw       DECIMAL(10,2),
  lmp_volatility    DECIMAL(10,4),
  grid_state        TEXT NOT NULL CHECK (grid_state IN ('calm', 'moderate', 'stressed')),
  stress_score      DECIMAL(5,4),
  source            TEXT NOT NULL CHECK (source IN ('CAISO', 'EIA', 'CAISO+EIA', 'OTHER', 'SEED')),
  source_detail     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (timestamp, region, source)
);

CREATE INDEX IF NOT EXISTS idx_readings_region_time ON public.grid_readings (region, timestamp);
CREATE INDEX IF NOT EXISTS idx_readings_state_time ON public.grid_readings (grid_state, timestamp);
CREATE INDEX IF NOT EXISTS idx_readings_price ON public.grid_readings (price_per_mwh);

-- RLS policies for public read access
ALTER TABLE public.grid_readings ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.grid_readings TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.grid_readings FROM anon, authenticated;

DROP POLICY IF EXISTS "Public read grid readings" ON public.grid_readings;
CREATE POLICY "Public read grid readings"
  ON public.grid_readings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed historical data for heatmap visualization (7 days × 24 hours, multiple regions)
-- Pattern: more stressed during 4pm-10pm, calm during 1am-6am, moderate otherwise
-- Prices vary realistically by time and stress level
INSERT INTO public.grid_readings (timestamp, region, price_per_mwh, demand_mw, capacity_mw, grid_state, stress_score, source, source_detail)
SELECT
  (CURRENT_DATE - INTERVAL '1 day' * day_offset + INTERVAL '1 hour' * hour)::timestamptz AS timestamp,
  region,
  CASE
    WHEN hour BETWEEN 16 AND 21 THEN 85 + random() * 70  -- Evening peak: $85-155/MWh
    WHEN hour BETWEEN 1 AND 6 THEN 25 + random() * 20     -- Night minimum: $25-45/MWh
    ELSE 45 + random() * 35                               -- Day moderate: $45-80/MWh
  END AS price_per_mwh,
  CASE
    WHEN hour BETWEEN 16 AND 21 THEN 32000 + random() * 4000
    WHEN hour BETWEEN 1 AND 6 THEN 22000 + random() * 2000
    ELSE 27000 + random() * 3000
  END AS demand_mw,
  48000.0 AS capacity_mw,
  CASE
    WHEN hour BETWEEN 17 AND 20 THEN 'stressed'
    WHEN hour BETWEEN 1 AND 6 THEN 'calm'
    ELSE 'moderate'
  END AS grid_state,
  CASE
    WHEN hour BETWEEN 17 AND 20 THEN 0.75 + random() * 0.20
    WHEN hour BETWEEN 1 AND 6 THEN 0.10 + random() * 0.25
    ELSE 0.40 + random() * 0.30
  END AS stress_score,
  'SEED' AS source,
  'Historical pattern seed data for visualization' AS source_detail
FROM
  generate_series(0, 6) AS day_offset,
  generate_series(0, 23) AS hour,
  (VALUES ('CAISO'), ('ERCOT'), ('PJM')) AS regions(region)
ON CONFLICT (timestamp, region, source) DO NOTHING;
