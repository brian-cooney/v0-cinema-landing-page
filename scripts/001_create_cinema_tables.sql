-- Create showtimes table for Embassy Cinema
CREATE TABLE IF NOT EXISTS showtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_title TEXT NOT NULL,
  movie_description TEXT,
  movie_poster_url TEXT,
  showtime TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  showtime_id UUID NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL CHECK (seat_number >= 1 AND seat_number <= 6),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(showtime_id, seat_number)
);

-- Enable Row Level Security
ALTER TABLE showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to showtimes
CREATE POLICY "Allow public read access to showtimes" 
  ON showtimes FOR SELECT 
  USING (true);

-- Allow public read access to bookings (to check seat availability)
CREATE POLICY "Allow public read access to bookings" 
  ON bookings FOR SELECT 
  USING (true);

-- Allow public insert for bookings (anyone can book)
CREATE POLICY "Allow public insert for bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (true);

-- Insert sample showtimes
INSERT INTO showtimes (movie_title, movie_description, movie_poster_url, showtime)
VALUES 
  ('Casablanca', 'A classic tale of love and sacrifice in wartime Morocco. Humphrey Bogart and Ingrid Bergman star in this timeless romantic drama.', NULL, NOW() + INTERVAL '1 day'),
  ('La La Land', 'A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.', NULL, NOW() + INTERVAL '2 days'),
  ('The Grand Budapest Hotel', 'A legendary concierge at a famous European hotel and his trusted lobby boy become embroiled in a theft and murder case.', NULL, NOW() + INTERVAL '3 days'),
  ('Amélie', 'A whimsical tale of a shy Parisian waitress who decides to change the lives of those around her for the better.', NULL, NOW() + INTERVAL '4 days'),
  ('Cinema Paradiso', 'A filmmaker recalls his childhood when he fell in love with movies at his village''s local cinema.', NULL, NOW() + INTERVAL '5 days');
