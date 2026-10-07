import type { SupabaseClient } from "@supabase/supabase-js"

// Admins are listed in the `admins` table (see scripts/006). The same
// is_admin() function backs the database policies, so the app and the
// database always agree on who is an admin.
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin")
  return !error && data === true
}

// Only allow same-site relative paths, so links like
// /auth/callback?redirectTo=@evil.com can't send users to another site.
export function safeRedirectPath(path: string | null, fallback = "/"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return fallback
  }
  return path
}

// Link bookings made with this email before the guest had an account, so they
// show up in "My Bookings". Matches rows where user_id is still NULL.
export async function linkGuestBookings(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return

  await supabase
    .from("bookings")
    .update({ user_id: user.id })
    .eq("customer_email", user.email)
    .is("user_id", null)
}
