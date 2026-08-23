import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEstudiantePorId, eliminarEstudiante } from '@/app/actions/estudiantes'
import { agregarResponsable, registrarSancion, agregarDocumento } from '@/app/actions/expediente'
import FormularioAccion from './_components/FormularioAccion'
import SelectorDocumento from './_components/SelectorDocumento'
import ImprimirLegajoButton from './_components/ImprimirLegajoButton'

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

  // Vinculamos el ID del estudiante a las acciones de servidor
  const agregarResponsableAction = agregarResponsable.bind(null, id)
  const registrarSancionAction = registrarSancion.bind(null, id)
  const agregarDocumentoAction = agregarDocumento.bind(null, id)

  function colorTipoHistorial(tipo: string | null) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('positiv') || (t.includes('observ') && !t.includes('negativ'))) {
      return {
        badge: 'bg-cs-success-soft text-cs-green border-cs-success/20 border',
        dot: 'bg-cs-success shadow-cs-success-soft shadow-md',
        card: 'bg-cs-success-soft/30 border-cs-success/20',
      }
    }
    if (t.includes('suspens') || t.includes('amonest')) {
      return {
        badge: 'bg-cs-danger-soft text-cs-danger border-cs-danger/20 border',
        dot: 'bg-cs-danger shadow-cs-danger-soft shadow-md',
        card: 'bg-cs-danger-soft/30 border-cs-danger/20',
      }
    }
    return {
      badge: 'bg-cs-warning-soft text-cs-warning border-cs-warning/20 border',
      dot: 'bg-cs-warning shadow-cs-warning-soft shadow-md',
      card: 'bg-cs-warning-soft/20 border-cs-warning/20',
    }
  }

  return (
    <div className="printable-legajo max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <Link
            href="/estudiantes"
            className="text-sm text-cs-muted hover:text-cs-text font-semibold inline-flex items-center gap-1"
          >
            ← Volver al listado
          </Link>
          <div className="mt-3 flex items-start gap-4 flex-wrap">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cs-bg to-cs-bg-soft flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">
              {e.nombre?.[0] ?? 'A'}
              {e.apellido?.[0] ?? ''}
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-cs-text tracking-tight leading-tight">
                {e.apellido}, {e.nombre}
              </h1>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="px-3 py-1.5 bg-cs-green/10 text-cs-green text-sm font-bold rounded-lg border border-cs-green/20">
                  {e.curso} &quot;{e.division}&quot;
                </span>
                <span className="text-sm text-cs-muted font-medium">
                  🆔 DNI: {e.dni}
                </span>
                {e.email && (
                  <span className="text-sm text-cs-muted font-medium">✉️ {e.email}</span>
                )}
              </div>
              {e.direccion && (
                <p className="text-sm text-cs-muted mt-2 font-medium">📍 {e.direccion}</p>
              )}
            </div>
          </div>
        </div>
        <div className="print-hide flex gap-2">
          <ImprimirLegajoButton />
          <form
            action={async () => {
              'use server'
              await eliminarEstudiante(id)
            }}
          >
            <button
              type="submit"
              className="px-5 py-2.5 border border-cs-danger/30 text-cs-danger hover:bg-cs-danger-soft rounded-xl text-sm font-bold transition bg-cs-danger-soft/30"
            >
              🗑️ Eliminar Expediente
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {e.infoMedica && (
            <section className="bg-white rounded-3xl border border-cs-border p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-cs-border/70">
                <div className="w-11 h-11 rounded-xl bg-cs-success-soft flex items-center justify-center text-2xl">
                  🏥
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cs-text">Ficha Médica</h2>
                  <p className="text-sm text-cs-muted">Datos de salud para emergencias</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 text-sm">
                <div className="p-4 rounded-2xl bg-cs-surface-alt border border-cs-border/50">
                  <p className="text-xs uppercase tracking-wide text-cs-muted font-bold mb-1">
                    Grupo Sanguíneo
                  </p>
                  <p className="font-bold text-lg text-cs-text">
                    {e.infoMedica.grupoSanguineo || 'Sin especificar'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-cs-surface-alt border border-cs-border/50">
                  <p className="text-xs uppercase tracking-wide text-cs-muted font-bold mb-1">
                    Alergias
                  </p>
                  <p className="font-semibold text-cs-text">
                    {e.infoMedica.alergias || 'Ninguna'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-cs-surface-alt border border-cs-border/50">
                  <p className="text-xs uppercase tracking-wide text-cs-muted font-bold mb-1">
                    Medicación
                  </p>
                  <p className="font-semibold text-cs-text">
                    {e.infoMedica.medicacion || 'Ninguna'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-cs-surface-alt border border-cs-border/50">
                  <p className="text-xs uppercase tracking-wide text-cs-muted font-bold mb-1">
                    Enfermedades
                  </p>
                  <p className="font-semibold text-cs-text">
                    {e.infoMedica.enfermedades || 'Ninguna'}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-cs-surface-alt border border-cs-border/50">
                  <p className="text-xs uppercase tracking-wide text-cs-muted font-bold mb-1">
                    Problemas Cardíacos
                  </p>
                  <p className="font-semibold text-cs-text">
                    {e.infoMedica.problemasCardiacos || 'Sin antecedentes'}
                  </p>
                </div>
                {e.infoMedica.observaciones && (
                  <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-cs-surface-alt border border-cs-border/50">
                    <p className="text-xs uppercase tracking-wide text-cs-muted font-bold mb-1">
                      Observaciones
                    </p>
                    <p className="font-semibold text-cs-text">{e.infoMedica.observaciones}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-white rounded-3xl border border-cs-border p-7 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-cs-border/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cs-blue-soft flex items-center justify-center text-2xl">
                  👨‍👩‍👧
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cs-text">Responsables</h2>
                  <p className="text-sm text-cs-muted">Contactos de emergencia</p>
                </div>
              </div>
              <FormularioAccion
                titulo="+ Agregar Responsable"
                campos={[
                  { name: 'nombre', label: 'Nombre y Apellido *', required: true },
                  { name: 'dni', label: 'DNI *', required: true },
                  {
                    name: 'parentesco',
                    label: 'Parentesco *',
                    required: true,
                    placeholder: 'Padre, Madre, Tutor...',
                  },
                  { name: 'telefono', label: 'Teléfono *', required: true },
                  { name: 'email', label: 'Email', type: 'email' },
                ]}
                onSubmit={agregarResponsableAction}
                exitoMsg="Responsable agregado correctamente"
                submitText="Agregar Responsable"
              />
            </div>
            {e.responsables.length === 0 ? (
              <div className="py-10 border-2 border-dashed border-cs-border rounded-2xl text-center">
                <div className="text-4xl mb-2 opacity-40">👥</div>
                <p className="text-cs-muted font-medium">No hay responsables cargados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {e.responsables.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-cs-surface to-cs-surface-alt border border-cs-border/70 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-cs-bg/90 text-white font-bold flex items-center justify-center shadow shrink-0">
                        {(r.nombre || 'R')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-cs-text">
                          {r.nombre} {r.apellido || ''}
                        </p>
                        {r.parentesco && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-cs-blue-soft text-cs-green text-xs font-bold rounded-md">
                            {r.parentesco}
                          </span>
                        )}
                        <div className="mt-2 space-y-1 text-xs text-cs-muted font-medium">
                          {r.dni && <div>🆔 {r.dni}</div>}
                          {r.telefono && <div>📞 {r.telefono}</div>}
                          {r.email && <div className="truncate">✉️ {r.email}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-3xl border border-cs-border p-7 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-cs-border/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cs-warning-soft flex items-center justify-center text-2xl">
                  📜
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cs-text">Historial del Alumno</h2>
                  <p className="text-sm text-cs-muted">
                    Registro cronológico de trayectoria
                  </p>
                </div>
              </div>
              <FormularioAccion
                titulo="+ Registrar Evento"
                campos={[
                  {
                    name: 'tipo',
                    label: 'Tipo *',
                    required: true,
                    placeholder:
                      'Observación positiva / Amonestación / Suspensión / Apercibimiento...',
                  },
                  {
                    name: 'categoria',
                    label: 'Categoría *',
                    required: true,
                    placeholder: 'Llegada tarde, Disciplina, Conducta, Merito...',
                  },
                  { name: 'motivo', label: 'Motivo *', required: true, tipo: 'textarea' },
                  { name: 'descripcion', label: 'Descripción detallada', tipo: 'textarea' },
                ]}
                onSubmit={registrarSancionAction}
                exitoMsg="Evento registrado correctamente"
                submitText="Registrar"
              />
            </div>
            {e.historial.length === 0 ? (
              <div className="py-10 border-2 border-dashed border-cs-border rounded-2xl text-center">
                <div className="text-4xl mb-2 opacity-40">📝</div>
                <p className="text-cs-muted font-medium">
                  No hay registros en el historial.
                </p>
              </div>
            ) : (
              <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-1 before:bottom-1 before:w-0.5 before:bg-cs-border">
                {e.historial.map((h) => {
                  const color = colorTipoHistorial(h.tipo)
                  return (
                    <div key={h.id} className="relative">
                      <div
                        className={`absolute -left-6 top-5 w-5 h-5 rounded-full border-4 border-white ${color.dot}`}
                      />
                      <div
                        className={`p-5 rounded-2xl border ${color.card} shadow-sm hover:shadow-md transition`}
                      >
                        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-3 py-1 text-xs font-black rounded-full ${color.badge}`}
                            >
                              {h.tipo}
                            </span>
                            {h.categoria && (
                              <span className="px-3 py-1 text-xs font-bold rounded-full bg-cs-surface-alt text-cs-muted border border-cs-border/60">
                                {h.categoria}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-cs-muted bg-white/70 px-2.5 py-1 rounded-lg border border-cs-border/50">
                            {new Date(h.fecha).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="font-bold text-cs-text leading-snug">{h.motivo}</p>
                        {h.descripcion && (
                          <p className="text-sm text-cs-muted mt-2 leading-relaxed">
                            {h.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-3xl border border-cs-border p-7 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-cs-border/70">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cs-warning-soft flex items-center justify-center text-2xl">
                  📄
                </div>
                <div>
                  <h2 className="text-xl font-bold text-cs-text">Documentos</h2>
                  <p className="text-sm text-cs-muted">Archivos adjuntos</p>
                </div>
              </div>
              <SelectorDocumento onSubmit={agregarDocumentoAction} />
            </div>
            {e.documentos.length === 0 ? (
              <div className="py-8 border-2 border-dashed border-cs-border rounded-2xl text-center">
                <div className="text-4xl mb-2 opacity-40">📎</div>
                <p className="text-cs-muted font-medium text-sm">
                  No hay documentos cargados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {e.documentos.map((d) => (
                  <a
                    key={d.id}
                    href={d.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-2xl border border-cs-border hover:bg-cs-surface-alt transition group bg-cs-surface"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cs-bg-soft/20 flex items-center justify-center text-xl shrink-0">
                      📎
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-cs-text truncate group-hover:text-cs-green transition">
                        {d.titulo}
                      </p>
                      {d.tipo && d.tipo !== 'OTRO' && (
                        <p className="text-xs text-cs-muted mt-0.5">
                          {d.tipo === 'FICHA_MEDICA'
                            ? 'Ficha Médica'
                            : d.tipo === 'AUTORIZACION'
                              ? 'Autorización'
                              : 'Otro'}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="bg-gradient-to-br from-cs-green via-cs-green-light to-cs-green rounded-3xl p-7 text-white shadow-xl">
            <h3 className="font-extrabold text-lg mb-4 flex items-center gap-2">
              <span>⚡</span> Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <Link
                href="/sanciones/nueva"
                className="block w-full text-center py-3 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-bold transition border border-white/10 backdrop-blur-sm"
              >
                + Cargar Sanción
              </Link>
              <Link
                href="/estudiantes"
                className="block w-full text-center py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition border border-white/5"
              >
                📋 Ver todos los alumnos
              </Link>
            </div>
            <div className="mt-6 pt-5 border-t border-white/10 text-xs text-white/70">
              <div className="font-bold text-white/80 mb-1">Expediente Digital</div>
              <div>ID Alumno: {e.id.slice(0, 8)}...</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}