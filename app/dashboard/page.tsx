import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Calendar, Check, MapPin, Ticket, Film } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BookingCard } from "@/components/booking-card"
import { ShowtimeCard } from "@/components/showtime-card"
import { getUpcomingShowtimes } from "@/lib/showtimes"
import { getDictionary } from "@/lib/i18n/server"
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
  const [supabase, t] = await Promise.all([createClient(), getDictionary()])
  
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
    return date.toLocaleDateString(t.intlLocale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: CINEMA_TIME_ZONE,
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b-2 border-black bg-brand-cyan px-4 pb-10 pt-32 sm:px-6 sm:pt-36">
          <div className="container mx-auto">
            <p className="font-mono text-sm font-bold uppercase">{t.common.signedInAs} {user.email}</p>
            <h1 className="mt-3 text-[min(6rem,12vw)] font-semibold uppercase leading-[0.9] tracking-tight">
              {t.dashboard.title} <span aria-hidden="true">↓</span>
            </h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">

          {/* Upcoming Bookings */}
          <section className="mb-12">
            {upcomingBookings.length > 0 && (
              <h2 className="mb-6 inline-flex items-center gap-2 bg-black px-3 py-1.5 font-mono text-sm font-bold uppercase text-white">
                <Ticket className="h-4 w-4" />
                {t.dashboard.upcoming}
              </h2>
            )}
            
            {upcomingBookings.length === 0 ? (
              <div className="relative overflow-hidden border-2 border-black bg-black text-white shadow-[6px_6px_0_0_#000]">
                <Image
                  src="/hero-cinema.webp"
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                <div className="relative flex flex-col items-center px-6 py-16 text-center md:py-20">
                  <p className="mb-3 font-mono text-sm font-bold uppercase text-brand-yellow">
                    {t.dashboard.emptyKicker}
                  </p>
                  <h3 className="text-4xl font-semibold uppercase leading-none tracking-tight md:text-6xl">
                    {t.dashboard.emptyTitle}
                  </h3>
                  <p className="mt-4 max-w-md font-mono text-sm">
                    {t.dashboard.emptyBody}
                  </p>
                  <Button asChild size="lg" className="mt-8 bg-brand-yellow text-lg font-semibold uppercase text-black hover:bg-white">
                    <Link href={otherScreenings.length > 0 ? "#coming-up" : "/book"}>
                      {t.dashboard.seeWhatsOn}
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
              <h2 className="mb-6 text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl">
                {upcomingBookings.length === 0 ? t.dashboard.comingUp : t.dashboard.moreScreenings}{" "}
                <span aria-hidden="true">↓</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherScreenings.map((showtime) => (
                  <ShowtimeCard key={showtime.id} showtime={showtime} />
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Films they've watched: a separate band, like the home page archive */}
        {pastBookings.length > 0 && (
          <section className="border-t-2 border-black bg-brand-yellow py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <p className="mb-2 font-mono text-sm font-bold uppercase">{t.dashboard.yourArchive}</p>
                <h2 className="text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl">
                  {t.dashboard.filmsWatched} <span aria-hidden="true">↓</span>
                </h2>
                <p className="mt-3 font-mono text-sm font-bold uppercase">
                  {t.dashboard.filmCount(pastBookings.length)}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col overflow-hidden border-2 border-black bg-white"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/30">
                      {booking.showtimes.image_url ? (
                        <Image
                          src={booking.showtimes.image_url}
                          alt={booking.showtimes.movie_title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Film className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 flex items-center gap-1 bg-black px-2 py-1 font-mono text-xs font-bold uppercase text-white">
                        <Check className="h-3 w-3" />
                        {t.dashboard.watched}
                      </span>
                    </div>
                    <div className="space-y-2 p-5">
                      <h3 className="line-clamp-1 text-2xl font-semibold uppercase leading-none tracking-tight">
                        {booking.showtimes.movie_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm font-bold uppercase">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          {formatDate(booking.showtimes.showtime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" />
                          {t.common.seat(SEAT_LABELS[booking.seat_number - 1])}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
