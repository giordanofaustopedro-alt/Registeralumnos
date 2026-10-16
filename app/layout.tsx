import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppShell from './components/AppShell'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestión Escolar',
  description: 'Sistema de administración de expedientes de estudiantes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} bg-cs-surface min-h-screen flex text-cs-text antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
