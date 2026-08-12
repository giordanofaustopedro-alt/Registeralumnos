import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'
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
      <body className={`${inter.className} bg-slate-100 min-h-screen flex text-slate-800`}>
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
