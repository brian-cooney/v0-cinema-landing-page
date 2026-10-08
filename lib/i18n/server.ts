import { cache } from "react"
import { cookies, headers } from "next/headers"
import { dictionaries } from "./dictionaries"
import { isLocale, localeFromAcceptLanguage, LOCALE_COOKIE, type Locale } from "./config"

// The guest's choice from the EN / IT toggle, else their device language
export const getLocale = cache(async (): Promise<Locale> => {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value
  if (isLocale(chosen)) return chosen
  return localeFromAcceptLanguage((await headers()).get("accept-language"))
})

export async function getDictionary() {
  return dictionaries[await getLocale()]
}
