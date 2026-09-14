-- Sprout public research log (dated tracker — no PII)
-- Public can SELECT. Inserts happen only via API with service role key.
-- Apply in Supabase SQL editor if MCP migration is unavailable.

CREATE TABLE IF NOT EXISTS public.sprout_research_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  log_date date NOT NULL DEFAULT (CURRENT_DATE),
  kind text NOT NULL
    CHECK (kind IN ('daily_fact', 'grid_snapshot', 'waitlist_signal', 'milestone', 'session')),
  title text NOT NULL,
  summary text NOT NULL,
  why_important text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'sprout'
);

CREATE UNIQUE INDEX IF NOT EXISTS sprout_research_logs_day_kind_title_uidx
  ON public.sprout_research_logs (log_date, kind, title);

CREATE INDEX IF NOT EXISTS sprout_research_logs_date_idx
  ON public.sprout_research_logs (log_date DESC, created_at DESC);

ALTER TABLE public.sprout_research_logs ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.sprout_research_logs TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.sprout_research_logs FROM anon, authenticated;

DROP POLICY IF EXISTS "Public read sprout research logs" ON public.sprout_research_logs;
CREATE POLICY "Public read sprout research logs"
  ON public.sprout_research_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert sprout research logs" ON public.sprout_research_logs;

INSERT INTO public.sprout_research_logs (log_date, kind, title, summary, why_important, meta)
VALUES
  (
    '2026-08-28',
    'milestone',
    'Sprout goes live on marissacodes.com',
    'Public companion map of known U.S. data center hubs with grid-stress guidance and a hardware waitlist.',
    'A living research surface: when AI demand is visible to regular people, we can study whether salience changes household timing of high-draw appliances.',
    '{"phase":"launch"}'::jsonb
  ),
  (
    '2026-08-31',
    'milestone',
    'Hardware waitlist + Carbonbench daily fact wired',
    'Waitlist signups persist to Supabase and email. Daily AI energy tips pull Carbonbench with a curated snapshot fallback.',
    'Logging interest and daily energy tips creates a dated research trail instead of only ephemeral on-screen state.',
    '{"phase":"instrumentation"}'::jsonb
  ),
  (
    '2026-09-14',
    'milestone',
    'Live data tracker opened',
    'Sprout now keeps a public, dated log of research signals so history is visible: daily facts, grid snapshots, and waitlist interest.',
    'Without dates, demos reset. A dated tracker proves the experiment is running over time and clarifies why the thesis matters.',
    '{"phase":"tracker"}'::jsonb
  )
ON CONFLICT (log_date, kind, title) DO NOTHING;
