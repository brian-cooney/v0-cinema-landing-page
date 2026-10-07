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

// Brand colours and font stacks. Most email apps ignore web fonts, so each
// stack falls back to a close system font.
const BRAND = { yellow: "#fcd450", cyan: "#48bdd8", pink: "#f781be" }
const FONT_DISPLAY = "'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FONT_MONO = "'IBM Plex Mono', 'Courier New', Courier, monospace"
const FONT_LOGO = "Georgia, 'Times New Roman', serif"

// The film card shared by every guest email: poster, title, date, time, seat
function filmCard(screening: ScreeningDetails, seatNumber: number): string {
  const { date, time } = formatScreeningTime(screening.showtime)
  const title = escapeHtml(screening.movieTitle)

  const poster = screening.imageUrl
    ? `<tr><td style="border-bottom: 2px solid #000000;"><img src="${escapeHtml(screening.imageUrl)}" alt="${title}" width="540" style="display: block; width: 100%; max-width: 540px; height: auto; border: 0;"></td></tr>`
    : ""

  const row = (label: string, value: string, highlight = false) => `
    <tr>
      <td style="padding: 6px 0; font-family: ${FONT_MONO}; font-size: 13px; text-transform: uppercase;">${label}</td>
      <td align="right" style="padding: 6px 0; font-family: ${FONT_MONO}; font-size: 13px; font-weight: 700; text-transform: uppercase;">
        ${highlight ? `<span style="background-color: ${BRAND.yellow}; border: 2px solid #000000; padding: 2px 8px;">${value}</span>` : value}
      </td>
    </tr>`

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #000000; margin: 0 0 24px 0;">
      ${poster}
      <tr>
        <td style="padding: 20px;">
          <p style="margin: 0 0 12px 0; font-family: ${FONT_DISPLAY}; font-size: 26px; font-weight: 800; line-height: 1; text-transform: uppercase; color: #000000;">${title}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row("Date", date)}
            ${row("Time", time)}
            ${screening.runningTime ? row("Running time", `${screening.runningTime} min`) : ""}
            ${row("Seat", seatLabel(seatNumber), true)}
          </table>
        </td>
      </tr>
    </table>`
}

// A flat colour block with a mono label, e.g. cyan "Add to calendar"
function note(title: string, body: string, background: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0;">
      <tr>
        <td style="background-color: ${background}; border: 2px solid #000000; padding: 14px 16px;">
          <p style="margin: 0 0 6px 0; font-family: ${FONT_MONO}; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #000000;">${title}</p>
          <p style="margin: 0; font-family: ${FONT_DISPLAY}; font-size: 14px; line-height: 1.5; color: #000000;">${body}</p>
        </td>
      </tr>
    </table>`
}

function button(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 8px 0 0 0;">
      <tr>
        <td style="background-color: #000000;">
          <a href="${href}" style="display: inline-block; padding: 12px 20px; font-family: ${FONT_DISPLAY}; font-size: 16px; font-weight: 800; text-transform: uppercase; color: #ffffff; text-decoration: none;">${label}</a>
        </td>
      </tr>
    </table>`
}

// Yellow page, white card with a black border, logo stamp, label and headline
function emailLayout(label: string, headline: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;800&family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: ${BRAND.yellow};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.yellow};">
          <tr>
            <td align="center" style="padding: 32px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border: 2px solid #000000;">
                <tr>
                  <td style="padding: 28px 28px 0 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #000000; padding: 8px 10px; font-family: ${FONT_LOGO}; font-size: 20px; font-weight: 900; line-height: 0.95; text-transform: uppercase; color: #ffffff;">Embassy<br>Cinema</td>
                      </tr>
                    </table>
                    <p style="margin: 28px 0 0 0;"><span style="background-color: #000000; padding: 4px 8px; font-family: ${FONT_MONO}; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #ffffff;">${label}</span></p>
                    <h1 style="margin: 14px 0 0 0; font-family: ${FONT_DISPLAY}; font-size: 40px; font-weight: 800; line-height: 0.95; text-transform: uppercase; color: #000000;">${headline}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 28px 28px 28px;">${content}</td>
                </tr>
                <tr>
                  <td style="background-color: #000000; padding: 18px 28px; font-family: ${FONT_MONO}; font-size: 12px; line-height: 1.6; text-transform: uppercase; color: #ffffff;">
                    Embassy Cinema · Finalborgo, Italy<br>
                    Six seats · One screen · Always free<br>
                    <a href="${SITE_URL}" style="color: ${BRAND.yellow}; text-decoration: none;">www.embassycinema.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`
}

function greeting(customerName: string, message: string): string {
  return `
    <p style="margin: 0 0 8px 0; font-family: ${FONT_DISPLAY}; font-size: 16px; color: #000000;">Hello ${escapeHtml(customerName)},</p>
    <p style="margin: 0 0 24px 0; font-family: ${FONT_DISPLAY}; font-size: 16px; line-height: 1.5; color: #000000;">${message}</p>`
}

const ARRIVAL_NOTE = note(
  "At the door",
  "Please arrive at least 10 minutes before the screening. No ticket needed, just give your name at the door.",
  "#f0f0f0",
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
    "Booking confirmed",
    "You&#39;re booked!",
    greeting(customerName, "Thanks for your reservation. Your seat is confirmed for:") +
      filmCard(screening, seatNumber) +
      note(
        "Add to calendar",
        "We've attached a calendar invite to this email. Open the .ics file to add the screening to your calendar with a reminder.",
        BRAND.cyan,
      ) +
      ARRIVAL_NOTE +
      button(`${SITE_URL}/dashboard`, "My bookings →"),
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
      "Screening reminder",
      `See you ${relativeDay(screening.showtime)}`,
      greeting(customerName, `Just a reminder that you're booked for <strong>${escapeHtml(screening.movieTitle)}</strong> ${when}.`) +
        filmCard(screening, seatNumber) +
        ARRIVAL_NOTE +
        note(
          "Can't make it?",
          `Please <a href="${SITE_URL}/dashboard" style="color: #000000; font-weight: 700;">cancel your booking</a> so someone else can have your seat.`,
          BRAND.pink,
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
