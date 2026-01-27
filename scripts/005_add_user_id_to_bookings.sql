-- Add user_id column to bookings table to link bookings to authenticated users
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index for faster queries when fetching user bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

-- Add RLS policy to allow users to view their own bookings
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
