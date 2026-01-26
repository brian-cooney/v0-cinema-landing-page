import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { UpcomingShowtimes } from "@/components/upcoming-showtimes"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <UpcomingShowtimes />
      <Footer />
    </main>
  )
}
