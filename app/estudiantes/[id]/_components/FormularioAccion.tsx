'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Campo = {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
  tipo?: 'textarea'
}

type Props = {
  titulo: string
  campos: Campo[]
  onSubmit: (data: Record<string, string>) => Promise<{ success: boolean; error?: string }>
  exitoMsg: string
  submitText: string
  color?: 'blue' | 'red' | 'green'
}

export default function FormularioAccion({
  titulo,
  campos,
  onSubmit,
  exitoMsg,
  submitText,
  color = 'blue',
}: Props) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    setExito(null)

    const formData = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    campos.forEach(c => {
      data[c.name] = String(formData.get(c.name) || '')
    })

    try {
      const resultado = await onSubmit(data)
      if (!resultado.success) {
        setError(resultado.error || 'Error al procesar la solicitud')
        return
      }

      setExito(exitoMsg)
      formRef.current?.reset()
      router.refresh()

      setTimeout(() => {
        setAbierto(false)
        setExito(null)
      }, 1500)
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const colorClasses = {
    blue: {
      btn: 'bg-blue-600 hover:bg-blue-700',
      toggle: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    red: {
      btn: 'bg-red-600 hover:bg-red-700',
      toggle: 'bg-red-600 hover:bg-red-700 text-white',
    },
    green: {
      btn: 'bg-emerald-600 hover:bg-emerald-700',
      toggle: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  }[color]

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className={`${colorClasses.toggle} px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm`}
      >
        {titulo}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{titulo}</h3>
          <button
            onClick={() => setAbierto(false)}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}
          {exito && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">
              ✓ {exito}
            </div>
          )}

          {campos.map(c => (
            <div key={c.name}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {c.label}
              </label>
              {c.tipo === 'textarea' ? (
                <textarea
                  name={c.name}
                  required={c.required}
                  placeholder={c.placeholder}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <input
                  name={c.name}
                  type={c.type || 'text'}
                  required={c.required}
                  placeholder={c.placeholder}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="px-5 py-2 border border-slate-300 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className={`${colorClasses.btn} disabled:opacity-50 text-white px-5 py-2 rounded-xl font-medium transition shadow-sm text-sm`}
            >
              {cargando ? 'Guardando...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
