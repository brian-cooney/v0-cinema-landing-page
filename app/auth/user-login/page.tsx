"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Film, ArrowLeft, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmailCodeSignIn } from "@/components/email-code-sign-in"
import { safeRedirectPath } from "@/lib/auth"

function UserLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo"), "/dashboard")

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
              We&apos;ll email you a sign-in code. No password needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailCodeSignIn
              redirectTo={redirectTo}
              onSignedIn={() => {
                router.push(redirectTo)
                router.refresh()
              }}
              autoFocus
            />
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
