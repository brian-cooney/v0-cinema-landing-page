import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRunningTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) {
    return `${mins}m`
  }
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}m`
}

export const CINEMA_TIME_ZONE = "Europe/Rome"

// Offset of Rome from UTC (in ms) at the given instant: +1h in winter, +2h in summer.
function romeOffsetMs(timestamp: number): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: CINEMA_TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(timestamp)
      .map((p) => [p.type, p.value]),
  )
  const wallClockAsUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return wallClockAsUTC - timestamp
}

// Convert a date ("YYYY-MM-DD") and time ("HH:mm") as shown on a clock in Rome
// to an ISO timestamp, using the correct offset for that date (CET or CEST).
export function romeTimeToISO(date: string, time: string): string {
  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const wallClockAsUTC = Date.UTC(year, month - 1, day, hour, minute)

  let timestamp = wallClockAsUTC - romeOffsetMs(wallClockAsUTC)
  // Re-check in case the first guess landed on the other side of a DST switch
  const correctedOffset = romeOffsetMs(timestamp)
  timestamp = wallClockAsUTC - correctedOffset

  return new Date(timestamp).toISOString()
}
