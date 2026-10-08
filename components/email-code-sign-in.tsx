"use client"

import { useState } from "react"
import { Loader2, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDictionary } from "@/lib/i18n/client"

interface EmailCodeSignInProps {
  // Where the link in the email should land (a same-site path)
  redirectTo: string
  // Called once the code has been verified and the session is set
  onSignedIn: () => void
  autoFocus?: boolean
}

// Signs a guest in without leaving the page: we email a one-time code (plus a
// link as a fallback) and they type the code here. Email links always open a
// new tab, so the code keeps them in the tab where they picked their seat.
export function EmailCodeSignIn({ redirectTo, onSignedIn, autoFocus }: EmailCodeSignInProps) {
  const t = useDictionary().signIn
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // The email template appends &token_hash=...&type=email to this URL
        // (see app/auth/confirm/route.ts)
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirectTo)}`,
      },
    })

    setIsLoading(false)
    if (error) {
      setError(t.sendFailed(error.message))
    } else {
      setCodeSent(true)
    }
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    })

    setIsLoading(false)
    if (error) {
      setError(t.badCode)
    } else {
      onSignedIn()
    }
  }

  if (!codeSent) {
    return (
      <form onSubmit={sendCode} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="signin-email">{t.emailLabel}</Label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={autoFocus}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading || !email.trim()}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Mail />}
          {isLoading ? t.sending : t.sendCode}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={verifyCode} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t.codeSent} <span className="font-medium text-foreground">{email}</span>
        {t.codeSentAfter}
      </p>
      <div className="space-y-2">
        <Label htmlFor="signin-code">{t.codeLabel}</Label>
        <Input
          id="signin-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="text-center text-lg tracking-[0.4em]"
          autoFocus
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading || code.length < 6}>
        {isLoading && <Loader2 className="animate-spin" />}
        {isLoading ? t.checking : t.continue}
      </Button>
      <p className="text-xs text-muted-foreground">
        {t.linkHint}{" "}
        <button
          type="button"
          className="underline underline-offset-2 hover:text-foreground"
          onClick={() => {
            setCodeSent(false)
            setCode("")
            setError(null)
          }}
        >
          {t.differentEmail}
        </button>
      </p>
    </form>
  )
}
