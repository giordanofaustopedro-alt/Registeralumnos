'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getEstudiantes } from '@/app/actions/estudiantes'
import { registrarSancion } from '@/app/actions/expediente'

export default function NuevaSancionPage() {
  const router = useRouter()
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    getEstudiantes().then(r => {
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
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const tipos = ['Amonestación', 'Apercibimiento', 'Suspensión', 'Llamado a padres', 'Observación']
  const categorias = ['Llegada tarde', 'Disciplina', 'Conducta', 'Falta de asistencia', 'Uso indebido de tecnología', 'Incumplimiento de tareas', 'Otro']

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/sanciones" className="text-sm text-blue-600 hover:underline font-medium">
            ← Volver al registro
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Cargar Nueva Sanción</h1>
          <p className="text-slate-500 mt-1">
            Registre una amonestación, apercibimiento o nota de convivencia.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}
      {exito && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
          ✓ Sanción registrada correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Estudiante *
          </label>
          {cargandoLista ? (
            <div className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-400">
              Cargando estudiantes...
            </div>
          ) : (
            <select
              name="estudianteId"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Seleccione un estudiante...</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>
                  {e.apellido}, {e.nombre} — DNI: {e.dni} — {e.curso} "{e.division}"
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Sanción *
            </label>
            <select
              name="tipo"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Seleccione...</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Categoría *
            </label>
            <select
              name="categoria"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Seleccione...</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Motivo *
          </label>
          <input
            name="motivo"
            required
            placeholder="Descripción breve del hecho"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descripción Detallada
          </label>
          <textarea
            name="descripcion"
            rows={4}
            placeholder="Contexto, diálogos, medidas tomadas, comunicado a padres, etc."
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Link
            href="/sanciones"
            className="px-6 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={cargando}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium rounded-xl transition shadow-sm hover:shadow flex items-center gap-2"
          >
            {cargando ? 'Guardando...' : '✓ Registrar Sanción'}
          </button>
        </div>
      </form>
    </div>
  )
}
