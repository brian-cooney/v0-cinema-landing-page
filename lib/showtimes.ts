import type { SupabaseClient } from "@supabase/supabase-js"
import { SEAT_LABELS } from "@/lib/utils"

export interface UpcomingShowtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
  running_time: number | null
  seatsRemaining: number
}

// Next screenings with how many seats are left. Seats are counted through the
// public booked_seats view, since guests can't read other people's bookings.
export async function getUpcomingShowtimes(
  supabase: SupabaseClient,
  { limit = 6, excludeIds = [] }: { limit?: number; excludeIds?: string[] } = {},
): Promise<UpcomingShowtime[]> {
  let query = supabase
    .from("showtimes")
    .select("id, movie_title, movie_description, showtime, image_url, running_time")
    .gte("showtime", new Date().toISOString())
    .order("showtime", { ascending: true })
    .limit(limit)

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`)
  }

  const { data: showtimes } = await query
  if (!showtimes || showtimes.length === 0) return []

  const { data: bookedSeats } = await supabase
    .from("booked_seats")
    .select("showtime_id")
    .in("showtime_id", showtimes.map((s) => s.id))

  const bookedCounts = new Map<string, number>()
  for (const { showtime_id } of bookedSeats ?? []) {
    bookedCounts.set(showtime_id, (bookedCounts.get(showtime_id) ?? 0) + 1)
  }

  return showtimes.map((showtime) => ({
    ...showtime,
    seatsRemaining: SEAT_LABELS.length - (bookedCounts.get(showtime.id) ?? 0),
  }))
}
