'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  mensajeConfirmacion: string
  etiqueta: string
  onDelete: () => Promise<{ success: boolean; error?: string }>
}

export default function EliminarRegistroButton({ mensajeConfirmacion, etiqueta, onDelete }: Props) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function eliminar() {
    if (!window.confirm(mensajeConfirmacion)) return

    setCargando(true)
    setError(null)
    try {
      const resultado = await onDelete()
      if (!resultado.success) {
        setError(resultado.error || 'No se pudo eliminar.')
        return
      }
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo eliminar.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={eliminar}
        disabled={cargando}
        className="rounded-lg border border-cs-danger/30 px-3 py-2 text-xs font-bold text-cs-danger hover:bg-cs-danger-soft/40 disabled:opacity-50"
      >
        {cargando ? 'Eliminando...' : etiqueta}
      </button>
      {error && <p className="mt-1 text-xs font-semibold text-cs-danger" role="alert">{error}</p>}
    </div>
  )
}
