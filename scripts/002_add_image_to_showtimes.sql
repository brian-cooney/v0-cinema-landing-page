-- Add image_url column to showtimes table
ALTER TABLE showtimes ADD COLUMN IF NOT EXISTS image_url TEXT;
