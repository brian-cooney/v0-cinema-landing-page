"use server"

import { createClient } from "@/lib/supabase/server"
import { sendBookingConfirmation } from "@/lib/email"

interface BookSeatParams {
  showtimeId: string
  seatNumber: number
  customerName: string
  customerEmail: string
  userId?: string
}

export async function bookSeat({
  showtimeId,
  seatNumber,
  customerName,
  customerEmail,
  userId,
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
      return { error: "This seat is unavailable. Please choose another seat." }
    }

  // Get showtime details for the confirmation email
  const { data: showtimeData } = await supabase
    .from("showtimes")
    .select("movie_title, showtime")
    .eq("id", showtimeId)
    .single()

  // Create the booking with user_id if provided
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      showtime_id: showtimeId,
      seat_number: seatNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      user_id: userId || null,
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
    return { error: "This seat is unavailable. Please choose another seat." }
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

  // If seat number changed, check if the new seat is available
  if (seatNumber !== booking.seat_number) {
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("showtime_id", booking.showtime_id)
      .eq("seat_number", seatNumber)
      .maybeSingle()

  if (existingBooking) {
    return { error: "This seat is unavailable. Please choose another seat." }
  }
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

  if (error) {
    return { error: "Failed to update booking. Please try again." }
  }

  return { success: true, booking: data }
}

export async function getAvailableSeats(showtimeId: string, excludeBookingId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("bookings")
    .select("seat_number")
    .eq("showtime_id", showtimeId)

  if (excludeBookingId) {
    query = query.neq("id", excludeBookingId)
  }

  const { data: bookings } = await query

  const bookedSeats = bookings?.map(b => b.seat_number) || []
  const allSeats = [1, 2, 3, 4, 5, 6]
  const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat))

  return { availableSeats, bookedSeats }
}
