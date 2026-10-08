-- The language a guest booked in ('en' or 'it'), so the reminder email sent
-- later by the cron job matches the site they used. Older bookings and admin
-- bookings made on a guest's behalf stay NULL and get English.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS locale TEXT CHECK (locale IN ('en', 'it'));
