import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { getUpcomingShowtimes } from "@/lib/showtimes"
import { getDictionary } from "@/lib/i18n/server"
import { CINEMA_TIME_ZONE } from "@/lib/utils"

// Full-bleed photo of the cinema, captioned like a photo credit with the next
// screening. (Film images are usually trailer thumbnails with burned-in text,
// which don't hold up at full-screen size.)
export async function Hero() {
  const supabase = await createClient()
  const [[next], t] = await Promise.all([getUpcomingShowtimes(supabase, { limit: 1 }), getDictionary()])

  const when = next
    ? new Date(next.showtime)
        .toLocaleString(t.intlLocale, {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: CINEMA_TIME_ZONE,
        })
        .replace(",", " ·")
    : null

  return (
    <section className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-black">
      <Image
        src="/hero-cinema.webp"
        alt={t.hero.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 text-white sm:p-6">
        {next ? (
          <Link
            href={`/book?showtime=${next.id}`}
            className="group w-fit text-sm font-medium uppercase tracking-wide sm:text-base"
          >
            {t.hero.nextUp} — {next.movie_title} · {when} ·{" "}
            <span className="underline underline-offset-4 group-hover:text-brand-yellow">
              {next.seatsRemaining > 0 ? t.hero.seatsLeft(next.seatsRemaining) : t.hero.soldOut}
            </span>
          </Link>
        ) : (
          <p className="text-sm font-medium uppercase tracking-wide sm:text-base">
            {t.hero.nothingScheduled}
          </p>
        )}
      </div>
    </section>
  )
}
