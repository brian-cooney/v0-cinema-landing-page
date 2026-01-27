"use server"

import { createClient } from "@/lib/supabase/server"
import { sendBookingConfirmation } from "@/lib/email"

interface BookSeatParams {
  showtimeId: string
  seatNumber: number
  customerName: string
  customerEmail: string
}

export async function bookSeat({
  showtimeId,
  seatNumber,
  customerName,
  customerEmail,
}: BookSeatParams) {
  const supabase = await createClient()

  // Validate seat number
  if (seatNumber < 1 || seatNumber > 6) {
    return { error: "Invalid seat number" }
  }

  // Check if the seat is already booked
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id")
    .eq("showtime_id", showtimeId)
    .eq("seat_number", seatNumber)
    .maybeSingle()

  if (existingBooking) {
    return { error: "This seat has already been booked" }
  }

  // Get showtime details for the confirmation email
  const { data: showtimeData } = await supabase
    .from("showtimes")
    .select("movie_title, showtime")
    .eq("id", showtimeId)
    .single()

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

  if (error) {
    return { error: "Failed to create booking. Please try again." }
  }

  // Send confirmation email
  if (showtimeData) {
    await sendBookingConfirmation({
      to: customerEmail,
      customerName,
      movieTitle: showtimeData.movie_title,
      showtime: showtimeData.showtime,
      seatNumber,
    })
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

  // Validate seat number
  if (seatNumber < 1 || seatNumber > 6) {
    return { error: "Invalid seat number" }
  }

  // Check if the seat is already booked
  const { data: existingBooking } = await supabase
    .from("bookings")
    .select("id")
    .eq("showtime_id", showtimeId)
    .eq("seat_number", seatNumber)
    .maybeSingle()

  if (existingBooking) {
    return { error: "This seat has already been booked" }
  }

  // Get showtime details for the confirmation email
  const { data: showtimeData } = await supabase
    .from("showtimes")
    .select("movie_title, showtime")
    .eq("id", showtimeId)
    .single()

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

  if (error) {
    return { error: "Failed to create booking. Please try again." }
  }

  // Send confirmation email if requested
  if (sendEmail && showtimeData) {
    await sendBookingConfirmation({
      to: customerEmail,
      customerName,
      movieTitle: showtimeData.movie_title,
      showtime: showtimeData.showtime,
      seatNumber,
    })
  }

  return { success: true, booking: data }
}

export async function adminDeleteBooking(bookingId: string) {
  const supabase = await createClient()

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
