"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { setLocale } from "@/lib/i18n/actions"
import { useDictionary, useLocale } from "@/lib/i18n/client"
import type { Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

const OPTIONS: { locale: Locale; label: string; name: string }[] = [
  { locale: "en", label: "EN", name: "English" },
  { locale: "it", label: "IT", name: "Italiano" },
]

// Two-block EN / IT switch for the header: the current language is black
export function LanguageToggle({ className }: { className?: string }) {
  const router = useRouter()
  const current = useLocale()
  const t = useDictionary()
  const [isPending, startTransition] = useTransition()

  const choose = (locale: Locale) => {
    if (locale === current) return
    startTransition(async () => {
      await setLocale(locale)
      router.refresh()
    })
  }

  return (
    <div
      role="group"
      aria-label={t.header.language}
      className={cn("flex border-2 border-black font-mono text-sm font-bold sm:text-base", isPending && "opacity-60", className)}
    >
      {OPTIONS.map(({ locale, label, name }) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-label={name}
          aria-pressed={locale === current}
          disabled={isPending}
          onClick={() => choose(locale)}
          className={cn(
            "px-2 sm:px-3",
            locale === current ? "bg-black text-white" : "bg-white text-black hover:bg-brand-pink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
