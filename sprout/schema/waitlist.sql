-- Sprout hardware waitlist (Supabase / Postgres)
-- Apply in Supabase SQL editor if MCP migration is unavailable.

CREATE TABLE IF NOT EXISTS public.sprout_hardware_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  city text,
  utility text,
  hardware text NOT NULL DEFAULT 'both',
  notes text,
  user_agent text,
  source text NOT NULL DEFAULT 'data-center-watch'
);

CREATE UNIQUE INDEX IF NOT EXISTS sprout_hardware_waitlist_email_uidx
  ON public.sprout_hardware_waitlist (lower(email));

ALTER TABLE public.sprout_hardware_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inserts to sprout waitlist" ON public.sprout_hardware_waitlist;
CREATE POLICY "Allow public inserts to sprout waitlist"
  ON public.sprout_hardware_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "No public reads of sprout waitlist" ON public.sprout_hardware_waitlist;
CREATE POLICY "No public reads of sprout waitlist"
  ON public.sprout_hardware_waitlist
  FOR SELECT
  TO anon
  USING (false);
