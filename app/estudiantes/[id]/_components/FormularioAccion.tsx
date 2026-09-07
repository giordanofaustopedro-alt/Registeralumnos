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

type ResultadoAccion = {
  success?: boolean
  error?: string
}

type Props = {
  titulo: string
  campos: Campo[]
  // Permite aceptar tanto funciones que reciben Record<string, string> como FormData o Server Actions directas
  onSubmit: (
    data: never,
  ) => Promise<unknown>
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
  color = 'green',
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
    
    // Generamos también el objeto de datos por si la acción espera un objeto clave-valor
    const dataObj: Record<string, string> = {}
    campos.forEach((c) => {
      dataObj[c.name] = String(formData.get(c.name) || '')
    })

    try {
      // Intentamos enviar tanto el objeto clave-valor como FormData según lo que requiera la función
      const enviar = onSubmit as unknown as (data: Record<string, string>) => Promise<ResultadoAccion | void>
      const resultado = await enviar(dataObj)

      if (resultado && typeof resultado === 'object' && 'error' in resultado && typeof resultado.error === 'string') {
        setError(resultado.error)
        return
      }

      setExito(exitoMsg)
      formRef.current?.reset()
      router.refresh()

      setTimeout(() => {
        setAbierto(false)
        setExito(null)
      }, 1500)
    } catch (err: unknown) {
      console.error('Error detectado en FormularioAccion:', err)
      setError(err instanceof Error ? err.message : 'Error de conexión o fallo en el servidor. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const paleta = {
    green: {
      toggle: 'bg-cs-green hover:bg-cs-green-light text-white',
      submit: 'bg-cs-green hover:bg-cs-green-light',
    },
    red: {
      toggle: 'bg-cs-danger hover:bg-cs-danger/90 text-white',
      submit: 'bg-cs-danger hover:bg-cs-danger/90',
    },
    blue: {
      toggle: 'bg-gradient-to-br from-cs-bg to-cs-bg-soft hover:opacity-90 text-white',
      submit: 'bg-gradient-to-br from-cs-bg to-cs-bg-soft hover:opacity-90',
    },
  }[color]

  const inputCls =
    'w-full px-4 py-2.5 border border-cs-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cs-green/30 focus:border-cs-green/50 bg-cs-surface text-cs-text placeholder-cs-muted'
  const labelCls = 'block text-sm font-bold text-cs-text mb-1.5'

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className={`${paleta.toggle} px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg`}
      >
        {titulo}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cs-green/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-cs-border overflow-hidden scale-in duration-200">
        <div className="flex justify-between items-center px-7 py-5 border-b border-cs-border bg-gradient-to-r from-cs-surface to-white">
          <h3 className="font-extrabold text-xl text-cs-text">{titulo}</h3>
          <button
            onClick={() => setAbierto(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-cs-muted hover:text-cs-text hover:bg-cs-surface-alt transition text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && (
            <div className="p-4 bg-cs-danger-soft/60 border border-cs-danger/30 text-cs-danger rounded-2xl text-sm font-bold shadow-sm">
              ⚠️ {error}
            </div>
          )}
          {exito && (
            <div className="p-4 bg-cs-success-soft border border-cs-success/30 text-cs-green rounded-2xl text-sm font-bold shadow-sm">
              ✓ {exito}
            </div>
          )}

          {campos.map((c) => (
            <div key={c.name}>
              <label className={labelCls}>{c.label}</label>
              {c.tipo === 'textarea' ? (
                <textarea
                  name={c.name}
                  required={c.required}
                  placeholder={c.placeholder}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              ) : (
                <input
                  name={c.name}
                  type={c.type || 'text'}
                  required={c.required}
                  placeholder={c.placeholder}
                  className={inputCls}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="px-5 py-2.5 border border-cs-border rounded-xl font-bold text-cs-text hover:bg-cs-surface-alt transition text-sm bg-cs-surface"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className={`${paleta.submit} disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition shadow-md hover:shadow-lg text-sm inline-flex items-center gap-2`}
            >
              {cargando ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Guardando...
                </>
              ) : (
                submitText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}