"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Film, Mail, ArrowLeft, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function UserLoginContent() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      })
      if (error) throw error
      setEmailSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-serif text-2xl">Check Your Email</CardTitle>
              <CardDescription className="mt-2">
                We&apos;ve sent a magic link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to sign in. The link will expire in 1 hour.
              </p>
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={() => {
                  setEmailSent(false)
                  setEmail("")
                }}
              >
                Use a different email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
            <CardTitle className="font-serif text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email to receive a magic sign-in link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMagicLink}>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="flex items-center justify-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function UserLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background p-6">
          <div className="flex items-center gap-2 font-serif text-2xl font-medium">
            <Film className="h-6 w-6 text-primary" />
            Embassy Cinema
          </div>
          <div className="mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      }
    >
      <UserLoginContent />
    </Suspense>
  )
}
