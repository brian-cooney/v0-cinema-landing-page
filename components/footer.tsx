import Link from "next/link"
import { Film } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg">Embassy Cinema</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            A passion project dedicated to the art of film.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Admin Login
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Embassy Cinema
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
