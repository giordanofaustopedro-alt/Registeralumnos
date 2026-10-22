'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  value: string
  onSubmit: (fechaNacimiento: string) => Promise<{ success: boolean; error?: string }>
}

export default function FechaNacimientoForm({ value, onSubmit }: Props) {
  const router = useRouter()
  const [fecha, setFecha] = useState(value)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCargando(true)
    setError(null)

    try {
      const resultado = await onSubmit(fecha)
      if (!resultado.success) {
        setError(resultado.error || 'No se pudo guardar la fecha.')
        return
      }
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo guardar la fecha.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="mt-3 flex flex-wrap items-end gap-2">
      <label className="text-xs font-semibold text-cs-muted">
        Fecha de nacimiento
        <input
          type="date"
          value={fecha}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(event) => setFecha(event.target.value)}
          className="mt-1 block rounded-lg border border-cs-border bg-white px-2 py-1.5 text-sm text-cs-text"
        />
      </label>
      <button
        type="submit"
        disabled={cargando || fecha === value}
        className="rounded-lg bg-cs-green px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {cargando ? 'Guardando...' : 'Guardar fecha'}
      </button>
      {error && <span className="w-full text-xs font-semibold text-cs-danger" role="alert">{error}</span>}
    </form>
  )
}
