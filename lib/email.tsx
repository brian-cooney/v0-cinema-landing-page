import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationParams {
  to: string
  customerName: string
  movieTitle: string
  showtime: string
  seatNumber: number
}

function generateICSFile({
  movieTitle,
  showtime,
  seatNumber,
  customerName,
}: {
  movieTitle: string
  showtime: string
  seatNumber: number
  customerName: string
}): string {
  const startDate = new Date(showtime)
  // Assume movie duration of 2 hours
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)
  
  // Format dates for ICS in local time (YYYYMMDDTHHMMSS format)
  const formatICSDateLocal = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}T${hours}${minutes}${seconds}`
  }
  
  // Format for DTSTAMP (must be UTC)
  const formatICSDateUTC = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  const uid = `${startDate.getTime()}-${seatNumber}-${customerName.replace(/\s/g, '')}@embassycinema.com`
  const now = formatICSDateUTC(new Date())
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Embassy Cinema//Booking System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VTIMEZONE
TZID:Europe/Rome
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART;TZID=Europe/Rome:${formatICSDateLocal(startDate)}
DTEND;TZID=Europe/Rome:${formatICSDateLocal(endDate)}
SUMMARY:${movieTitle} at Embassy Cinema
DESCRIPTION:Your booking confirmation for ${movieTitle}.\\n\\nSeat: ${seatNumber}\\nPlease arrive 10 minutes early. No ticket required - just give your name at the door.
LOCATION:Embassy Cinema
ORGANIZER;CN=Embassy Cinema:mailto:bookings@embassycinema.com
ATTENDEE;CN=${customerName};RSVP=FALSE:mailto:${customerName}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder: ${movieTitle} at Embassy Cinema in 1 hour
TRIGGER:-PT1H
END:VALARM
END:VEVENT
END:VCALENDAR`
}

export async function sendBookingConfirmation({
  to,
  customerName,
  movieTitle,
  showtime,
  seatNumber,
}: BookingConfirmationParams) {
  const date = new Date(showtime)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  const formattedDate = `${day}/${month}/${year}`
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  
  // Generate calendar invite
  const icsContent = generateICSFile({
    movieTitle,
    showtime,
    seatNumber,
    customerName,
  })

  const { data, error } = await resend.emails.send({
    from: "Embassy Cinema <bookings@embassycinema.com>",
    to: [to],
    subject: `Booking Confirmed: ${movieTitle} at Embassy Cinema`,
    attachments: [
      {
        filename: `embassy-cinema-${movieTitle.toLowerCase().replace(/\s+/g, '-')}.ics`,
        content: Buffer.from(icsContent).toString('base64'),
        contentType: 'text/calendar',
      },
    ],
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: #242442; border-radius: 12px; padding: 40px; border: 1px solid #3a3a5c;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #d4a853; font-size: 28px; margin: 0; font-weight: 600;">Embassy Cinema</h1>
                <p style="color: #a0a0b0; font-size: 14px; margin-top: 8px;">Your Booking Confirmation</p>
              </div>
              
              <!-- Greeting -->
              <p style="color: #e8e8f0; font-size: 16px; margin-bottom: 24px;">
                Hello ${customerName},
              </p>
              <p style="color: #a0a0b0; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">
                Thank you for your reservation! Your seat has been confirmed for the following screening:
              </p>
              
              <!-- Booking Details Card -->
              <div style="background-color: #1a1a2e; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <h2 style="color: #e8e8f0; font-size: 22px; margin: 0 0 20px 0; font-weight: 600;">
                  ${movieTitle}
                </h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #a0a0b0; font-size: 14px;">Date</td>
                    <td style="padding: 8px 0; color: #e8e8f0; font-size: 14px; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a0a0b0; font-size: 14px;">Time</td>
                    <td style="padding: 8px 0; color: #e8e8f0; font-size: 14px; text-align: right;">${formattedTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #a0a0b0; font-size: 14px;">Seat</td>
                    <td style="padding: 8px 0; color: #d4a853; font-size: 14px; text-align: right; font-weight: 600;">Seat ${seatNumber}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Calendar -->
              <div style="background-color: rgba(212, 168, 83, 0.1); border-left: 3px solid #d4a853; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                <p style="color: #d4a853; font-size: 14px; margin: 0; font-weight: 500;">Add to Calendar</p>
                <p style="color: #a0a0b0; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">
                  We've attached a calendar invite to this email. Open the .ics file to add this screening to your calendar with a reminder.
                </p>
              </div>
              
              <!-- Reminder -->
              <div style="background-color: rgba(106, 106, 122, 0.1); border-left: 3px solid #6a6a7a; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
                <p style="color: #a0a0b0; font-size: 14px; margin: 0; font-weight: 500;">Reminder</p>
                <p style="color: #a0a0b0; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">
                  Please arrive at least 10 minutes before the screening. No ticket required - just give your name at the door.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; border-top: 1px solid #3a3a5c; padding-top: 24px;">
                <p style="color: #a0a0b0; font-size: 13px; margin: 0;">
                  We look forward to seeing you!
                </p>
                <p style="color: #6a6a7a; font-size: 12px; margin-top: 16px;">
                  Embassy Cinema - An intimate film experience
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error("Failed to send booking confirmation email:", error)
    return { success: false, error }
  }

  return { success: true, data }
}
