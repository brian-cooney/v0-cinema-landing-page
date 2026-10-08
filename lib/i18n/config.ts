export const LOCALES = ["en", "it"] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

// Set by the EN / IT toggle; when absent we follow the device language
export const LOCALE_COOKIE = "lang"

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}

// Pick the first supported language from an Accept-Language header,
// e.g. "it-IT,it;q=0.9,en;q=0.8" -> "it"
export function localeFromAcceptLanguage(header: string | null): Locale {
  const preferences = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
      return { language: tag.toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) : 1 }
    })
    .filter((p) => p.q > 0)
    .sort((a, b) => b.q - a.q)

  return preferences.map((p) => p.language).find(isLocale) ?? DEFAULT_LOCALE
}
