import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function SancionesPage() {
  // Consulta de sanciones con los datos del alumno involucrado
  const sanciones = await prisma.sancion.findMany({
    include: {
      estudiante: {
        select: {
          nombre: true,
          apellido: true,
          curso: true,
          division: true,
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  }).catch(() => [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Registro de Sanciones</h1>
          <p className="text-slate-500 mt-1">
            Gestión de amonestaciones, apercibimientos y faltas de convivencia.
          </p>
        </div>
        <Link
          href="/sanciones/nueva"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow"
        >
          + Cargar Sanción
        </Link>
      </div>

      {/* Tabla de Sanciones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {sanciones.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No hay sanciones registradas en el sistema.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Estudiante</th>
                <th className="p-4 font-semibold">Curso</th>
                <th className="p-4 font-semibold">Tipo</th>
                <th className="p-4 font-semibold">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sanciones.map((sancion) => (
                <tr key={sancion.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-600 text-sm">
                    {new Date(sancion.fecha).toLocaleDateString('es-AR')}
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {sancion.estudiante?.apellido}, {sancion.estudiante?.nombre}
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                      {sancion.estudiante?.curso} &quot;{sancion.estudiante?.division}&quot;
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                      {sancion.tipo || 'Amonestación'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm max-w-xs truncate">
                    {sancion.motivo}
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