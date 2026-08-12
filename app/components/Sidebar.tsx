import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-xl font-bold">
            GE
          </div>
          <span className="font-bold text-lg tracking-wide">Gestión Escolar</span>
        </div>

        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/20 text-blue-400 font-medium transition hover:bg-blue-600/30"
          >
            <span>🏠</span> Inicio
          </Link>

          <Link
            href="/estudiantes"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-medium transition hover:bg-slate-800 hover:text-slate-200"
          >
            <span>👨‍🎓</span> Estudiantes
          </Link>

          <Link
            href="/sanciones"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-medium transition hover:bg-slate-800 hover:text-slate-200"
          >
            <span>📋</span> Sanciones
          </Link>
        </nav>
      </div>

      <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
        Sistema v1.0 — Modo Local
      </div>
    </aside>
  )
}