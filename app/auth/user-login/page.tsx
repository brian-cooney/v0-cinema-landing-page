"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { ArrowLeft, Loader2 } from "lucide-react"
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
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-brand-cyan p-6">
      <Logo className="mb-8" />
      <div className="w-full max-w-sm">
        <Card className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold uppercase leading-none tracking-tight">Sign In</CardTitle>
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
        <div className="flex min-h-svh w-full flex-col items-center justify-center bg-brand-cyan p-6">
          <span className="bg-black px-2.5 py-2 font-logo text-[22px] font-black uppercase leading-[0.95] text-white">
            Embassy
            <br />
            Cinema
          </span>
          <div className="mt-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      }
    >
      <UserLoginContent />
    </Suspense>
  )
}
