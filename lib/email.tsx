import { Resend } from "resend"
import { CINEMA_TIME_ZONE, SEAT_LABELS } from "@/lib/utils"
import { dictionaries } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/config"

// Created on first send rather than at import, so building the app (which loads
// routes that import this file) doesn't need the API key
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = "Embassy Cinema <bookings@embassycinema.com>"
// Where guests' replies go. Optional: bookings@ has no inbox, so set this to an
// address that receives mail (Vercel env var EMAIL_REPLY_TO)
const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined
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
  locale: Locale
}

// Every string in the guest emails, per language. Values marked as HTML are
// inserted as is, so anything typed by people must be escaped before it goes in.
const en = {
  footerPlace: "Embassy Cinema · Finalborgo, Italy",
  footerTagline: "Six seats · One screen · Always free",
  greeting: (name: string) => `Hello ${name},`,
  date: "Date",
  time: "Time",
  runningTime: "Running time",
  seat: "Seat",
  arrivalTitle: "At the door",
  arrivalBody:
    "Please arrive at least 10 minutes before the screening. No ticket needed, just give your name at the door.",

  confirmSubject: (title: string) => `Booking Confirmed: ${title} at Embassy Cinema`,
  confirmLabel: "Booking confirmed",
  confirmHeadline: "You&#39;re booked!",
  confirmIntro: "Thanks for your reservation. Your seat is confirmed for:",
  calendarTitle: "Add to calendar",
  calendarBody:
    "We've attached a calendar invite to this email. Open the .ics file to add the screening to your calendar with a reminder.",
  myBookings: "My bookings →",

  // Calendar invite text: keep commas and semicolons out (ICS separators)
  icsSummary: (title: string) => `${title} at Embassy Cinema`,
  icsDescription: (title: string, seat: string) =>
    `Your booking confirmation for ${title}.\\n\\nSeat: ${seat}\\nPlease arrive 10 minutes early. No ticket required - just give your name at the door.`,
  icsAlarm: (title: string) => `Reminder: ${title} at Embassy Cinema in 1 hour`,

  today: "today",
  tomorrow: "tomorrow",
  onDate: (date: string) => `on ${date}`,
  when: (day: string, time: string) => `${day} at ${time}`,
  reminderSubject: (title: string, when: string) => `Reminder: ${title} ${when} at Embassy Cinema`,
  reminderLabel: "Screening reminder",
  reminderHeadline: (day: string) => `See you ${day}`,
  reminderIntro: (titleHtml: string, when: string) =>
    `Just a reminder that you're booked for <strong>${titleHtml}</strong> ${when}.`,
  cancelTitle: "Can't make it?",
  cancelBody: (link: (label: string) => string) =>
    `Please ${link("cancel your booking")} so someone else can have your seat.`,
}

const it: typeof en = {
  footerPlace: "Embassy Cinema · Finalborgo, Italia",
  footerTagline: "Sei posti · Uno schermo · Sempre gratis",
  greeting: (name) => `Ciao ${name},`,
  date: "Data",
  time: "Ora",
  runningTime: "Durata",
  seat: "Posto",
  arrivalTitle: "All'ingresso",
  arrivalBody:
    "Ti chiediamo di arrivare almeno 10 minuti prima della proiezione. Non serve il biglietto: basta dire il tuo nome all'ingresso.",

  confirmSubject: (title) => `Prenotazione confermata: ${title} all'Embassy Cinema`,
  confirmLabel: "Prenotazione confermata",
  confirmHeadline: "Posto prenotato!",
  confirmIntro: "Grazie per la prenotazione. Il tuo posto è confermato per:",
  calendarTitle: "Aggiungi al calendario",
  calendarBody:
    "In allegato trovi un invito per il calendario. Apri il file .ics per aggiungere la proiezione al tuo calendario con un promemoria.",
  myBookings: "Le mie prenotazioni →",

  icsSummary: (title) => `${title} all'Embassy Cinema`,
  icsDescription: (title, seat) =>
    `Conferma della prenotazione per ${title}.\\n\\nPosto: ${seat}\\nArriva 10 minuti prima. Non serve il biglietto: basta dire il tuo nome all'ingresso.`,
  icsAlarm: (title) => `Promemoria: ${title} all'Embassy Cinema tra 1 ora`,

  today: "oggi",
  tomorrow: "domani",
  onDate: (date) => date,
  when: (day, time) => `${day} alle ${time}`,
  reminderSubject: (title, when) => `Promemoria: ${title} ${when} all'Embassy Cinema`,
  reminderLabel: "Promemoria proiezione",
  reminderHeadline: (day) => `Ci vediamo ${day}`,
  reminderIntro: (titleHtml, when) => `Ti ricordiamo che hai prenotato <strong>${titleHtml}</strong> per ${when}.`,
  cancelTitle: "Non puoi venire?",
  cancelBody: (link) => `Ti chiediamo di ${link("annullare la prenotazione")}, così qualcun altro potrà avere il tuo posto.`,
}

const COPY: Record<Locale, typeof en> = { en, it }

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

// Copy strings may hold a little HTML (entities, <strong>); flatten them for
// the plain-text part of the email
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

function formatScreeningTime(showtime: string, locale: Locale) {
  const date = new Date(showtime)
  const intlLocale = dictionaries[locale].intlLocale
  return {
    date: date.toLocaleDateString(intlLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: CINEMA_TIME_ZONE,
    }),
    time: date.toLocaleTimeString(intlLocale, {
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
function filmCard(screening: ScreeningDetails, seatNumber: number, locale: Locale): string {
  const t = COPY[locale]
  const { date, time } = formatScreeningTime(screening.showtime, locale)
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
            ${row(t.date, date)}
            ${row(t.time, time)}
            ${screening.runningTime ? row(t.runningTime, `${screening.runningTime} min`) : ""}
            ${row(t.seat, seatLabel(seatNumber), true)}
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
function emailLayout(locale: Locale, label: string, headline: string, content: string): string {
  const t = COPY[locale]
  return `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                    ${t.footerPlace}<br>
                    ${t.footerTagline}<br>
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

function greeting(locale: Locale, customerName: string, message: string): string {
  return `
    <p style="margin: 0 0 8px 0; font-family: ${FONT_DISPLAY}; font-size: 16px; color: #000000;">${COPY[locale].greeting(escapeHtml(customerName))}</p>
    <p style="margin: 0 0 24px 0; font-family: ${FONT_DISPLAY}; font-size: 16px; line-height: 1.5; color: #000000;">${message}</p>`
}

// Plain-text version of the film card
function filmCardText(screening: ScreeningDetails, seatNumber: number, locale: Locale): string {
  const t = COPY[locale]
  const { date, time } = formatScreeningTime(screening.showtime, locale)
  return [
    screening.movieTitle.toUpperCase(),
    `${t.date}: ${date}`,
    `${t.time}: ${time}`,
    ...(screening.runningTime ? [`${t.runningTime}: ${screening.runningTime} min`] : []),
    `${t.seat}: ${seatLabel(seatNumber)}`,
  ].join("\n")
}

function plainTextEmail(locale: Locale, sections: string[]): string {
  const t = COPY[locale]
  return [...sections, `--\n${t.footerPlace}\n${t.footerTagline}\nwww.embassycinema.com`].join("\n\n")
}

const arrivalNote = (locale: Locale) => note(COPY[locale].arrivalTitle, COPY[locale].arrivalBody, "#f0f0f0")

// ICS text values must escape backslashes, commas, semicolons and newlines
function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n")
}

function generateICSFile({ screening, seatNumber, customerName, locale }: GuestEmailParams): string {
  const t = COPY[locale]
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
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDateUTC(new Date())}
DTSTART:${formatICSDateUTC(startDate)}
DTEND:${formatICSDateUTC(endDate)}
SUMMARY:${t.icsSummary(title)}
DESCRIPTION:${t.icsDescription(title, seatLabel(seatNumber))}
LOCATION:Embassy Cinema
ORGANIZER;CN=Embassy Cinema:mailto:bookings@embassycinema.com
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:${t.icsAlarm(title)}
TRIGGER:-PT1H
END:VALARM
END:VEVENT
END:VCALENDAR`
}

export function confirmationEmailHtml({ customerName, seatNumber, screening, locale }: GuestEmailParams) {
  const t = COPY[locale]
  return emailLayout(
    locale,
    t.confirmLabel,
    t.confirmHeadline,
    greeting(locale, customerName, t.confirmIntro) +
      filmCard(screening, seatNumber, locale) +
      note(t.calendarTitle, t.calendarBody, BRAND.cyan) +
      arrivalNote(locale) +
      button(`${SITE_URL}/dashboard`, t.myBookings),
  )
}

export function confirmationEmailText({ customerName, seatNumber, screening, locale }: GuestEmailParams) {
  const t = COPY[locale]
  return plainTextEmail(locale, [
    t.greeting(customerName),
    toPlainText(t.confirmIntro),
    filmCardText(screening, seatNumber, locale),
    `${t.calendarTitle}: ${t.calendarBody}`,
    `${t.arrivalTitle}: ${t.arrivalBody}`,
    `${toPlainText(t.myBookings).replace(" →", "")}: ${SITE_URL}/dashboard`,
  ])
}

export async function sendBookingConfirmation(params: GuestEmailParams) {
  const { to, screening, locale } = params

  const { data, error } = await getResend().emails.send({
    from: FROM,
    to: [to],
    replyTo: REPLY_TO,
    subject: COPY[locale].confirmSubject(screening.movieTitle),
    attachments: [
      {
        filename: `embassy-cinema-${screening.movieTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`,
        content: Buffer.from(generateICSFile(params)).toString("base64"),
        contentType: "text/calendar; method=PUBLISH",
      },
    ],
    html: confirmationEmailHtml(params),
    text: confirmationEmailText(params),
  })

  if (error) {
    console.error("Failed to send booking confirmation email:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

// "today", "tomorrow" or the weekday, in Rome time
function relativeDay(showtime: string, locale: Locale, now = new Date()): string {
  const t = COPY[locale]
  const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: CINEMA_TIME_ZONE })
  const screeningDay = dayKey(new Date(showtime))
  if (screeningDay === dayKey(now)) return t.today
  if (screeningDay === dayKey(new Date(now.getTime() + 24 * 60 * 60 * 1000))) return t.tomorrow
  return t.onDate(formatScreeningTime(showtime, locale).date)
}

export function reminderEmail({ to, customerName, seatNumber, screening, locale }: GuestEmailParams) {
  const t = COPY[locale]
  const day = relativeDay(screening.showtime, locale)
  const when = t.when(day, formatScreeningTime(screening.showtime, locale).time)
  const dashboardLink = (label: string) =>
    `<a href="${SITE_URL}/dashboard" style="color: #000000; font-weight: 700;">${label}</a>`

  return {
    from: FROM,
    to: [to],
    replyTo: REPLY_TO,
    subject: t.reminderSubject(screening.movieTitle, when),
    html: emailLayout(
      locale,
      t.reminderLabel,
      t.reminderHeadline(day),
      greeting(locale, customerName, t.reminderIntro(escapeHtml(screening.movieTitle), when)) +
        filmCard(screening, seatNumber, locale) +
        arrivalNote(locale) +
        note(t.cancelTitle, t.cancelBody(dashboardLink), BRAND.pink),
    ),
    text: plainTextEmail(locale, [
      t.greeting(customerName),
      // Escape first so a title like "<Friends>" survives the tag stripping
      toPlainText(t.reminderIntro(escapeHtml(screening.movieTitle), when)),
      filmCardText(screening, seatNumber, locale),
      `${t.arrivalTitle}: ${t.arrivalBody}`,
      `${t.cancelTitle} ${t.cancelBody((label) => `${label} (${SITE_URL}/dashboard)`)}`,
    ]),
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
