import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { safeRedirectPath } from "@/lib/auth"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo"), "/dashboard")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        // Link any existing bookings with this email to the user's account
        // This matches bookings where customer_email equals their auth email
        // and user_id is currently NULL (unlinked legacy bookings)
        await supabase
          .from("bookings")
          .update({ user_id: user.id })
          .eq("customer_email", user.email)
          .is("user_id", null)
      }
      
      // Redirect to the intended destination after successful auth
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
  }

  // Return the user to an error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/error`)
}
