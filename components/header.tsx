"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface HeaderProps {
  // "overlay" floats over a full-bleed hero (home page); "solid" is a white
  // bar for every other page
  variant?: "overlay" | "solid"
}

export function Header({ variant = "solid" }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close the menu on navigation, and with Escape
  useEffect(() => setMenuOpen(false), [pathname])
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    setMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const blockButton =
    "px-3 py-2 text-2xl font-semibold uppercase leading-none tracking-tight text-black transition-transform hover:-translate-y-0.5 sm:text-4xl"

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex items-start justify-between p-3 sm:p-5",
          variant === "solid" && "border-b-2 border-black bg-white",
        )}
      >
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/book" className={cn(blockButton, "hidden bg-brand-cyan sm:block")}>
            Book
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className={cn(blockButton, "bg-brand-yellow")}
          >
            Menu
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-brand-yellow"
        >
          <div className="flex items-start justify-between p-3 sm:p-5">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className={cn(blockButton, "flex items-center gap-1 bg-black text-white")}
              autoFocus
            >
              Close <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center px-5 pb-10 sm:px-10">
            {[
              { href: "/#now-showing", label: "Now Showing" },
              { href: "/book", label: "Book a Seat" },
              { href: "/#archive", label: "Archive" },
              { href: "/#about", label: "About" },
              user
                ? { href: "/dashboard", label: "My Bookings" }
                : { href: "/auth/user-login", label: "Sign In" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b-2 border-black py-2 text-5xl font-semibold uppercase leading-none tracking-tight transition-colors hover:bg-black hover:text-brand-yellow sm:text-7xl"
              >
                {item.label} <span aria-hidden="true">→</span>
              </Link>
            ))}
            {user && (
              <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-sm font-bold uppercase">
                <span>Signed in as {user.email}</span>
                <button type="button" onClick={handleSignOut} className="underline underline-offset-4">
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
