'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { crearEstudiante } from '@/app/actions/estudiantes'

export default function NuevoEstudiantePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const cursos = ['1°', '2°', '3°', '4°', '5°', '6°', '7°']
  const divisiones = ['A', 'B', 'C', 'D', 'E']
  const gruposSanguineos = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', 'Sin especificar']

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const resultado = await crearEstudiante({
        dni: String(data.dni),
        nombre: String(data.nombre),
        apellido: String(data.apellido),
        curso: String(data.curso),
        division: String(data.division),
        email: String(data.email || ''),
        direccion: String(data.direccion || ''),
        grupoSanguineo: String(data.grupoSanguineo || ''),
        alergias: String(data.alergias || ''),
        medicacion: String(data.medicacion || ''),
        enfermedades: String(data.enfermedades || ''),
        problemasCardiacos: String(data.problemasCardiacos || ''),
        observacionesMedicas: String(data.observacionesMedicas || ''),
      })

      if (!resultado.success) {
        setError(resultado.error || 'Error al crear el estudiante')
        return
      }

      router.push(`/estudiantes/${resultado.data.id}`)
      router.refresh()
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Registrar Nuevo Estudiante</h1>
          <p className="text-slate-500 mt-1">Complete los datos del alumno y su ficha médica.</p>
        </div>
        <Link
          href="/estudiantes"
          className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2"
        >
          ← Volver al listado
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <span>📋</span> Datos Personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">DNI *</label>
              <input
                name="dni"
                required
                placeholder="Ej: 45123456"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
              <input
                name="nombre"
                required
                placeholder="Ej: Mateo"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Apellido *</label>
              <input
                name="apellido"
                required
                placeholder="Ej: González"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                name="email"
                type="email"
                placeholder="nombre@escuela.edu.ar"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Curso *</label>
              <select
                name="curso"
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccione...</option>
                {cursos.map(c => <option key={c} value={c}>{c} año</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">División *</label>
              <select
                name="division"
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccione...</option>
                {divisiones.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
              <input
                name="direccion"
                placeholder="Calle, número, ciudad"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <span>🏥</span> Ficha Médica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Grupo Sanguíneo</label>
              <select
                name="grupoSanguineo"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Seleccione...</option>
                {gruposSanguineos.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alergias</label>
              <input
                name="alergias"
                placeholder="Ej: Penicilina, Polen"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Medicación</label>
              <input
                name="medicacion"
                placeholder="Medicación que toma habitualmente"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Enfermedades</label>
              <input
                name="enfermedades"
                placeholder="Ej: Asma, Diabetes"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Problemas Cardíacos</label>
              <input
                name="problemasCardiacos"
                placeholder="Antecedentes cardíacos"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones Médicas</label>
              <textarea
                name="observacionesMedicas"
                rows={3}
                placeholder="Observaciones adicionales, aptitud física, etc."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <Link
            href="/estudiantes"
            className="px-6 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={cargando}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition shadow-sm hover:shadow flex items-center gap-2"
          >
            {cargando ? 'Guardando...' : '✓ Registrar Estudiante'}
          </button>
        </div>
      </form>
    </div>
  )
}
