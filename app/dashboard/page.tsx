import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Ticket, Film } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BookingCard } from "@/components/booking-card"
import { ShowtimeCard } from "@/components/showtime-card"
import { getUpcomingShowtimes } from "@/lib/showtimes"
import { CINEMA_TIME_ZONE, SEAT_LABELS } from "@/lib/utils"

interface Showtime {
  id: string
  movie_title: string
  showtime: string
  movie_description: string
  image_url: string | null
  running_time: number | null
}

interface BookingRaw {
  id: string
  seat_number: number
  customer_name: string
  created_at: string
  showtimes: Showtime | Showtime[] | null
}

interface Booking {
  id: string
  seat_number: number
  customer_name: string
  created_at: string
  showtimes: Showtime
}


export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/user-login?redirectTo=/dashboard")
  }

  // Fetch user's bookings with showtime details
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      seat_number,
      customer_name,
      created_at,
      showtimes (
        id,
        movie_title,
        showtime,
        movie_description,
        image_url,
        running_time
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  
  const now = new Date()
  
  // Normalize bookings - handle both single object and array for showtimes relation
  const normalizedBookings: Booking[] = ((bookings as BookingRaw[]) || [])
    .filter(booking => booking.showtimes !== null)
    .map(booking => ({
      ...booking,
      showtimes: Array.isArray(booking.showtimes) ? booking.showtimes[0] : booking.showtimes
    }))
    .filter(booking => booking.showtimes !== undefined) as Booking[]
  
  // Separate upcoming and past bookings
  const upcomingBookings = normalizedBookings.filter(
    booking => new Date(booking.showtimes.showtime) > now
  )
  const pastBookings = normalizedBookings.filter(
    booking => new Date(booking.showtimes.showtime) <= now
  )

  // Screenings the guest hasn't booked yet, shown as poster cards
  const otherScreenings = await getUpcomingShowtimes(supabase, {
    excludeIds: upcomingBookings.map((booking) => booking.showtimes.id),
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: CINEMA_TIME_ZONE,
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: CINEMA_TIME_ZONE,
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 mt-6">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back, {user.email}
            </p>
          </div>

          {/* Upcoming Bookings */}
          <section className="mb-12">
            {upcomingBookings.length > 0 && (
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                <Ticket className="h-5 w-5 text-primary" />
                Your Upcoming Bookings
              </h2>
            )}
            
            {upcomingBookings.length === 0 ? (
              <div className="relative overflow-hidden rounded-xl border border-border/50">
                <Image
                  src="/hero-cinema.webp"
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                <div className="relative flex flex-col items-center px-6 py-16 text-center md:py-20">
                  <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                    Six seats · One screen · Always free
                  </p>
                  <h3 className="font-serif text-3xl font-semibold md:text-4xl">
                    Your seat is waiting
                  </h3>
                  <p className="mt-3 max-w-md text-muted-foreground">
                    You haven&apos;t booked a screening yet. Pick a film below and save
                    your seat in under a minute.
                  </p>
                  <Button asChild size="lg" className="mt-8">
                    <Link href={otherScreenings.length > 0 ? "#coming-up" : "/book"}>
                      See what&apos;s on
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingBookings.map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    seatLabels={SEAT_LABELS}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Screenings they haven't booked */}
          {otherScreenings.length > 0 && (
            <section id="coming-up" className="mb-12 scroll-mt-24">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                <Film className="h-5 w-5 text-primary" />
                {upcomingBookings.length === 0 ? "Coming Up" : "More Screenings"}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherScreenings.map((showtime) => (
                  <ShowtimeCard key={showtime.id} showtime={showtime} />
                ))}
              </div>
            </section>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-muted-foreground">
                <Film className="h-5 w-5" />
                Past Screenings
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastBookings.map((booking) => (
                  <Card key={booking.id} className="opacity-75">
                    <CardHeader>
                      <CardTitle className="line-clamp-1 text-base">
                        {booking.showtimes.movie_title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(booking.showtimes.showtime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Seat {SEAT_LABELS[booking.seat_number - 1]}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
