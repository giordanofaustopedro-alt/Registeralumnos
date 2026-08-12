import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEstudiantePorId, eliminarEstudiante } from '@/app/actions/estudiantes'
import { agregarResponsable, registrarSancion, agregarDocumento } from '@/app/actions/expediente'
import FormularioAccion from './_components/FormularioAccion'

export default async function ExpedienteEstudiantePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const respuesta = await getEstudiantePorId(id)

  if (!respuesta.success || !respuesta.data) {
    notFound()
  }

  const e = respuesta.data

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/estudiantes" className="text-sm text-blue-600 hover:underline font-medium">
            ← Volver al listado
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {e.apellido}, {e.nombre}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
              {e.curso} &quot;{e.division}&quot;
            </span>
            <span className="text-sm text-slate-500">DNI: {e.dni}</span>
            {e.email && <span className="text-sm text-slate-500">✉️ {e.email}</span>}
          </div>
          {e.direccion && <p className="text-sm text-slate-500 mt-1">📍 {e.direccion}</p>}
        </div>
        <div className="flex gap-2">
          <form action={async () => {
            'use server'
            await eliminarEstudiante(id)
          }}>
            <button
              type="submit"
              className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition"
            >
              🗑️ Eliminar
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {e.infoMedica && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>🏥</span> Ficha Médica
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Grupo Sanguíneo</p>
                  <p className="font-semibold text-slate-800">{e.infoMedica.grupoSanguineo || 'Sin especificar'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Alergias</p>
                  <p className="font-semibold text-slate-800">{e.infoMedica.alergias || 'Ninguna'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Medicación</p>
                  <p className="font-semibold text-slate-800">{e.infoMedica.medicacion || 'Ninguna'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Enfermedades</p>
                  <p className="font-semibold text-slate-800">{e.infoMedica.enfermedades || 'Ninguna'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Problemas Cardíacos</p>
                  <p className="font-semibold text-slate-800">{e.infoMedica.problemasCardiacos || 'Sin antecedentes'}</p>
                </div>
                {e.infoMedica.observaciones && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Observaciones</p>
                    <p className="font-semibold text-slate-800">{e.infoMedica.observaciones}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>👨‍👩‍👧</span> Responsables
              </h2>
              <FormularioAccion
                titulo="+ Agregar Responsable"
                campos={[
                  { name: 'nombre', label: 'Nombre y Apellido *', required: true },
                  { name: 'dni', label: 'DNI *', required: true },
                  { name: 'parentesco', label: 'Parentesco *', required: true, placeholder: 'Padre, Madre, Tutor...' },
                  { name: 'telefono', label: 'Teléfono *', required: true },
                  { name: 'email', label: 'Email', type: 'email' },
                ]}
                onSubmit={async (data) => agregarResponsable(id, data)}
                exitoMsg="Responsable agregado correctamente"
                submitText="Agregar Responsable"
              />
            </div>
            {e.responsables.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 border border-dashed border-slate-200 rounded-xl text-center">
                No hay responsables cargados.
              </p>
            ) : (
              <div className="space-y-3">
                {e.responsables.map(r => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800">{r.nombre} {r.apellido || ''}</p>
                        <div className="flex gap-4 mt-1 text-xs text-slate-500 flex-wrap">
                          {r.parentesco && <span>👨‍👩‍👦 {r.parentesco}</span>}
                          {r.dni && <span>🆔 {r.dni}</span>}
                          {r.telefono && <span>📞 {r.telefono}</span>}
                          {r.email && <span>✉️ {r.email}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>📜</span> Historial del Alumno
              </h2>
              <FormularioAccion
                titulo="+ Registrar Sanción"
                campos={[
                  { name: 'tipo', label: 'Tipo *', required: true, placeholder: 'Amonestación, Apercibimiento, Suspensión...' },
                  { name: 'categoria', label: 'Categoría *', required: true, placeholder: 'Llegada tarde, Disciplina, Conducta...' },
                  { name: 'motivo', label: 'Motivo *', required: true, tipo: 'textarea' as const },
                  { name: 'descripcion', label: 'Descripción detallada', tipo: 'textarea' as const },
                ]}
                onSubmit={async (data) => registrarSancion(id, data)}
                exitoMsg="Sanción registrada correctamente"
                submitText="Registrar Sanción"
                color="red"
              />
            </div>
            {e.historial.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 border border-dashed border-slate-200 rounded-xl text-center">
                No hay registros en el historial.
              </p>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-1 before:bottom-1 before:w-0.5 before:bg-slate-200">
                {e.historial.map((h) => (
                  <div key={h.id} className="relative">
                    <div className={`absolute -left-[22px] top-1 w-4 h-4 rounded-full border-4 border-white ${
                      h.tipo?.toLowerCase().includes('positiv') || h.tipo?.toLowerCase().includes('observ') && !h.tipo?.toLowerCase().includes('negativ')
                        ? 'bg-emerald-500 shadow-emerald-200 shadow'
                        : h.tipo?.toLowerCase().includes('suspens') || h.tipo?.toLowerCase().includes('amonest')
                        ? 'bg-red-500 shadow-red-200 shadow'
                        : 'bg-amber-500 shadow-amber-200 shadow'
                    }`} />
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            h.tipo?.toLowerCase().includes('positiv') || (h.tipo?.toLowerCase().includes('observ') && !h.tipo?.toLowerCase().includes('negativ'))
                              ? 'bg-emerald-100 text-emerald-700'
                              : h.tipo?.toLowerCase().includes('suspens') || h.tipo?.toLowerCase().includes('amonest')
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {h.tipo}
                          </span>
                          {h.categoria && (
                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
                              {h.categoria}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(h.fecha).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{h.motivo}</p>
                      {h.descripcion && (
                        <p className="text-sm text-slate-500 mt-1">{h.descripcion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>📄</span> Documentos
              </h2>
              <FormularioAccion
                titulo="+ Subir"
                campos={[
                  { name: 'titulo', label: 'Título *', required: true, placeholder: 'Ej: Ficha Médica 2026' },
                  { name: 'archivoUrl', label: 'URL del archivo *', required: true, placeholder: 'https://...' },
                ]}
                onSubmit={async (data) => agregarDocumento(id, data)}
                exitoMsg="Documento agregado correctamente"
                submitText="Agregar Documento"
              />
            </div>
            {e.documentos.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 border border-dashed border-slate-200 rounded-xl text-center">
                No hay documentos cargados.
              </p>
            ) : (
              <div className="space-y-2">
                {e.documentos.map(d => (
                  <a
                    key={d.id}
                    href={d.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition group"
                  >
                    <span className="text-2xl">📎</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition">
                        {d.titulo}
                      </p>
                      {d.tipo && d.tipo !== 'OTRO' && (
                        <p className="text-xs text-slate-500">
                          {d.tipo === 'FICHA_MEDICA' ? 'Ficha Médica' : d.tipo === 'AUTORIZACION' ? 'Autorización' : 'Otro'}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>⚡</span> Acciones Rápidas
            </h3>
            <div className="space-y-2">
              <Link
                href="/sanciones/nueva"
                className="block w-full text-center py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition"
              >
                + Cargar Sanción
              </Link>
              <Link
                href="/estudiantes"
                className="block w-full text-center py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition"
              >
                📋 Ver todos los alumnos
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
