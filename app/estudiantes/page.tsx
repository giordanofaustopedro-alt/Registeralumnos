import Link from 'next/link'
import { getEstudiantes } from '@/app/actions/estudiantes'

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
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Listado de Estudiantes</h1>
          <p className="text-slate-500 mt-1">
            Administra los expedientes y datos de los alumnos.
          </p>
        </div>
        <Link
          href="/estudiantes/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow"
        >
          + Nuevo Estudiante
        </Link>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="Buscar por DNI, nombre o apellido..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl transition font-medium"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Tabla de Alumnos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {estudiantes.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No se encontraron estudiantes registrados.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">Apellido y Nombre</th>
                <th className="p-4 font-semibold">DNI</th>
                <th className="p-4 font-semibold">Curso</th>
                <th className="p-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-slate-800">
                    {estudiante.apellido}, {estudiante.nombre}
                  </td>
                  <td className="p-4 text-slate-600">{estudiante.dni}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                      {estudiante.curso} "{estudiante.division}"
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/estudiantes/${estudiante.id}`}
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      Ver expediente
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}