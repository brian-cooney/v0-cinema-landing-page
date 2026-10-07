import Link from "next/link"
import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="border-t-2 border-black bg-black px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <Logo className="border-2 border-white" />
          <p className="max-w-xs font-mono text-sm">
            A passion project dedicated to the art of film. Finalborgo, Italy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm font-bold uppercase">
          <Link href="/book" className="hover:text-brand-yellow">Book a seat</Link>
          <Link href="/dashboard" className="hover:text-brand-yellow">My bookings</Link>
          <Link href="/auth/login" className="hover:text-brand-yellow">Admin</Link>
          <span className="font-medium text-white/60">&copy; {new Date().getFullYear()} Embassy Cinema</span>
        </div>
      </div>
    </footer>
  )
}
