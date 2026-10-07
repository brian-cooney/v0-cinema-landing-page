"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock, Film, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SeatSelector } from "@/components/seat-selector"
import { formatRunningTime } from "@/lib/utils"

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
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
        <div className="overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
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
                <p className="mb-2 w-fit bg-black px-2 py-0.5 font-mono text-xs font-bold uppercase text-white">Your film</p>
                <h3 className="text-3xl font-semibold uppercase leading-none tracking-tight">
                  {selectedShowtime.movie_title}
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {selectedShowtime.movie_description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-sm font-bold uppercase">
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
                      {formatRunningTime(selectedShowtime.running_time)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-2 font-mono font-bold uppercase hover:bg-brand-yellow"
                onClick={() => setSelectedShowtime(null)}
              >
                Change
              </Button>
            </div>
          </div>
        </div>

        <h2 className="text-center text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl">
          Pick your seat <span aria-hidden="true">↓</span>
        </h2>
        <SeatSelector showtimeId={selectedShowtime.id} />
      </div>
    )
  }

  if (showtimes.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-12 text-center shadow-[6px_6px_0_0_#000]">
        <Film className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="text-3xl font-semibold uppercase leading-none tracking-tight">No upcoming shows</h3>
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
          <h2 className="mb-4 inline-flex items-center gap-2 bg-black px-3 py-1.5 font-mono text-sm font-bold uppercase text-white">
            <Calendar className="h-4 w-4" />
            {formatDate(dateShowtimes[0].showtime)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {dateShowtimes.map((showtime) => (
              <button
                key={showtime.id}
                onClick={() => setSelectedShowtime(showtime)}
                className="group flex flex-col overflow-hidden border-2 border-black bg-white text-left transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
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
                  <h4 className="text-2xl font-semibold uppercase leading-none tracking-tight">
                    {showtime.movie_title}
                  </h4>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {showtime.movie_description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm font-bold uppercase">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      {formatTime(showtime.showtime)}
                    </span>
                    {showtime.running_time && (
                      <span className="flex items-center gap-1.5">
                        <Timer className="h-4 w-4 text-primary" />
                        {formatRunningTime(showtime.running_time)}
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
