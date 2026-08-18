-- Ensure grants + insert policy for anon (Sprout hardware waitlist)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON TABLE public.sprout_hardware_waitlist TO anon, authenticated;
GRANT SELECT ON TABLE public.sprout_hardware_waitlist TO service_role;

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
