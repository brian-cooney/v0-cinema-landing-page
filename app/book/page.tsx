import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShowtimeSelector } from "@/components/showtime-selector"
import { createClient } from "@/lib/supabase/server"
import { MAX_SEATS_PER_GUEST } from "@/lib/utils"

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
  running_time: number | null
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
    <main className="flex min-h-screen flex-col bg-brand-yellow">
      <Header />

      <section className="border-b-2 border-black bg-brand-cyan px-4 pb-10 pt-32 sm:px-6 sm:pt-36">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-sm font-bold uppercase">
            Free admission · Six seats · Up to {MAX_SEATS_PER_GUEST} per guest
          </p>
          <h1 className="mt-3 text-6xl font-semibold uppercase leading-[0.9] tracking-tight sm:text-8xl">
            Book a seat <span aria-hidden="true">↓</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <ShowtimeSelector showtimes={showtimes} />
        </Suspense>
      </div>

      <Footer />
    </main>
  )
}
