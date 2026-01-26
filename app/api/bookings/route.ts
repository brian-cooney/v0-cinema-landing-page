import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const showtimeId = searchParams.get("showtimeId")

  if (!showtimeId) {
    return NextResponse.json(
      { error: "Showtime ID is required" },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("seat_number")
    .eq("showtime_id", showtimeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bookings })
}
