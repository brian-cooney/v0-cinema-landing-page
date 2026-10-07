import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Ticker } from "@/components/ticker"
import { Programme } from "@/components/programme"
import { Features } from "@/components/features"
import { FeaturedIn } from "@/components/featured-in"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header variant="overlay" />
      <Hero />
      <Ticker />
      <Programme />
      <Features />
      <FeaturedIn />
      <Footer />
    </main>
  )
}
