import type { Metadata, Viewport } from 'next'
import { AppModeProvider } from '@/app/context/AppModeContext'
import { AppShell } from '@/app/components/layout/AppShell'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nomad Pocket',
  description: 'Financial Precision — 노마드 라이프스타일 개인 가계부',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nomad Pocket',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#004ea7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <AppModeProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppModeProvider>
      </body>
    </html>
  )
}
