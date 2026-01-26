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
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Embassy Cinema
          </p>
        </div>
      </div>
    </footer>
  )
}
