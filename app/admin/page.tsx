import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminShowtimeList } from "@/components/admin-showtime-list"
import { AddShowtimeForm } from "@/components/add-showtime-form"
import { LogoutButton } from "@/components/logout-button"

interface Showtime {
  id: string
  movie_title: string
  movie_description: string
  showtime: string
  image_url: string | null
}

async function getShowtimes(): Promise<Showtime[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("showtimes")
    .select("*")
    .order("showtime", { ascending: true })

  return (data as Showtime[]) || []
}

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default async function AdminPage() {
  const [showtimes, user] = await Promise.all([getShowtimes(), getUser()])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
                    Admin Dashboard
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Manage your cinema showtimes and films
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                  <LogoutButton />
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-4xl space-y-12">
              <AddShowtimeForm />
              <AdminShowtimeList showtimes={showtimes} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
