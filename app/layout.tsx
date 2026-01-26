import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: 'Embassy Cinema | Intimate Film Experience',
  description: 'Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films at Embassy Cinema. Free bookings available.',
  generator: 'v0.app',
  metadataBase: new URL('https://www.embassycinema.com'),
  openGraph: {
    title: 'Embassy Cinema | Intimate Film Experience',
    description: 'Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films. Free bookings available.',
    siteName: 'Embassy Cinema',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Embassy Cinema - An intimate art deco cinema experience',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embassy Cinema | Intimate Film Experience',
    description: 'Experience cinema the way it was meant to be. Just 6 seats, one screen, and unforgettable films. Free bookings available.',
    images: ['/og-image.jpg'],
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
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
