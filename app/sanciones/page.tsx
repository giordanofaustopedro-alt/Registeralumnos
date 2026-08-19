import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function SancionesPage() {
  // Ejecutamos las consultas en paralelo directo en PostgreSQL para máxima velocidad
  const [sanciones, totalSanciones, totalSuspensiones, totalAmonestaciones] = await Promise.all([
    // 1. Obtener solo las últimas 50 sanciones
    prisma.sancion.findMany({
      take: 50,
      select: {
        id: true,
        fecha: true,
        tipo: true,
        motivo: true,
        categoria: true,
        estudiante: {
          select: {
            id: true,
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
    }).catch(() => []),

    // 2. Conteo total de registros
    prisma.sancion.count().catch(() => 0),

    // 3. Conteo rápido de suspensiones
    prisma.sancion.count({
      where: {
        tipo: { contains: 'suspens', mode: 'insensitive' },
      },
    }).catch(() => 0),

    // 4. Conteo rápido de amonestaciones
    prisma.sancion.count({
      where: {
        tipo: { contains: 'amonest', mode: 'insensitive' },
      },
    }).catch(() => 0),
  ])

  function coloresTipo(tipo: string | null) {
    const t = (tipo || '').toLowerCase()
    if (t.includes('suspens')) {
      return {
        badge: 'bg-cs-danger-soft text-cs-danger border border-cs-danger/20',
        dot: 'bg-cs-danger',
      }
    }
    if (t.includes('amonest')) {
      return {
        badge: 'bg-cs-warning-soft text-cs-warning border border-cs-warning/20',
        dot: 'bg-cs-warning',
      }
    }
    if (t.includes('apercib') || t.includes('llamado')) {
      return {
        badge: 'bg-cs-blue-soft text-cs-green border border-cs-green/20',
        dot: 'bg-cs-green',
      }
    }
    return {
      badge: 'bg-cs-surface-alt text-cs-text border border-cs-border/70',
      dot: 'bg-cs-muted',
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-sm text-cs-muted font-medium tracking-wide uppercase">
            Convivencia
          </p>
          <h1 className="text-4xl font-extrabold text-cs-text mt-1 tracking-tight">
            Registro de Sanciones
          </h1>
          <p className="text-cs-muted mt-1">
            Gestión de amonestaciones, apercibimientos y faltas de convivencia.
          </p>
        </div>
        <Link
          href="/sanciones/nueva"
          className="bg-cs-danger hover:bg-cs-danger/90 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Cargar Sanción
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="relative p-6 bg-gradient-to-br from-white to-cs-surface rounded-3xl border border-cs-border shadow-sm overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cs-warning-soft/40" />
          <div className="relative">
            <p className="text-sm font-bold text-cs-muted uppercase tracking-wide">
              Total registradas
            </p>
            <p className="text-4xl font-black text-cs-text mt-2">{totalSanciones}</p>
            <p className="text-xs text-cs-muted mt-2 font-medium">Registros históricos</p>
          </div>
        </div>

        <div className="relative p-6 bg-gradient-to-br from-white to-cs-surface rounded-3xl border border-cs-border shadow-sm overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cs-danger-soft/40" />
          <div className="relative">
            <p className="text-sm font-bold text-cs-danger uppercase tracking-wide">
              Suspensiones
            </p>
            <p className="text-4xl font-black text-cs-danger mt-2">{totalSuspensiones}</p>
            <p className="text-xs text-cs-muted mt-2 font-medium">Medidas disciplinarias</p>
          </div>
        </div>

        <div className="relative p-6 bg-gradient-to-br from-white to-cs-surface rounded-3xl border border-cs-border shadow-sm overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-cs-blue-soft/40" />
          <div className="relative">
            <p className="text-sm font-bold text-cs-warning uppercase tracking-wide">
              Amonestaciones
            </p>
            <p className="text-4xl font-black text-cs-warning mt-2">{totalAmonestaciones}</p>
            <p className="text-xs text-cs-muted mt-2 font-medium">Llamados de atención</p>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-3xl border border-cs-border shadow-sm overflow-hidden">
        {sanciones.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="text-7xl mb-5 opacity-30">📭</div>
            <p className="text-2xl font-extrabold text-cs-text mb-1">Sin Registros</p>
            <p className="text-cs-muted">
              No hay sanciones registradas en el sistema.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center justify-between px-7 py-4 bg-cs-surface-alt border-b border-cs-border">
              <p className="text-sm text-cs-muted">
                Mostrando <span className="font-black text-cs-text">{sanciones.length}</span> de{' '}
                <span className="font-black text-cs-text">{totalSanciones}</span> registros
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="bg-cs-surface-alt border-b border-cs-border text-cs-muted text-sm">
                    <th className="px-6 py-4 font-bold text-cs-text">Fecha</th>
                    <th className="px-6 py-4 font-bold text-cs-text">Estudiante</th>
                    <th className="px-6 py-4 font-bold text-cs-text">Curso</th>
                    <th className="px-6 py-4 font-bold text-cs-text">Tipo</th>
                    <th className="px-6 py-4 font-bold text-cs-text">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cs-border/60">
                  {sanciones.map((sancion) => {
                    const c = coloresTipo(sancion.tipo)
                    return (
                      <tr
                        key={sancion.id}
                        className="hover:bg-cs-surface-alt/60 transition"
                      >
                        <td className="px-6 py-5 text-cs-text text-sm font-semibold whitespace-nowrap">
                          {new Date(sancion.fecha).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-5">
                          {sancion.estudiante ? (
                            <Link
                              href={`/estudiantes/${sancion.estudiante.id}`}
                              className="flex items-center gap-3 group"
                            >
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cs-bg to-cs-bg-soft text-white text-xs font-bold flex items-center justify-center shadow">
                                {(sancion.estudiante.nombre || 'A')[0]}
                                {(sancion.estudiante.apellido || '')[0]}
                              </div>
                              <span className="font-bold text-cs-text group-hover:text-cs-green transition">
                                {sancion.estudiante.apellido}, {sancion.estudiante.nombre}
                              </span>
                            </Link>
                          ) : (
                            <span className="font-semibold text-cs-muted">
                              Alumno eliminado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1.5 bg-cs-surface-alt text-cs-text text-xs font-bold rounded-lg border border-cs-border/70 whitespace-nowrap">
                            {sancion.estudiante?.curso} &quot;{sancion.estudiante?.division}&quot;
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-black rounded-lg whitespace-nowrap ${c.badge}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                            {sancion.tipo || 'Amonestación'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-cs-text text-sm max-w-xs">
                          <div className="truncate" title={sancion.motivo || ''}>
                            {sancion.motivo || <span className="text-cs-muted">—</span>}
                          </div>
                          {sancion.categoria && (
                            <div className="text-xs text-cs-muted mt-1 font-semibold">
                              {sancion.categoria}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}