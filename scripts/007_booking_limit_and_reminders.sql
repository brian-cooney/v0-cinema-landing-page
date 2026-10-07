-- Limit guests to 2 seats per screening, and track which bookings have had
-- their reminder email.

-- 1. Booking limit -------------------------------------------------------------
-- Enforced in the database so it also holds for two bookings made at the same
-- moment. Admin bookings made on a guest's behalf have no user_id and are not
-- limited.

CREATE OR REPLACE FUNCTION public.enforce_booking_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  max_seats CONSTANT INTEGER := 2;
  existing INTEGER;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Serialise bookings by the same guest for the same screening
  PERFORM pg_advisory_xact_lock(hashtext(NEW.showtime_id::text || ':' || NEW.user_id::text));

  SELECT count(*) INTO existing
  FROM public.bookings
  WHERE showtime_id = NEW.showtime_id
    AND user_id = NEW.user_id
    AND id <> NEW.id;

  IF existing >= max_seats THEN
    -- The app matches on this message (see app/actions.ts)
    RAISE EXCEPTION 'booking_limit_reached';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_enforce_limit ON public.bookings;
CREATE TRIGGER bookings_enforce_limit
  BEFORE INSERT OR UPDATE OF showtime_id, user_id ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_limit();

-- 2. Reminder emails -----------------------------------------------------------
-- Set by the daily reminder job (app/api/cron/reminders) once the email is sent.

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
