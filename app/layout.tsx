import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Polymarket MM Dashboard',
  description: 'Monitor your Polymarket market maker bot — positions, rewards, P&L',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
