import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShowtimeSelector } from "@/components/showtime-selector"
import { createClient } from "@/lib/supabase/server"

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
}

async function getShowtimes(): Promise<Showtime[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("showtimes")
    .select("*")
    .gte("showtime", new Date().toISOString())
    .order("showtime", { ascending: true })

  return (data as Showtime[]) || []
}

export default async function BookPage() {
  const showtimes = await getShowtimes()

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="font-serif text-lg font-medium">Book Your Seat</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Free Admission
          </p>
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            Select Your Showtime
          </h2>
          <p className="mt-4 text-muted-foreground">
            Choose a screening and pick your preferred seat. All bookings are
            free.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <ShowtimeSelector showtimes={showtimes} />
        </Suspense>
      </div>
    </main>
  )
}
