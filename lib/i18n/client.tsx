"use client"

import { createContext, useContext } from "react"
import { dictionaries } from "./dictionaries"
import { DEFAULT_LOCALE, type Locale } from "./config"

// The root layout resolves the locale on the server and hands it down here,
// so client components render in the same language as the page around them
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function useDictionary() {
  return dictionaries[useLocale()]
}
