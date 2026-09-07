
import Link from 'next/link'
import { getEstudiantes } from '@/app/actions/estudiantes'
import ImportarDesdePendrive from '@/app/components/ImportarDesdePendrive'
import SeleccionImpresion from '@/app/components/SeleccionImpresion'

export default async function EstudiantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const respuesta = await getEstudiantes(q)
  const estudiantes = respuesta.data || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-sm text-cs-muted font-medium tracking-wide uppercase">
            Administración
          </p>
          <h1 className="text-3xl font-extrabold text-cs-text mt-1">
            Listado de Estudiantes
          </h1>
          <p className="text-cs-muted mt-1">
            Gestiona los expedientes y datos de los alumnos.
          </p>
        </div>
        <Link
          href="/estudiantes/nuevo"
          className="bg-cs-green hover:bg-cs-green-light text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Nuevo Estudiante
        </Link>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-cs-border shadow-sm">
        <form method="GET" className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cs-muted">
              🔍
            </span>
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Buscar por DNI, nombre o apellido..."
              className="w-full pl-11 pr-4 py-3 border border-cs-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cs-green/40 focus:border-cs-green/60 text-cs-text bg-cs-surface"
            />
          </div>
          <button
            type="submit"
            className="bg-cs-green hover:bg-cs-green-light text-white px-6 py-3 rounded-xl transition font-semibold shadow-sm"
          >
            Buscar
          </button>
          {q && (
            <Link
              href="/estudiantes"
              className="px-6 py-3 rounded-xl border border-cs-border text-cs-muted hover:text-cs-text font-semibold transition bg-cs-surface"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImportarDesdePendrive />
        <SeleccionImpresion estudiantes={estudiantes.map(({ id, nombre, apellido, dni, curso }) => ({ id, nombre, apellido, dni, curso: curso || undefined }))} />
      </div>

      <div className="bg-white rounded-2xl border border-cs-border shadow-sm overflow-hidden">
        {estudiantes.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="text-6xl mb-4 opacity-30">📚</div>
            <p className="text-xl font-bold text-cs-text mb-1">Sin resultados</p>
            <p className="text-cs-muted">
              {q ? 'Prueba con otros términos de búsqueda.' : 'No se encontraron estudiantes registrados.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between px-6 py-4 bg-cs-surface-alt border-b border-cs-border">
              <p className="text-sm text-cs-muted">
                <span className="font-bold text-cs-text">{estudiantes.length}</span> alumno
                {estudiantes.length === 1 ? '' : 's'} encontrado
                {estudiantes.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-cs-surface-alt border-b border-cs-border text-cs-muted text-sm">
                    <th className="p-5 font-bold text-cs-text">Apellido y Nombre</th>
                    <th className="p-5 font-bold text-cs-text">DNI</th>
                    <th className="p-5 font-bold text-cs-text">Curso</th>
                    <th className="p-5 font-bold text-cs-text text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cs-border/60">
                  {estudiantes.map((estudiante) => (
                    <tr
                      key={estudiante.id}
                      className="hover:bg-cs-surface-alt/50 transition"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cs-bg to-cs-bg-soft flex items-center justify-center text-white text-sm font-bold shadow">
                            {estudiante.nombre?.[0] ?? 'A'}
                            {estudiante.apellido?.[0] ?? ''}
                          </div>
                          <div>
                            <p className="font-semibold text-cs-text">
                              {estudiante.apellido}, {estudiante.nombre}
                            </p>
                            {estudiante.email && (
                              <p className="text-xs text-cs-muted">{estudiante.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-cs-text font-medium">{estudiante.dni}</td>
                      <td className="p-5">
                        <span className="px-3 py-1.5 bg-cs-surface-alt text-cs-text text-xs font-bold rounded-lg border border-cs-border/70">
                          {estudiante.curso} &quot;{estudiante.division}&quot;
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <Link
                          href={`/estudiantes/${estudiante.id}`}
                          className="inline-flex items-center gap-1 text-cs-green hover:text-cs-green-light font-semibold text-sm"
                        >
                          Ver expediente →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
