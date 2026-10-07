import Link from "next/link"
import { Logo } from "@/components/logo"
import { AlertCircle } from "lucide-react"
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
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-brand-cyan p-6">
      <Logo className="mb-8" />
      <div className="w-full max-w-sm">
        <Card className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-semibold uppercase leading-none tracking-tight">Authentication Error</CardTitle>
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
