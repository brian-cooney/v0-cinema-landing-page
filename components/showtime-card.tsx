import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, Film, Users, Timer } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { CINEMA_TIME_ZONE, cn, formatRunningTime } from "@/lib/utils"
import type { UpcomingShowtime } from "@/lib/showtimes"

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: CINEMA_TIME_ZONE,
  })

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: CINEMA_TIME_ZONE,
  })

// Poster card for an upcoming screening. The whole card links to booking,
// unless it's sold out.
export function ShowtimeCard({ showtime }: { showtime: UpcomingShowtime }) {
  const { seatsRemaining } = showtime
  const isSoldOut = seatsRemaining <= 0

  const cardClassName =
    "group flex flex-col rounded-lg border border-border/50 bg-card overflow-hidden transition-all"
  const cardContent = (
    <>
      {showtime.image_url ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={showtime.image_url}
            alt={showtime.movie_title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted/30">
          <Film className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 font-serif text-xl font-medium">{showtime.movie_title}</h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {showtime.movie_description}
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            {formatDate(showtime.showtime)}
          </span>
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
        <div className="mb-4 flex items-center gap-1.5 text-sm">
          <Users className="h-4 w-4 text-primary" />
          {isSoldOut ? (
            <span className="font-medium text-destructive">No seats available</span>
          ) : (
            <span className="text-muted-foreground">
              {seatsRemaining} {seatsRemaining === 1 ? "seat" : "seats"} remaining
            </span>
          )}
        </div>
        {/* The whole card is the link, so this only looks like a button */}
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full bg-transparent",
            isSoldOut
              ? "opacity-50"
              : "group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground",
          )}
        >
          {isSoldOut ? "Sold Out" : "Reserve Seats"}
        </span>
      </div>
    </>
  )

  return isSoldOut ? (
    <div className={cardClassName}>{cardContent}</div>
  ) : (
    <Link
      href={`/book?showtime=${showtime.id}`}
      className={cn(
        cardClassName,
        "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
    >
      {cardContent}
    </Link>
  )
}
