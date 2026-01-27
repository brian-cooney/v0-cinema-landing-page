import Link from "next/link"
import { Film, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background p-6">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-serif text-2xl font-medium"
      >
        <Film className="h-6 w-6 text-primary" />
        Embassy Cinema
      </Link>
      <div className="w-full max-w-sm">
        <Card className="border-border/50 bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="font-serif text-2xl">Authentication Error</CardTitle>
            <CardDescription className="mt-2">
              Something went wrong during sign in. The link may have expired or already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/user-login">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
