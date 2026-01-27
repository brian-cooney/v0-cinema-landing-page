"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, Film, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SeatSelector } from "@/components/seat-selector"

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
  running_time: number | null
}

interface ShowtimeSelectorProps {
  showtimes: Showtime[]
}

export function ShowtimeSelector({ showtimes }: ShowtimeSelectorProps) {
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get("showtime")
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    null
  )

  useEffect(() => {
    if (preselectedId) {
      const found = showtimes.find((s) => s.id === preselectedId)
      if (found) setSelectedShowtime(found)
    }
  }, [preselectedId, showtimes])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Rome",
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Europe/Rome",
    })
  }

  const getDateKey = (dateStr: string) => {
    const date = new Date(dateStr)
    // Use Italian timezone for date grouping
    return date.toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" }) // sv-SE gives YYYY-MM-DD format
  }

  // Group showtimes by date
  const groupedShowtimes = showtimes.reduce(
    (acc, showtime) => {
      const date = getDateKey(showtime.showtime)
      if (!acc[date]) acc[date] = []
      acc[date].push(showtime)
      return acc
    },
    {} as Record<string, Showtime[]>
  )

  if (selectedShowtime) {
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {selectedShowtime.image_url ? (
              <div className="relative aspect-[16/9] sm:aspect-auto sm:h-48 sm:w-32 shrink-0">
                <Image
                  src={selectedShowtime.image_url || "/placeholder.svg"}
                  alt={selectedShowtime.movie_title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="hidden sm:flex h-48 w-32 shrink-0 items-center justify-center bg-muted/30">
                <Film className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            <div className="flex flex-1 items-start justify-between gap-4 p-6">
              <div>
                <p className="mb-1 text-sm font-medium text-primary">Selected</p>
                <h3 className="font-serif text-2xl font-medium">
                  {selectedShowtime.movie_title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {selectedShowtime.movie_description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    {formatDate(selectedShowtime.showtime)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {formatTime(selectedShowtime.showtime)}
                  </span>
                  {selectedShowtime.running_time && (
                    <span className="flex items-center gap-1.5">
                      <Timer className="h-4 w-4 text-primary" />
                      {selectedShowtime.running_time} min
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedShowtime(null)}
              >
                Change
              </Button>
            </div>
          </div>
        </div>

        <SeatSelector showtimeId={selectedShowtime.id} />
      </div>
    )
  }

  if (showtimes.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-12 text-center">
        <Film className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="font-serif text-xl font-medium">No Upcoming Shows</h3>
        <p className="mt-2 text-muted-foreground">
          Check back soon for new screenings!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedShowtimes).map(([date, dateShowtimes]) => (
        <div key={date}>
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            {formatDate(dateShowtimes[0].showtime)}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {dateShowtimes.map((showtime) => (
              <button
                key={showtime.id}
                onClick={() => setSelectedShowtime(showtime)}
                className="group flex flex-col rounded-lg border border-border/50 bg-card overflow-hidden text-left transition-all hover:border-primary/50 hover:bg-card/80"
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
                    <Film className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="font-serif text-lg font-medium group-hover:text-primary">
                    {showtime.movie_title}
                  </h4>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {showtime.movie_description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {formatTime(showtime.showtime)}
                    </span>
                    {showtime.running_time && (
                      <span className="flex items-center gap-1.5">
                        <Timer className="h-4 w-4 text-primary" />
                        {showtime.running_time} min
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
