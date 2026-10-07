import Image from "next/image"
import { Calendar, Clock, Film } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
}

export async function PastScreenings() {
  const supabase = await createClient()

  // Get the date from 1 day ago
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const { data: showtimes } = await supabase
    .from("showtimes")
    .select("*")
    .lt("showtime", oneDayAgo.toISOString())
    .order("showtime", { ascending: false })
    .limit(6)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
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

  if (!showtimes || showtimes.length === 0) {
    return null
  }

  return (
    <section id="past-screenings" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Archive
          </p>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Past Screenings
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {showtimes.map((showtime: Showtime) => (
            <div
              key={showtime.id}
              className="group flex flex-col rounded-lg border border-border/50 bg-card overflow-hidden"
            >
              {showtime.image_url ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={showtime.image_url || "/placeholder.svg"}
                    alt={showtime.movie_title}
                    fill
                    className="object-cover"
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
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(showtime.showtime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatTime(showtime.showtime)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
