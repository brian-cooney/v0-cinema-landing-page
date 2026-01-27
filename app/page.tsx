import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { FeaturedIn } from "@/components/featured-in"
import { UpcomingShowtimes } from "@/components/upcoming-showtimes"
import { PastScreenings } from "@/components/past-screenings"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <UpcomingShowtimes />
      <PastScreenings />
      <Features />
      <FeaturedIn />
      <Footer />
    </main>
  )
}
