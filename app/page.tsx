import Link from 'next/link'
import { getEstudiantes } from '@/app/actions/estudiantes'

export default async function HomePage() {
  const respuesta = await getEstudiantes()
  const estudiantes = respuesta.data || []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-sm text-cs-muted font-medium tracking-wide uppercase">Bienvenido</p>
          <h1 className="text-4xl font-extrabold text-cs-text mt-1 tracking-tight">
            Panel Principal
          </h1>
          <p className="text-cs-muted mt-2">
            Sistema de administración de expedientes y registro de alumnos.
          </p>
        </div>
        <Link
          href="/estudiantes/nuevo"
          className="bg-cs-green hover:bg-cs-green-light text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Registrar Alumno
        </Link>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/estudiantes"
          className="group relative p-7 bg-gradient-to-br from-white to-cs-surface rounded-3xl border border-cs-border shadow-sm hover:shadow-2xl transition overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cs-blue-soft/40 transition group-hover:scale-110" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-cs-blue-soft flex items-center justify-center text-2xl mb-4 shadow-sm">
              👨‍🎓
            </div>
            <h3 className="text-lg font-bold text-cs-text">Estudiantes</h3>
            <p className="text-4xl font-black text-cs-green mt-2">
              {estudiantes.length}
            </p>
            <p className="text-sm text-cs-muted mt-2">Alumnos registrados</p>
          </div>
        </Link>

        <Link
          href="/sanciones"
          className="group relative p-7 bg-gradient-to-br from-white to-cs-surface rounded-3xl border border-cs-border shadow-sm hover:shadow-2xl transition overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cs-warning-soft/40 transition group-hover:scale-110" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-cs-warning-soft flex items-center justify-center text-2xl mb-4 shadow-sm">
              📋
            </div>
            <h3 className="text-lg font-bold text-cs-text">Sanciones</h3>
            <p className="text-4xl font-black text-cs-warning mt-2">
              {estudiantes.reduce((sum, e) => sum + (e.amonestaciones?.length ?? 0) + (e.sanciones?.length ?? 0), 0)}
            </p>
            <p className="text-sm text-cs-muted mt-2">Registros de convivencia</p>
          </div>
        </Link>

        <div className="relative p-7 bg-gradient-to-br from-white to-cs-surface rounded-3xl border border-cs-border shadow-sm overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cs-success-soft/40" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-cs-success-soft flex items-center justify-center text-2xl mb-4 shadow-sm">
              🖥️
            </div>
            <h3 className="text-lg font-bold text-cs-text">Estado del Sistema</h3>
            <div className="mt-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cs-success-soft text-cs-green text-xs font-bold rounded-full border border-cs-success/30">
                <span className="w-2 h-2 rounded-full bg-cs-success animate-pulse" />
                Base de datos Conectada
              </span>
            </div>
            <p className="text-sm text-cs-muted mt-4">Modo Local · Prisma ORM</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-cs-border p-7 shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-cs-text">Últimos Alumnos Registrados</h2>
            <p className="text-sm text-cs-muted mt-1">Vista previa de la base de alumnos</p>
          </div>
          <Link
            href="/estudiantes"
            className="text-sm font-semibold text-cs-green hover:text-cs-green-light transition"
          >
            Ver todos →
          </Link>
        </div>

        {estudiantes.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed border-cs-border rounded-2xl">
            <div className="text-5xl mb-3 opacity-40">📭</div>
            <p className="text-cs-muted">Aún no hay alumnos cargados en la base de datos.</p>
          </div>
        ) : (
          <div className="divide-y divide-cs-border/70">
            {estudiantes.slice(0, 5).map((estudiante) => (
              <div
                key={estudiante.id}
                className="py-4 flex justify-between items-center transition hover:bg-cs-surface-alt/50 rounded-xl px-2"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cs-bg to-cs-bg-soft flex items-center justify-center text-white font-bold shadow-md">
                    {estudiante.nombre?.[0] ?? 'A'}
                    {estudiante.apellido?.[0] ?? ''}
                  </div>
                  <div>
                    <p className="font-semibold text-cs-text">
                      {estudiante.apellido}, {estudiante.nombre}
                    </p>
                    <p className="text-xs text-cs-muted">
                      DNI: {estudiante.dni}
                      {estudiante.email ? ` · ${estudiante.email}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1.5 bg-cs-surface-alt text-cs-text text-xs font-bold rounded-lg border border-cs-border/70">
                    {estudiante.curso} &quot;{estudiante.division}&quot;
                  </span>
                  <Link
                    href={`/estudiantes/${estudiante.id}`}
                    className="text-sm font-semibold text-cs-green hover:text-cs-green-light transition"
                  >
                    Ver expediente
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}