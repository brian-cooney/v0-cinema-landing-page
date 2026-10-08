import Link from "next/link"
import Image from "next/image"
import { Film } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getUpcomingShowtimes } from "@/lib/showtimes"
import { getDictionary } from "@/lib/i18n/server"
import { CINEMA_TIME_ZONE, cn } from "@/lib/utils"

interface PastShowtime {
  id: string
  movie_title: string
  showtime: string
  image_url: string | null
}

const formatWhen = (locale: string, dateStr: string, withYear = false) =>
  new Date(dateStr)
    .toLocaleString(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : { hour: "2-digit", minute: "2-digit", hour12: false }),
      timeZone: CINEMA_TIME_ZONE,
    })
    .replace(",", " ·")

// Square photo with a monospace caption underneath, zine style
function ZineCard({
  href,
  imageUrl,
  title,
  lines,
}: {
  href?: string
  imageUrl: string | null
  title: string
  lines: string[]
}) {
  const content = (
    <>
      <div className="relative aspect-square w-full overflow-hidden bg-black/10">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className={cn("object-cover", href && "transition-transform duration-500 group-hover:scale-[1.03]")}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Film className="h-12 w-12 text-black/40" />
          </div>
        )}
      </div>
      <div className="mt-2 font-mono text-sm font-bold uppercase leading-snug">
        <p className={cn(href && "group-hover:underline group-hover:underline-offset-4")}>{title}</p>
        {lines.map((line) => (
          <p key={line} className="font-medium">
            {line}
          </p>
        ))}
      </div>
    </>
  )

  return href ? (
    <Link href={href} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  )
}

function ColumnHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-6 scroll-mt-24 text-center text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl"
    >
      {children} <span aria-hidden="true">↓</span>
    </h2>
  )
}

export async function Programme() {
  const supabase = await createClient()
  const [upcoming, { data: past }, t] = await Promise.all([
    getUpcomingShowtimes(supabase),
    supabase
      .from("showtimes")
      .select("id, movie_title, showtime, image_url")
      .lt("showtime", new Date().toISOString())
      .order("showtime", { ascending: false })
      .limit(6),
    getDictionary(),
  ])

  return (
    <section className="grid md:grid-cols-2">
      <div className="bg-brand-cyan px-4 py-10 sm:px-6">
        <ColumnHeading id="now-showing">{t.programme.nowShowing}</ColumnHeading>
        {upcoming.length > 0 ? (
          <div className="space-y-12">
            {upcoming.map((showtime) => {
              const soldOut = showtime.seatsRemaining <= 0
              return (
                <ZineCard
                  key={showtime.id}
                  href={soldOut ? undefined : `/book?showtime=${showtime.id}`}
                  imageUrl={showtime.image_url}
                  title={showtime.movie_title}
                  lines={[
                    formatWhen(t.intlLocale, showtime.showtime),
                    soldOut ? t.common.soldOut : t.programme.seatsLeft(showtime.seatsRemaining),
                  ]}
                />
              )
            })}
          </div>
        ) : (
          <div className="border-2 border-black p-8 text-center font-mono text-sm font-bold uppercase">
            {t.programme.noUpcoming}
          </div>
        )}
      </div>

      <div className="bg-brand-yellow px-4 py-10 sm:px-6">
        <ColumnHeading id="archive">{t.programme.archive}</ColumnHeading>
        {past && past.length > 0 ? (
          <div className="space-y-12">
            {(past as PastShowtime[]).map((showtime) => (
              <ZineCard
                key={showtime.id}
                imageUrl={showtime.image_url}
                title={showtime.movie_title}
                lines={[t.programme.screened(formatWhen(t.intlLocale, showtime.showtime, true))]}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-black p-8 text-center font-mono text-sm font-bold uppercase">
            {t.programme.noArchive}
          </div>
        )}
      </div>
    </section>
  )
}
