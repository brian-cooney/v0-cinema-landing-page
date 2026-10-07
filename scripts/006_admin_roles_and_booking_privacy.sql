-- Restrict admin operations to real admins and stop exposing guest details publicly.
--
-- Before this migration, any signed-in user (including any guest who used the
-- magic-link sign-in) could create/edit/delete showtimes and delete bookings,
-- and anyone with the public anon key could read every guest's name and email.

-- 1. Admins ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on with no policies: the table is only readable through is_admin().
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Seed your admin account(s). Replace the email with the one you use on /auth/login.
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'REPLACE_WITH_ADMIN_EMAIL'
ON CONFLICT DO NOTHING;

-- 2. Reset policies ------------------------------------------------------------
-- Drop every existing policy on these tables (including any added by hand in the
-- Supabase dashboard) so the final state is exactly what is defined below.

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('showtimes', 'bookings')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 3. Showtimes: public read, admin write ---------------------------------------

CREATE POLICY "Anyone can view showtimes" ON public.showtimes
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert showtimes" ON public.showtimes
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update showtimes" ON public.showtimes
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete showtimes" ON public.showtimes
  FOR DELETE TO authenticated USING (public.is_admin());

-- 4. Bookings: owners and admins only -------------------------------------------

CREATE POLICY "Users view own bookings, admins view all" ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Guests can only book as themselves; admins can book on anyone's behalf.
CREATE POLICY "Users book for themselves, admins for anyone" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (user_id = auth.uid() AND customer_email = auth.jwt() ->> 'email')
  );

-- Owners can edit their booking. The second clause lets the auth callback link
-- older bookings made with the user's email before accounts existed.
CREATE POLICY "Users update own bookings, admins all" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (user_id IS NULL AND customer_email = auth.jwt() ->> 'email')
  )
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Users cancel own bookings, admins all" ON public.bookings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- 5. Public seat map -------------------------------------------------------------
-- The seat picker and "seats remaining" counts need to see which seats are taken
-- for every screening. This view exposes only that plus the guest's first name;
-- it runs with the owner's rights, so it is not limited by the policies above.

CREATE OR REPLACE VIEW public.booked_seats AS
SELECT
  showtime_id,
  seat_number,
  split_part(customer_name, ' ', 1) AS first_name
FROM public.bookings;

-- Simple views are writable in Postgres and Supabase grants anon full access to
-- new objects by default, so revoke everything explicitly before granting read.
REVOKE ALL ON public.booked_seats FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.booked_seats TO anon, authenticated;
