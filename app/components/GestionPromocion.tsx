'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Curso = { id: string; anio: number; division: string; estudiantes: Array<{ id: string; nombre: string; apellido: string }> }

type Props = { cursos: Curso[] }

export default function GestionPromocion({ cursos }: Props) {
  const router = useRouter()
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [nuevoCursoId, setNuevoCursoId] = useState('')
  const [estado, setEstado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  function alternar(id: string) {
    setSeleccionados((actuales) => actuales.includes(id) ? actuales.filter((actual) => actual !== id) : [...actuales, id])
  }

  async function promover() {
    if (!seleccionados.length || !nuevoCursoId) {
      setEstado('Seleccioná alumnos y un curso destino.')
      return
    }
    setCargando(true)
    setEstado(null)
    try {
      const respuesta = await fetch('/api/cursos/promover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estudiantesIds: seleccionados, nuevoCursoId }) })
      const resultado = await respuesta.json()
      if (!respuesta.ok) throw new Error(resultado.error)
      setSeleccionados([])
      setNuevoCursoId('')
      setEstado(`${resultado.actualizados} alumno(s) actualizado(s).`)
      router.refresh()
    } catch (error) {
      setEstado(error instanceof Error ? error.message : 'No se pudo cambiar de curso.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-cs-border p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-xl font-bold text-cs-text">Promoción y cambio de curso</h2>
        <p className="text-sm text-cs-muted">Seleccioná alumnos de cualquier división y asignales un curso destino.</p>
      </div>
      <div className="max-h-64 overflow-y-auto border border-cs-border rounded-xl divide-y divide-cs-border">
        {cursos.flatMap((curso) => curso.estudiantes.map((estudiante) => (
          <label key={estudiante.id} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-cs-surface-alt cursor-pointer">
            <input type="checkbox" checked={seleccionados.includes(estudiante.id)} onChange={() => alternar(estudiante.id)} />
            <span>{estudiante.apellido}, {estudiante.nombre}</span>
            <span className="ml-auto text-xs text-cs-muted">{curso.anio}° &quot;{curso.division}&quot;</span>
          </label>
        ))) }
        {!cursos.some((curso) => curso.estudiantes.length) && <p className="p-4 text-sm text-cs-muted">No hay alumnos asignados a cursos.</p>}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={nuevoCursoId} onChange={(event) => setNuevoCursoId(event.target.value)} className="flex-1 px-4 py-2.5 border border-cs-border rounded-xl bg-cs-surface text-sm">
          <option value="">Elegir curso destino</option>
          {cursos.map((curso) => <option key={curso.id} value={curso.id}>{curso.anio}° &quot;{curso.division}&quot;</option>)}
        </select>
        <button type="button" onClick={promover} disabled={cargando} className="px-5 py-2.5 bg-cs-green hover:bg-cs-green-light text-white rounded-xl font-bold text-sm disabled:opacity-50">
          {cargando ? 'Actualizando...' : `Cambiar curso (${seleccionados.length})`}
        </button>
      </div>
      {estado && <p className="text-sm font-semibold text-cs-muted" role="status">{estado}</p>}
    </section>
  )
}
