"use server"

import { createClient } from "@/lib/supabase/server"
import { sendBookingConfirmation, type ScreeningDetails } from "@/lib/email"
import { isAdmin } from "@/lib/auth"
import { MAX_SEATS_PER_GUEST } from "@/lib/utils"

const NOT_ADMIN = "You must be an admin to do that."
const SEAT_TAKEN = "This seat has already been booked. Please choose another seat."

// Postgres unique_violation: the (showtime_id, seat_number) constraint caught
// a double booking, including two people grabbing the same seat at once.
function isSeatTakenError(error: { code?: string } | null) {
  return error?.code === "23505"
}

const LIMIT_REACHED = `You can book up to ${MAX_SEATS_PER_GUEST} seats per screening.`

// Raised by the bookings_enforce_limit trigger (scripts/007)
function isLimitError(error: { message?: string } | null) {
  return error?.message === "booking_limit_reached"
}

// Film details shown in the confirmation email
async function getScreeningDetails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  showtimeId: string,
): Promise<ScreeningDetails | null> {
  const { data } = await supabase
    .from("showtimes")
    .select("movie_title, showtime, image_url, running_time")
    .eq("id", showtimeId)
    .single()

  return data && {
    movieTitle: data.movie_title,
    showtime: data.showtime,
    imageUrl: data.image_url,
    runningTime: data.running_time,
  }
}

interface BookSeatParams {
  showtimeId: string
  seatNumber: number
  customerName: string
}

export async function bookSeat({
  showtimeId,
  seatNumber,
  customerName,
}: BookSeatParams) {
  const supabase = await createClient()

  // Take the guest's identity from their session, never from the client
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: "You must be signed in to book a seat" }
  }

  // Validate seat number
  if (seatNumber < 1 || seatNumber > 6) {
    return { error: "Invalid seat number" }
  }

  // Friendly early check; the database trigger is what actually enforces it
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("showtime_id", showtimeId)
    .eq("user_id", user.id)

  if ((count ?? 0) >= MAX_SEATS_PER_GUEST) {
    return { error: LIMIT_REACHED }
  }

  const screening = await getScreeningDetails(supabase, showtimeId)

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      showtime_id: showtimeId,
      seat_number: seatNumber,
      customer_name: customerName,
      customer_email: user.email,
      user_id: user.id,
    })
    .select()
    .single()

  if (isSeatTakenError(error)) {
    return { error: SEAT_TAKEN }
  }
  if (isLimitError(error)) {
    return { error: LIMIT_REACHED }
  }
  if (error) {
    return { error: "Failed to create booking. Please try again." }
  }

  // Send confirmation email
  if (screening) {
    await sendBookingConfirmation({ to: user.email, customerName, seatNumber, screening })
  }

  return { success: true, booking: data }
}

// Admin actions for managing showtimes

interface CreateShowtimeParams {
  movieTitle: string
  movieDescription: string
  showtime: string
  imageUrl?: string
  runningTime?: number
}

export async function createShowtime({
  movieTitle,
  movieDescription,
  showtime,
  imageUrl,
  runningTime,
}: CreateShowtimeParams) {
  const supabase = await createClient()

  if (!(await isAdmin(supabase))) {
    return { error: NOT_ADMIN }
  }

  const { data, error } = await supabase
    .from("showtimes")
    .insert({
      movie_title: movieTitle,
      movie_description: movieDescription,
      showtime: showtime,
      image_url: imageUrl || null,
      running_time: runningTime || null,
    })
    .select()
    .single()

  if (error) {
    return { error: "Failed to create showtime. Please try again." }
  }

  return { success: true, showtime: data }
}

interface UpdateShowtimeParams {
  id: string
  movieTitle: string
  movieDescription: string
  showtime: string
  imageUrl?: string | null
  runningTime?: number | null
}

export async function updateShowtime({
  id,
  movieTitle,
  movieDescription,
  showtime,
  imageUrl,
  runningTime,
}: UpdateShowtimeParams) {
  const supabase = await createClient()

  if (!(await isAdmin(supabase))) {
    return { error: NOT_ADMIN }
  }

  const { data, error } = await supabase
    .from("showtimes")
    .update({
      movie_title: movieTitle,
      movie_description: movieDescription,
      showtime: showtime,
      image_url: imageUrl,
      running_time: runningTime,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { error: "Failed to update showtime. Please try again." }
  }

  return { success: true, showtime: data }
}

export async function deleteShowtime(id: string) {
  const supabase = await createClient()

  if (!(await isAdmin(supabase))) {
    return { error: NOT_ADMIN }
  }

  // First delete all bookings for this showtime
  await supabase.from("bookings").delete().eq("showtime_id", id)

  const { error } = await supabase.from("showtimes").delete().eq("id", id)

  if (error) {
    return { error: "Failed to delete showtime. Please try again." }
  }

  return { success: true }
}

// Admin booking management

interface AdminBookSeatParams {
  showtimeId: string
  seatNumber: number
  customerName: string
  customerEmail: string
  sendEmail?: boolean
}

export async function adminBookSeat({
  showtimeId,
  seatNumber,
  customerName,
  customerEmail,
  sendEmail = true,
}: AdminBookSeatParams) {
  const supabase = await createClient()

  if (!(await isAdmin(supabase))) {
    return { error: NOT_ADMIN }
  }

  // Validate seat number
  if (seatNumber < 1 || seatNumber > 6) {
    return { error: "Invalid seat number" }
  }

  const screening = await getScreeningDetails(supabase, showtimeId)

  // Create the booking
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      showtime_id: showtimeId,
      seat_number: seatNumber,
      customer_name: customerName,
      customer_email: customerEmail,
    })
    .select()
    .single()

  if (isSeatTakenError(error)) {
    return { error: SEAT_TAKEN }
  }
  if (error) {
    return { error: "Failed to create booking. Please try again." }
  }

  // Send confirmation email if requested
  if (sendEmail && screening) {
    await sendBookingConfirmation({ to: customerEmail, customerName, seatNumber, screening })
  }

  return { success: true, booking: data }
}

export async function adminDeleteBooking(bookingId: string) {
  const supabase = await createClient()

  if (!(await isAdmin(supabase))) {
    return { error: NOT_ADMIN }
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)

  if (error) {
    return { error: "Failed to delete booking. Please try again." }
  }

  return { success: true }
}

export async function getShowtimeBookings(showtimeId: string) {
  const supabase = await createClient()

  if (!(await isAdmin(supabase))) {
    return { error: NOT_ADMIN }
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("showtime_id", showtimeId)
    .order("seat_number", { ascending: true })

  if (error) {
    return { error: "Failed to fetch bookings" }
  }

  return { success: true, bookings: data }
}

// User booking management

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "You must be logged in to cancel a booking" }
  }

  // Verify the booking belongs to this user
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, user_id, showtime_id")
    .eq("id", bookingId)
    .single()

  if (!booking) {
    return { error: "Booking not found" }
  }

  if (booking.user_id !== user.id) {
    return { error: "You can only cancel your own bookings" }
  }

  // Check if the showtime is in the future
  const { data: showtime } = await supabase
    .from("showtimes")
    .select("showtime")
    .eq("id", booking.showtime_id)
    .single()

  if (showtime && new Date(showtime.showtime) <= new Date()) {
    return { error: "Cannot cancel bookings for past screenings" }
  }

  // Delete the booking
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)

  if (error) {
    return { error: "Failed to cancel booking. Please try again." }
  }

  return { success: true }
}

interface UpdateBookingParams {
  bookingId: string
  customerName: string
  seatNumber: number
}

export async function updateBooking({
  bookingId,
  customerName,
  seatNumber,
}: UpdateBookingParams) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "You must be logged in to update a booking" }
  }

  // Verify the booking belongs to this user and get showtime_id
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, user_id, showtime_id, seat_number")
    .eq("id", bookingId)
    .single()

  if (!booking) {
    return { error: "Booking not found" }
  }

  if (booking.user_id !== user.id) {
    return { error: "You can only update your own bookings" }
  }

  // Check if the showtime is in the future
  const { data: showtime } = await supabase
    .from("showtimes")
    .select("showtime")
    .eq("id", booking.showtime_id)
    .single()

  if (showtime && new Date(showtime.showtime) <= new Date()) {
    return { error: "Cannot update bookings for past screenings" }
  }

  // Validate seat number
  if (seatNumber < 1 || seatNumber > 6) {
    return { error: "Invalid seat number" }
  }

  // Update the booking
  const { data, error } = await supabase
    .from("bookings")
    .update({
      customer_name: customerName,
      seat_number: seatNumber,
    })
    .eq("id", bookingId)
    .select()
    .single()

  if (isSeatTakenError(error)) {
    return { error: SEAT_TAKEN }
  }
  if (error) {
    return { error: "Failed to update booking. Please try again." }
  }

  return { success: true, booking: data }
}
