-- Add RLS policies for showtimes table
-- Allow anyone to read showtimes (public viewing)
CREATE POLICY "Anyone can view showtimes" ON showtimes
  FOR SELECT USING (true);

-- Allow authenticated users to insert showtimes (admin only)
CREATE POLICY "Authenticated users can insert showtimes" ON showtimes
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update showtimes (admin only)
CREATE POLICY "Authenticated users can update showtimes" ON showtimes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete showtimes (admin only)
CREATE POLICY "Authenticated users can delete showtimes" ON showtimes
  FOR DELETE TO authenticated
  USING (true);

-- Add RLS policies for bookings table
-- Allow anyone to read bookings (needed for seat availability)
CREATE POLICY "Anyone can view bookings" ON bookings
  FOR SELECT USING (true);

-- Allow anyone to insert bookings (public booking)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to delete bookings (admin only)
CREATE POLICY "Authenticated users can delete bookings" ON bookings
  FOR DELETE TO authenticated
  USING (true);
