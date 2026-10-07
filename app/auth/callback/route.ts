import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { linkGuestBookings, safeRedirectPath } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo"), "/dashboard")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      await linkGuestBookings(supabase)

      // Redirect to the intended destination after successful auth
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // Return the user to an error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/error`)
}
