'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { crearEstudiante } from '@/app/actions/estudiantes'

export default function NuevoEstudiantePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const cursos = ['1°', '2°', '3°', '4°', '5°', '6°']
  const divisiones = ['A', 'B']
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

      if (!resultado.success || !resultado.data) {
        setError(resultado.error || 'Error al crear el estudiante')
        return
      }

      router.push(`/estudiantes/${resultado.data.id}`)
      router.refresh()
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3 border border-cs-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cs-green/40 focus:border-cs-green/60 bg-cs-surface text-cs-text placeholder-cs-muted'
  const labelCls = 'block text-sm font-semibold text-cs-text mb-2'

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <p className="text-sm text-cs-muted font-medium tracking-wide uppercase">
            Formulario de alta
          </p>
          <h1 className="text-3xl font-extrabold text-cs-text mt-1">
            Registrar Nuevo Estudiante
          </h1>
          <p className="text-cs-muted mt-1">
            Complete los datos del alumno y su ficha médica.
          </p>
        </div>
        <Link
          href="/estudiantes"
          className="text-cs-muted hover:text-cs-text font-semibold flex items-center gap-2 px-4 py-2 rounded-xl border border-cs-border transition bg-cs-surface"
        >
          ← Volver al listado
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-cs-danger-soft/70 border border-cs-danger/30 text-cs-danger rounded-xl text-sm font-semibold shadow-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white rounded-3xl border border-cs-border p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cs-border/70">
            <div className="w-11 h-11 rounded-xl bg-cs-blue-soft flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <h2 className="text-xl font-bold text-cs-text">Datos Personales</h2>
              <p className="text-sm text-cs-muted">Información básica del alumno</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>DNI *</label>
              <input name="dni" required placeholder="Ej: 45123456" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nombre *</label>
              <input name="nombre" required placeholder="Ej: Mateo" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Apellido *</label>
              <input name="apellido" required placeholder="Ej: González" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                name="email"
                type="email"
                placeholder="nombre@escuela.edu.ar"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Curso *</label>
              <select name="curso" required className={inputCls}>
                <option value="">Seleccione...</option>
                {cursos.map((c) => (
                  <option key={c} value={c}>
                    {c} año
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>División *</label>
              <select name="division" required className={inputCls}>
                <option value="">Seleccione...</option>
                {divisiones.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Dirección</label>
              <input
                name="direccion"
                placeholder="Calle, número, ciudad"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-cs-border p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cs-border/70">
            <div className="w-11 h-11 rounded-xl bg-cs-success-soft flex items-center justify-center text-2xl">
              🏥
            </div>
            <div>
              <h2 className="text-xl font-bold text-cs-text">Ficha Médica</h2>
              <p className="text-sm text-cs-muted">Datos de salud para emergencias</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Grupo Sanguíneo</label>
              <select name="grupoSanguineo" className={inputCls}>
                <option value="">Seleccione...</option>
                {gruposSanguineos.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Alergias</label>
              <input
                name="alergias"
                placeholder="Ej: Penicilina, Polen"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Medicación</label>
              <input
                name="medicacion"
                placeholder="Medicación que toma habitualmente"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Enfermedades</label>
              <input
                name="enfermedades"
                placeholder="Ej: Asma, Diabetes"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Problemas Cardíacos</label>
              <input
                name="problemasCardiacos"
                placeholder="Antecedentes cardíacos"
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Observaciones Médicas</label>
              <textarea
                name="observacionesMedicas"
                rows={3}
                placeholder="Observaciones adicionales, aptitud física, etc."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-2">
          <Link
            href="/estudiantes"
            className="px-6 py-3 border border-cs-border rounded-xl font-semibold text-cs-text hover:bg-cs-surface-alt transition bg-cs-surface"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={cargando}
            className="px-8 py-3 bg-cs-green hover:bg-cs-green-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {cargando ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                Guardando...
              </>
            ) : (
              <>✓ Registrar Estudiante</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
