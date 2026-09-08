'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type DocumentoAction = (data: {
  titulo: string
  archivoUrl: string
  tipo?: 'FICHA_MEDICA' | 'AUTORIZACION' | 'OTRO'
}) => Promise<{ success?: boolean; error?: string }>

type Props = {
  onSubmit: DocumentoAction
}

function leerArchivo(archivo: File) {
  return new Promise<string>((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(String(lector.result))
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    lector.readAsDataURL(archivo)
  })
}

export default function SelectorDocumento({ onSubmit }: Props) {
  const router = useRouter()
  const archivoRef = useRef<HTMLInputElement>(null)
  const carpetaRef = useRef<HTMLInputElement>(null)
  const [abierto, setAbierto] = useState(false)
 
  const [archivo, setArchivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

function abrir(origenElegido: 'archivo' | 'carpeta') {
    setError(null)
    if (origenElegido === 'archivo') archivoRef.current?.click()
   else carpetaRef.current?.click()
}

  function seleccionarArchivo(event: React.ChangeEvent<HTMLInputElement>) {
    const seleccionado = event.target.files?.[0]
    if (!seleccionado) return
    setArchivo(seleccionado)
    setTitulo(seleccionado.name.replace(/\.[^/.]+$/, ''))
  }

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!archivo || !titulo.trim()) {
      setError('Elegí un archivo e indicá un título.')
      return
    }

    setCargando(true)
    setError(null)
    try {
      const resultado = await onSubmit({
        titulo: titulo.trim(),
        archivoUrl: await leerArchivo(archivo),
      })
      if (!resultado.success) {
        setError(resultado.error || 'No se pudo guardar el documento.')
        return
      }
      setAbierto(false)
      setArchivo(null)
      setTitulo('')
      router.refresh()
    } catch {
      setError('No se pudo guardar el documento.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <input ref={archivoRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={seleccionarArchivo} className="hidden" />
      <input ref={carpetaRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={seleccionarArchivo} className="hidden" {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)} />
      {!abierto ? (
        <button type="button" onClick={() => setAbierto(true)} className="bg-cs-green hover:bg-cs-green-light text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-md">
          + Agregar documento
        </button>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cs-green/30 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-cs-border overflow-hidden">
            <div className="flex justify-between items-center px-7 py-5 border-b border-cs-border">
              <h3 className="font-extrabold text-xl text-cs-text">¿Qué querés subir?</h3>
              <button type="button" onClick={() => setAbierto(false)} className="text-2xl text-cs-muted" aria-label="Cerrar">×</button>
            </div>
            <div className="p-7 space-y-5">
              {!archivo ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => abrir('archivo')} className="p-5 rounded-2xl border-2 border-cs-border hover:border-cs-green hover:bg-cs-surface-alt text-left transition">
                    <span className="text-3xl block mb-2">📄</span>
                    <span className="font-bold text-cs-text block">Desde mi equipo</span>
                    <span className="text-sm text-cs-muted">Elegir un archivo</span>
                  </button>
                  <button type="button" onClick={() => abrir('carpeta')} className="p-5 rounded-2xl border-2 border-cs-border hover:border-cs-green hover:bg-cs-surface-alt text-left transition">
                    <span className="text-3xl block mb-2">📁</span>
                    <span className="font-bold text-cs-text block">Desde una carpeta</span>
                    <span className="text-sm text-cs-muted">Elegir un archivo guardado</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={guardar} className="space-y-4">
                  <p className="text-sm text-cs-muted">Archivo seleccionado: <strong className="text-cs-text">{archivo.name}</strong></p>
                  <label className="block text-sm font-bold text-cs-text">Título
                    <input value={titulo} onChange={(event) => setTitulo(event.target.value)} required className="w-full mt-2 px-4 py-3 border border-cs-border rounded-xl bg-cs-surface text-cs-text" />
                  </label>
                  {error && <p className="p-3 rounded-xl bg-cs-danger-soft text-cs-danger text-sm font-bold">{error}</p>}
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setArchivo(null)} className="px-5 py-2.5 border border-cs-border rounded-xl font-bold">Elegir otro</button>
                    <button type="submit" disabled={cargando} className="px-5 py-2.5 bg-cs-green text-white rounded-xl font-bold disabled:opacity-50">{cargando ? 'Guardando...' : 'Guardar documento'}</button>
                  </div>
                </form>
              )}
              {error && !archivo && <p className="p-3 rounded-xl bg-cs-danger-soft text-cs-danger text-sm font-bold">{error}</p>}
              {!archivo && <button type="button" onClick={() => setAbierto(false)} className="w-full px-5 py-2.5 border border-cs-border rounded-xl font-bold">Cancelar</button>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
