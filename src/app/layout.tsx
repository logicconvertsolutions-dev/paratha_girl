import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Paratha Girl — Fresh From Our Kitchen',
  description:
    'Handcrafted parathas made fresh to order, delivered within 7km in Toronto.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon:          '/images/Logo.png',
    shortcut:      '/images/Logo.png',
    apple:         '/images/Logo.png',
  },
  openGraph: {
    title: 'Paratha Girl',
    description: 'Handcrafted parathas. Home-cooked. Delivered fresh.',
    images: ['/og-image.jpg'],
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paratha Girl',
    description: 'Handcrafted parathas. Home-cooked. Delivered fresh.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-ivory text-ink antialiased">{children}</body>
    </html>
  )
}
