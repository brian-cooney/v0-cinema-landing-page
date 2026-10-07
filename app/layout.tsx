import React from "react"
import type { Metadata, Viewport } from 'next'
import { Archivo, IBM_Plex_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Archivo stands in for the heavy grotesk of the zine look, IBM Plex Mono for
// captions, and Playfair only for the stacked logo block
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"] })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-plex-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: 'Embassy Cinema | Intimate Film Experience',
  description: 'Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films at Embassy Cinema. Free bookings available.',
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
    title: 'Embassy Cinema | Intimate Film Experience',
    description: 'Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films. Free bookings available.',
    siteName: 'Embassy Cinema',
    url: 'https://www.embassycinema.com',
    images: [
      {
        url: 'https://www.embassycinema.com/hero-cinema.webp',
        width: 1200,
        height: 630,
        alt: 'Embassy Cinema - An intimate art deco cinema experience',
        type: 'image/webp',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embassy Cinema | Intimate Film Experience',
    description: 'Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films. Free bookings available.',
    images: ['https://www.embassycinema.com/hero-cinema.webp'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable} ${playfair.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
