import { getCursos, sembrarCursos, eliminarCurso } from '@/app/actions/cursos'
import Link from 'next/link'

export default async function CursosPage() {
  const respuesta = await getCursos()
  const cursos = respuesta.data || []

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            🏫 Gestión de Cursos y Divisiones
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administración del Ciclo Básico y Ciclo Orientado (1° a 6° Año)
          </p>
        </div>

        {cursos.length === 0 && (
          <form
            action={async () => {
              'use server'
              await sembrarCursos()
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md transition duration-200"
            >
              <span>⚡</span> Generar Cursos (1° a 6°)
            </button>
          </form>
        )}
      </div>

      {/* Estado Vacío */}
      {cursos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border-2 border-dashed border-gray-300 rounded-3xl text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-4">
            📚
          </div>
          <h3 className="text-lg font-bold text-gray-900">No hay cursos registrados</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1 mb-6">
            Para organizar a los estudiantes por división y especialidad, haz clic en el botón para inicializar la estructura escolar.
          </p>
        </div>
      ) : (
        /* Grilla de Cursos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => {
            const esHumanidades = curso.especialidad === 'HUMANIDADES'
            const esInformatica = curso.especialidad === 'INFORMATICA'

            return (
              <div
                key={curso.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Cabecera de la tarjeta */}
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">
                        {curso.anio}° &quot;{curso.division}&quot;
                      </h2>
                      <span
                        className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          esHumanidades
                            ? 'bg-amber-100 text-amber-800'
                            : esInformatica
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {esHumanidades
                          ? '📖 Humanidades'
                          : esInformatica
                          ? '💻 Informática'
                          : '🌱 Ciclo Básico'}
                      </span>
                    </div>

                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                      {curso.estudiantes.length} Alumnos
                    </span>
                  </div>
                </div>

                {/* Lista de Alumnos */}
                <div className="p-5 flex-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Estudiantes Inscriptos
                  </h4>

                  {curso.estudiantes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400 italic bg-gray-50 rounded-xl">
                      Sin alumnos asignados
                    </div>
                  ) : (
                    <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {curso.estudiantes.map((est) => (
                        <li key={est.id}>
                          <Link
                            href={`/estudiantes/${est.id}`}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group transition duration-150"
                          >
                            <span className="text-xs font-medium text-gray-700 group-hover:text-indigo-600">
                              {est.apellido}, {est.nombre}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              DNI {est.dni}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Pie de Tarjeta / Acciones */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-mono text-[11px]">ID: {curso.id.slice(0, 8)}</span>

                  <form
                    action={async () => {
                      'use server'
                      await eliminarCurso(curso.id)
                    }}
                  >
                    <button
                      type="submit"
                      className="text-red-500 hover:text-red-700 font-semibold text-[11px] hover:underline"
                    >
                      Eliminar Curso
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}