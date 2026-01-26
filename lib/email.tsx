import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingConfirmationParams {
  to: string
  customerName: string
  movieTitle: string
  showtime: string
  seatNumber: number
}

export async function sendBookingConfirmation({
  to,
  customerName,
  movieTitle,
  showtime,
  seatNumber,
}: BookingConfirmationParams) {
  const date = new Date(showtime)
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const { data, error } = await resend.emails.send({
    from: "Embassy Cinema <bookings@embassycinema.com>",
    to: [to],
    subject: `Booking Confirmed: ${movieTitle} at Embassy Cinema`,
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
              
              <!-- Reminder -->
              <div style="background-color: rgba(212, 168, 83, 0.1); border-left: 3px solid #d4a853; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
                <p style="color: #d4a853; font-size: 14px; margin: 0; font-weight: 500;">Reminder</p>
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
