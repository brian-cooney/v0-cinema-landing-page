import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendReminders } from "@/lib/email"

// Run daily by Vercel Cron (see vercel.json). Emails every guest booked for a
// screening in the next 24 hours who hasn't had a reminder yet, so each
// booking gets exactly one reminder on the day of (or the day before) the film.
export async function GET(request: NextRequest) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" with cron requests
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, seat_number, customer_name, customer_email, showtimes!inner(movie_title, showtime, image_url, running_time)",
    )
    .is("reminder_sent_at", null)
    .gte("showtimes.showtime", now.toISOString())
    .lt("showtimes.showtime", in24Hours.toISOString())

  if (error) {
    console.error("Failed to load bookings for reminders:", error)
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 })
  }

  const due = (bookings ?? []).flatMap((booking) => {
    // The many-to-one join comes back as an object, but type it defensively
    const showtime = Array.isArray(booking.showtimes) ? booking.showtimes[0] : booking.showtimes
    return showtime ? [{ booking, showtime }] : []
  })

  if (due.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const sentIndexes = await sendReminders(
    due.map(({ booking, showtime }) => ({
      to: booking.customer_email,
      customerName: booking.customer_name,
      seatNumber: booking.seat_number,
      screening: {
        movieTitle: showtime.movie_title,
        showtime: showtime.showtime,
        imageUrl: showtime.image_url,
        runningTime: showtime.running_time,
      },
    })),
  )

  const sentIds = sentIndexes.map((i) => due[i].booking.id)
  if (sentIds.length > 0) {
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ reminder_sent_at: now.toISOString() })
      .in("id", sentIds)

    if (updateError) {
      console.error("Reminders sent but failed to mark bookings:", updateError)
    }
  }

  return NextResponse.json({ sent: sentIds.length, failed: due.length - sentIds.length })
}
