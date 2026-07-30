import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import { Providers } from './providers'
import { SiteShell } from '@/components/site-shell'
import Chatbot from '@/components/chatbot'

export const metadata: Metadata = {
  title: 'ServEase - Book Trusted Home Services in Minutes',
  description: 'Book trusted home services instantly. Electricians, plumbers, cleaners, and more.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-secondary-50">
        <Providers>
          <SiteShell>{children}</SiteShell>
          <Chatbot />
        </Providers>
      </body>
    </html>
  )
}
