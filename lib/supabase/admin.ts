import { createClient } from "@supabase/supabase-js"

// Service-role client that bypasses row level security. Only for server-side
// jobs with no signed-in user (e.g. the reminder cron). Never import this from
// a client component: the key must not reach the browser.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
