import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Ticket, Film } from "lucide-react"
import Link from "next/link"
import { BookingCard } from "@/components/booking-card"

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

const SEAT_LABELS = ["A1", "A2", "A3", "B1", "B2", "B3"]

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
              <Ticket className="h-5 w-5 text-primary" />
              Upcoming Screenings
            </h2>
            
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Film className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="mb-4 text-center text-muted-foreground">
                    You don&apos;t have any upcoming bookings.
                  </p>
                  <Button asChild>
                    <Link href="/book">Browse Showtimes</Link>
                  </Button>
                </CardContent>
              </Card>
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
