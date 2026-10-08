import React from "react"
import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LocaleProvider } from '@/lib/i18n/client'
import { dictionaries } from '@/lib/i18n/dictionaries'
import { getLocale } from '@/lib/i18n/server'

// Archivo stands in for the heavy grotesk of the zine look, IBM Plex Mono for
// captions, and Playfair only for the stacked logo block
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"] })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-plex-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-playfair" })

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const { meta } = dictionaries[locale]
  return {
    title: meta.title,
    description: meta.description,
    generator: 'v0.app',
    metadataBase: new URL('https://www.embassycinema.com'),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.shareDescription,
      siteName: 'Embassy Cinema',
      url: 'https://www.embassycinema.com',
      locale: locale === 'it' ? 'it_IT' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.shareDescription,
    },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale} className={`${archivo.variable} ${plexMono.variable} ${playfair.variable}`}>
      <body className={`font-sans antialiased`}>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
