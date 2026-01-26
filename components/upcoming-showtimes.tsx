import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
}

export async function UpcomingShowtimes() {
  const supabase = await createClient()

  const { data: showtimes } = await supabase
    .from("showtimes")
    .select("*")
    .gte("showtime", new Date().toISOString())
    .order("showtime", { ascending: true })
    .limit(6)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
            {showtimes.map((showtime: Showtime) => (
              <div
                key={showtime.id}
                className="group flex flex-col rounded-lg border border-border/50 bg-card overflow-hidden transition-all hover:border-primary/30"
              >
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
                  <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      {formatDate(showtime.showtime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {formatTime(showtime.showtime)}
                    </span>
                  </div>
<Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                    <Link href={`/book?showtime=${showtime.id}`}>
                      Reserve Seats
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
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
