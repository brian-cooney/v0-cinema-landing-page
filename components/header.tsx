"use client"

import Link from "next/link"
import { Film } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl font-semibold tracking-wide">
            Embassy Cinema
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="#about"
            className="hidden sm:block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="#showtimes"
            className="hidden sm:block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Showtimes
          </Link>
          <Button asChild size="sm">
            <Link href="/book">Book Now</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
