import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Film, Users, Timer } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { cn, formatRunningTime } from "@/lib/utils"

const TOTAL_SEATS = 6

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
  running_time: number | null
}

export async function UpcomingShowtimes() {
  const supabase = await createClient()

  const { data: showtimes } = await supabase
    .from("showtimes")
    .select("*")
    .gte("showtime", new Date().toISOString())
    .order("showtime", { ascending: true })
    .limit(6)

  // Count taken seats via the public booked_seats view; guests can't read
  // other people's rows in the bookings table directly.
  const { data: bookedSeats } = await supabase
    .from("booked_seats")
    .select("showtime_id")
    .in("showtime_id", showtimes?.map((s) => s.id) ?? [])

  const bookedCounts = new Map<string, number>()
  for (const { showtime_id } of bookedSeats ?? []) {
    bookedCounts.set(showtime_id, (bookedCounts.get(showtime_id) ?? 0) + 1)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Europe/Rome",
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Rome",
    })
  }

  return (
    <section id="showtimes" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Now Showing
          </p>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Upcoming Screenings
          </h2>
        </div>

        {showtimes && showtimes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showtimes.map((showtime: Showtime) => {
              const bookedCount = bookedCounts.get(showtime.id) ?? 0
              const seatsRemaining = TOTAL_SEATS - bookedCount
              const isSoldOut = seatsRemaining <= 0

              const cardClassName =
                "group flex flex-col rounded-lg border border-border/50 bg-card overflow-hidden transition-all"
              const cardContent = (
              <>
                {showtime.image_url ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={showtime.image_url || "/placeholder.svg"}
                      alt={showtime.movie_title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted/30">
                    <Film className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 font-serif text-xl font-medium">
                    {showtime.movie_title}
                  </h3>
                  <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {showtime.movie_description}
                  </p>
                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(showtime.showtime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {formatTime(showtime.showtime)}
                    </span>
                    {showtime.running_time && (
                      <span className="flex items-center gap-1.5">
                        <Timer className="h-4 w-4 text-primary" />
                        {formatRunningTime(showtime.running_time)}
                      </span>
                    )}
                  </div>
                  <div className="mb-4 flex items-center gap-1.5 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    {isSoldOut ? (
                      <span className="text-destructive font-medium">No seats available</span>
                    ) : (
                      <span className="text-muted-foreground">
                        {seatsRemaining} {seatsRemaining === 1 ? "seat" : "seats"} remaining
                      </span>
                    )}
                  </div>
                  {/* The whole card is the link, so this only looks like a button */}
                  <span
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full bg-transparent",
                      isSoldOut
                        ? "opacity-50"
                        : "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
                    )}
                  >
                    {isSoldOut ? "Sold Out" : "Reserve Seats"}
                  </span>
                </div>
              </>
              )

              return isSoldOut ? (
                <div key={showtime.id} className={cardClassName}>
                  {cardContent}
                </div>
              ) : (
                <Link
                  key={showtime.id}
                  href={`/book?showtime=${showtime.id}`}
                  className={cn(
                    cardClassName,
                    "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  )}
                >
                  {cardContent}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No upcoming screenings scheduled. Check back soon!
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/book">View All Showtimes</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
