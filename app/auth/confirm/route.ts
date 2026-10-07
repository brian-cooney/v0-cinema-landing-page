import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { linkGuestBookings, safeRedirectPath } from "@/lib/auth"

// Landing page for magic-link and sign-up emails.
//
// The email template links here with a token_hash, which can be verified on any
// device. (The older ?code= links only work in the browser that requested them,
// so guests who booked on a laptop and opened the email on their phone couldn't
// sign in.) ?code= is still accepted for emails sent before the template change.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const code = searchParams.get("code")
  const next = safeRedirectPath(searchParams.get("next"), "/dashboard")

  const supabase = await createClient()

  let error: unknown = new Error("Missing sign-in token")
  if (tokenHash && type) {
    ;({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }))
  } else if (code) {
    ;({ error } = await supabase.auth.exchangeCodeForSession(code))
  }

  if (error) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  await linkGuestBookings(supabase)
  return NextResponse.redirect(`${origin}${next}`)
}
