'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Chatbot from './Chatbot'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname?.startsWith('/firmar/profesor/')) {
    return <div className="w-full">{children}</div>
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
      <Chatbot />
    </>
  )
}