"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
