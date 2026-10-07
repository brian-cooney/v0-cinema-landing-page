import { Resend } from "resend"
import { CINEMA_TIME_ZONE, SEAT_LABELS } from "@/lib/utils"

// Created on first send rather than at import, so building the app (which loads
// routes that import this file) doesn't need the API key
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = "Embassy Cinema <bookings@embassycinema.com>"
const SITE_URL = "https://www.embassycinema.com"
const DEFAULT_RUNNING_TIME_MINUTES = 120

export interface ScreeningDetails {
  movieTitle: string
  showtime: string
  imageUrl?: string | null
  runningTime?: number | null
}

interface GuestEmailParams {
  to: string
  customerName: string
  seatNumber: number
  screening: ScreeningDetails
}

// Guest names and film titles are typed by people, so escape them before
// putting them in HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatScreeningTime(showtime: string) {
  const date = new Date(showtime)
  return {
    date: date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: CINEMA_TIME_ZONE,
    }),
    time: date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: CINEMA_TIME_ZONE,
    }),
  }
}

function seatLabel(seatNumber: number): string {
  return SEAT_LABELS[seatNumber - 1] ?? String(seatNumber)
}

// The film card shared by every guest email: poster, title, date, time, seat
function filmCard(screening: ScreeningDetails, seatNumber: number): string {
  const { date, time } = formatScreeningTime(screening.showtime)
  const title = escapeHtml(screening.movieTitle)

  const poster = screening.imageUrl
    ? `<img src="${escapeHtml(screening.imageUrl)}" alt="${title}" width="520" style="display: block; width: 100%; max-width: 520px; height: auto; border: 0; border-radius: 8px 8px 0 0;">`
    : ""

  const row = (label: string, value: string, highlight = false) => `
    <tr>
      <td style="padding: 8px 0; color: #a0a0b0; font-size: 14px;">${label}</td>
      <td style="padding: 8px 0; color: ${highlight ? "#d4a853" : "#e8e8f0"}; font-size: 14px; text-align: right;${highlight ? " font-weight: 600;" : ""}">${value}</td>
    </tr>`

  return `
    <div style="background-color: #1a1a2e; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
      ${poster}
      <div style="padding: 24px;">
        <h2 style="color: #e8e8f0; font-size: 22px; margin: 0 0 16px 0; font-weight: 600;">${title}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${row("Date", date)}
          ${row("Time", time)}
          ${screening.runningTime ? row("Running time", `${screening.runningTime} min`) : ""}
          ${row("Seat", seatLabel(seatNumber), true)}
        </table>
      </div>
    </div>`
}

function note(title: string, body: string, accent = "#6a6a7a"): string {
  return `
    <div style="background-color: rgba(106, 106, 122, 0.1); border-left: 3px solid ${accent}; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
      <p style="color: ${accent === "#6a6a7a" ? "#a0a0b0" : accent}; font-size: 14px; margin: 0; font-weight: 500;">${title}</p>
      <p style="color: #a0a0b0; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">${body}</p>
    </div>`
}

function emailLayout(subtitle: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background-color: #242442; border-radius: 12px; padding: 40px; border: 1px solid #3a3a5c;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #d4a853; font-size: 28px; margin: 0; font-weight: 600;">Embassy Cinema</h1>
              <p style="color: #a0a0b0; font-size: 14px; margin-top: 8px;">${subtitle}</p>
            </div>
            ${content}
            <div style="text-align: center; border-top: 1px solid #3a3a5c; padding-top: 24px; margin-top: 16px;">
              <p style="color: #a0a0b0; font-size: 13px; margin: 0;">We look forward to seeing you!</p>
              <p style="color: #6a6a7a; font-size: 12px; margin-top: 16px;">Embassy Cinema - An intimate film experience</p>
            </div>
          </div>
        </div>
      </body>
    </html>`
}

function greeting(customerName: string, message: string): string {
  return `
    <p style="color: #e8e8f0; font-size: 16px; margin-bottom: 24px;">Hello ${escapeHtml(customerName)},</p>
    <p style="color: #a0a0b0; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">${message}</p>`
}

const ARRIVAL_NOTE = note(
  "Reminder",
  "Please arrive at least 10 minutes before the screening. No ticket required - just give your name at the door.",
)

// ICS text values must escape backslashes, commas, semicolons and newlines
function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n")
}

function generateICSFile({ screening, seatNumber, customerName }: GuestEmailParams): string {
  const startDate = new Date(screening.showtime)
  const runningTime = screening.runningTime ?? DEFAULT_RUNNING_TIME_MINUTES
  const endDate = new Date(startDate.getTime() + runningTime * 60 * 1000)

  // Format for ICS in UTC (YYYYMMDDTHHMMSSZ)
  const formatICSDateUTC = (date: Date): string =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")

  const title = escapeIcsText(screening.movieTitle)
  const uid = `${startDate.getTime()}-${seatNumber}-${customerName.replace(/\W/g, "")}@embassycinema.com`

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Embassy Cinema//Booking System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDateUTC(new Date())}
DTSTART:${formatICSDateUTC(startDate)}
DTEND:${formatICSDateUTC(endDate)}
SUMMARY:${title} at Embassy Cinema
DESCRIPTION:Your booking confirmation for ${title}.\\n\\nSeat: ${seatLabel(seatNumber)}\\nPlease arrive 10 minutes early. No ticket required - just give your name at the door.
LOCATION:Embassy Cinema
ORGANIZER;CN=Embassy Cinema:mailto:bookings@embassycinema.com
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder: ${title} at Embassy Cinema in 1 hour
TRIGGER:-PT1H
END:VALARM
END:VEVENT
END:VCALENDAR`
}

export function confirmationEmailHtml({ customerName, seatNumber, screening }: GuestEmailParams) {
  return emailLayout(
    "Your Booking Confirmation",
    greeting(customerName, "Thank you for your reservation! Your seat has been confirmed for the following screening:") +
      filmCard(screening, seatNumber) +
      note(
        "Add to Calendar",
        "We've attached a calendar invite to this email. Open the .ics file to add this screening to your calendar with a reminder.",
        "#d4a853",
      ) +
      ARRIVAL_NOTE,
  )
}

export async function sendBookingConfirmation(params: GuestEmailParams) {
  const { to, screening } = params

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: [to],
    subject: `Booking Confirmed: ${screening.movieTitle} at Embassy Cinema`,
    attachments: [
      {
        filename: `embassy-cinema-${screening.movieTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`,
        content: Buffer.from(generateICSFile(params)).toString("base64"),
        contentType: "text/calendar",
      },
    ],
    html: confirmationEmailHtml(params),
  })

  if (error) {
    console.error("Failed to send booking confirmation email:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

// "today", "tomorrow" or the weekday, in Rome time
function relativeDay(showtime: string, now = new Date()): string {
  const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: CINEMA_TIME_ZONE })
  const screeningDay = dayKey(new Date(showtime))
  if (screeningDay === dayKey(now)) return "today"
  if (screeningDay === dayKey(new Date(now.getTime() + 24 * 60 * 60 * 1000))) return "tomorrow"
  return `on ${formatScreeningTime(showtime).date}`
}

export function reminderEmail({ to, customerName, seatNumber, screening }: GuestEmailParams) {
  const when = `${relativeDay(screening.showtime)} at ${formatScreeningTime(screening.showtime).time}`

  return {
    from: FROM,
    to: [to],
    subject: `Reminder: ${screening.movieTitle} ${when} at Embassy Cinema`,
    html: emailLayout(
      "Screening Reminder",
      greeting(customerName, `Just a reminder that you're booked for <strong style="color: #e8e8f0;">${escapeHtml(screening.movieTitle)}</strong> ${when}.`) +
        filmCard(screening, seatNumber) +
        ARRIVAL_NOTE +
        note(
          "Can't make it?",
          `Please <a href="${SITE_URL}/dashboard" style="color: #d4a853;">cancel your booking</a> so someone else can have your seat.`,
        ),
    ),
  }
}

// Sends reminders in batches (Resend accepts up to 100 emails per batch call).
// Returns the indexes of the reminders that were sent.
export async function sendReminders(reminders: GuestEmailParams[]): Promise<number[]> {
  const sent: number[] = []
  for (let start = 0; start < reminders.length; start += 100) {
    const chunk = reminders.slice(start, start + 100)
    const { error } = await getResend().batch.send(chunk.map(reminderEmail))
    if (error) {
      console.error("Failed to send reminder emails:", error)
      continue
    }
    chunk.forEach((_, i) => sent.push(start + i))
  }
  return sent
}
