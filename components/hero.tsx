import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
      {/* Decorative film strip elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-96 w-40 rotate-12 bg-card/30 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-96 w-40 -rotate-12 bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary">
          Est. 2025
        </p>
        <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight text-balance md:text-7xl">
          Cinema club is back for 2026, screening a new film every Wednesday. 
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Italy's smallest screening room with just six seats. No crowds or
          distractions. Experience films the way
          their creators intended.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-40">
            <Link href="/book">Book Your Seat</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-40 bg-transparent">
            <Link href="#showtimes">View Showtimes</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          All screenings are free. Reserve your spot today.
        </p>
      </div>
    </section>
  )
}
