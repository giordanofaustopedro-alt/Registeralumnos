'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NavLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  const pathname = usePathname()
  
  // Lógica para detectar ruta activa (evita que '/' quede activo en todas las pantallas)
  const activo =
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
        activo
          ? 'bg-cs-bg-soft/30 text-white shadow-inner font-bold'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="text-lg">{icon}</span> {label}
    </Link>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-cs-green to-cs-green-light text-white min-h-screen p-6 flex flex-col justify-between shadow-xl">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-cs-bg flex items-center justify-center text-white text-xl font-black shadow-lg">
            GE
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg tracking-wide">Gestión Escolar</span>
            <span className="text-xs text-white/60">Registro de Alumnos</span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink href="/" icon="🏠" label="Inicio" />
          <NavLink href="/estudiantes" icon="👨‍🎓" label="Estudiantes" />
          <NavLink href="/cursos" icon="🏫" label="Cursos" />
          <NavLink href="/sanciones" icon="📋" label="Sanciones" />
        </nav>
      </div>

      <div className="text-xs text-white/50 border-t border-white/10 pt-4 space-y-1">
        <div className="font-semibold text-white/70">Sistema v1.0</div>
        <div>Modo Local · TP4</div>
      </div>
    </aside>
  )
}