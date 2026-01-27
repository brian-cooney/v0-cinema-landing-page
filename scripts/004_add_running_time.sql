-- Add running_time column to showtimes table (in minutes)
ALTER TABLE showtimes ADD COLUMN IF NOT EXISTS running_time INTEGER;
