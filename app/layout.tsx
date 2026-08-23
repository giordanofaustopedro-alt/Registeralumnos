import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'
import Chatbot from './components/Chatbot'
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
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        <Chatbot />
      </body>
    </html>
  )
}
