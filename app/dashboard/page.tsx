import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Ticket, Film } from "lucide-react"
import Link from "next/link"

interface Booking {
  id: string
  seat_number: number
  customer_name: string
  created_at: string
  showtimes: {
    id: string
    movie_title: string
    showtime: string
    description: string
    image_url: string | null
    running_time: number | null
  }
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
        description,
        image_url,
        running_time
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  
  console.log("[v0] Dashboard - User ID:", user.id)
  console.log("[v0] Dashboard - Bookings query result:", { bookings, error })

  const now = new Date()
  
  // Separate upcoming and past bookings
  const upcomingBookings = (bookings as Booking[] || []).filter(
    booking => new Date(booking.showtimes.showtime) > now
  )
  const pastBookings = (bookings as Booking[] || []).filter(
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
      <main className="flex-1">
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
                  <Card key={booking.id} className="overflow-hidden">
                    {booking.showtimes.image_url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={booking.showtimes.image_url}
                          alt={booking.showtimes.movie_title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {booking.showtimes.movie_title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {booking.showtimes.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(booking.showtimes.showtime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTime(booking.showtimes.showtime)}</span>
                        {booking.showtimes.running_time && (
                          <span className="text-muted-foreground">
                            ({booking.showtimes.running_time} min)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Seat {SEAT_LABELS[booking.seat_number - 1]}</span>
                      </div>
                      <div className="mt-4 rounded-md bg-primary/10 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Booked for</p>
                        <p className="font-medium">{booking.customer_name}</p>
                      </div>
                    </CardContent>
                  </Card>
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
