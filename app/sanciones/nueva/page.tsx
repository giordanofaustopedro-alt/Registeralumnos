'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getEstudiantes } from '@/app/actions/estudiantes'
import { registrarSancion } from '@/app/actions/expediente'

export default function NuevaSancionPage() {
  const router = useRouter()
  const [estudiantes, setEstudiantes] = useState<
    Array<{
      id: string
      apellido: string | null
      nombre: string | null
      dni: string | null
      curso: string | null
      division: string | null
    }>
  >([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    getEstudiantes().then((r) => {
      setEstudiantes(r.data || [])
      setCargandoLista(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    setExito(false)

    const formData = new FormData(e.currentTarget)
    const estudianteId = String(formData.get('estudianteId') || '')
    const data = {
      tipo: String(formData.get('tipo') || ''),
      categoria: String(formData.get('categoria') || ''),
      motivo: String(formData.get('motivo') || ''),
      descripcion: String(formData.get('descripcion') || ''),
    }

    try {
      const resultado = await registrarSancion(estudianteId, data)
      if (!resultado.success) {
        setError(resultado.error || 'Error al registrar la sanción')
        return
      }

      setExito(true)
      ;(e.currentTarget as HTMLFormElement).reset()

      setTimeout(() => {
        router.push('/sanciones')
        router.refresh()
      }, 1200)
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const tipos = [
    'Amonestación',
    'Apercibimiento',
    'Suspensión',
    'Llamado a padres',
    'Observación',
  ]
  const categorias = [
    'Llegada tarde',
    'Disciplina',
    'Conducta',
    'Falta de asistencia',
    'Uso indebido de tecnología',
    'Incumplimiento de tareas',
    'Otro',
  ]

  const inputCls =
    'w-full px-4 py-3 border border-cs-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cs-danger/30 focus:border-cs-danger/50 bg-cs-surface text-cs-text placeholder-cs-muted'
  const labelCls = 'block text-sm font-bold text-cs-text mb-2'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <Link
            href="/sanciones"
            className="text-sm text-cs-muted hover:text-cs-text font-bold inline-flex items-center gap-1"
          >
            ← Volver al registro
          </Link>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <div className="w-14 h-14 rounded-2xl bg-cs-danger-soft flex items-center justify-center text-3xl shadow">
              ⚠️
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-cs-text tracking-tight">
                Cargar Nueva Sanción
              </h1>
              <p className="text-cs-muted mt-1">
                Registre una amonestación, apercibimiento o nota de convivencia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-cs-danger-soft/70 border border-cs-danger/30 text-cs-danger rounded-2xl text-sm font-bold shadow-sm">
          ⚠️ {error}
        </div>
      )}
      {exito && (
        <div className="p-4 bg-cs-success-soft border border-cs-success/30 text-cs-green rounded-2xl text-sm font-bold shadow-sm">
          ✓ Sanción registrada correctamente. Redirigiendo...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-cs-border p-7 shadow-lg space-y-5"
      >
        <div>
          <label className={labelCls}>Estudiante *</label>
          {cargandoLista ? (
            <div className="w-full px-4 py-3 border border-cs-border rounded-xl bg-cs-surface-alt text-cs-muted font-medium">
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-cs-muted/40 border-t-cs-muted animate-spin" />
                Cargando estudiantes...
              </span>
            </div>
          ) : estudiantes.length === 0 ? (
            <div className="p-4 border border-dashed border-cs-border rounded-xl bg-cs-surface-alt text-cs-muted text-sm font-medium text-center">
              📭 No hay estudiantes cargados. Regístralos primero desde{' '}
              <Link
                href="/estudiantes/nuevo"
                className="text-cs-green font-bold underline"
              >
                aquí
              </Link>
              .
            </div>
          ) : (
            <select name="estudianteId" required className={inputCls}>
              <option value="">Seleccione un estudiante...</option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.apellido}, {e.nombre} — DNI: {e.dni} — {e.curso} &quot;{e.division}&quot;
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Tipo de Sanción *</label>
            <select name="tipo" required className={inputCls}>
              <option value="">Seleccione...</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Categoría *</label>
            <select name="categoria" required className={inputCls}>
              <option value="">Seleccione...</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Motivo *</label>
          <input
            name="motivo"
            required
            placeholder="Descripción breve del hecho"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Descripción Detallada</label>
          <textarea
            name="descripcion"
            rows={4}
            placeholder="Contexto, diálogos, medidas tomadas, comunicado a padres, etc."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 flex-wrap border-t border-cs-border/60 mt-2">
          <Link
            href="/sanciones"
            className="px-6 py-3 border border-cs-border rounded-xl font-bold text-cs-text hover:bg-cs-surface-alt transition bg-cs-surface"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={cargando || estudiantes.length === 0}
            className="px-8 py-3 bg-cs-danger hover:bg-cs-danger/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Guardando...
              </>
            ) : (
              <>✓ Registrar Sanción</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
