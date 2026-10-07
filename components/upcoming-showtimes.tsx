import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShowtimeCard } from "@/components/showtime-card"
import { createClient } from "@/lib/supabase/server"
import { getUpcomingShowtimes } from "@/lib/showtimes"

export async function UpcomingShowtimes() {
  const supabase = await createClient()
  const showtimes = await getUpcomingShowtimes(supabase)

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

        {showtimes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showtimes.map((showtime) => (
              <ShowtimeCard key={showtime.id} showtime={showtime} />
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
