import Link from 'next/link'
import { getEstudiantes } from '@/app/actions/estudiantes'

export default async function HomePage() {
  // Consultamos los alumnos registrados directamente desde el servidor
  const respuesta = await getEstudiantes()
  const estudiantes = respuesta.data || []

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Encabezado */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel Principal</h1>
          <p className="text-slate-500 mt-1">Bienvenido al sistema de administración de alumnos.</p>
        </div>
        <Link
          href="/estudiantes/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow flex items-center gap-2"
        >
          <span>+</span> Registrar Alumno
        </Link>
      </header>

      {/* Tarjetas de Accesos Rápidos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/estudiantes"
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group"
        >
          <div className="text-3xl mb-3">👨‍🎓</div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition">
            Estudiantes
          </h3>
          <p className="text-2xl font-black text-slate-900 mt-2">{estudiantes.length}</p>
          <p className="text-xs text-slate-500 mt-1">Alumnos registrados en el sistema</p>
        </Link>

        <Link
          href="/sanciones"
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group"
        >
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition">
            Sanciones y Faltas
          </h3>
          <p className="text-2xl font-black text-slate-900 mt-2">0</p>
          <p className="text-xs text-slate-500 mt-1">Registros de convivencia cargados</p>
        </Link>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-3xl mb-3">🖥️</div>
          <h3 className="text-lg font-bold text-slate-800">Estado del Sistema</h3>
          <span className="inline-block mt-3 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            ● Base de datos Conectada
          </span>
        </div>
      </section>

      {/* Vista previa de Alumnos Recientes */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Últimos Alumnos Registrados</h2>
          <Link href="/estudiantes" className="text-sm text-blue-600 hover:underline font-medium">
            Ver todos →
          </Link>
        </div>

        {estudiantes.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-400">Aún no hay alumnos cargados en la base de datos.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {estudiantes.slice(0, 5).map((estudiante) => (
              <div key={estudiante.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">
                    {estudiante.apellido}, {estudiante.nombre}
                  </p>
                  <p className="text-xs text-slate-500">DNI: {estudiante.dni}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                    {estudiante.curso} "{estudiante.division}"
                  </span>
                  <Link
                    href={`/estudiantes/${estudiante.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
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