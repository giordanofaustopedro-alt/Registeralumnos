'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type DocumentoAction = (data: {
  titulo: string
  archivoUrl: string
  nombre: string
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
  const [archivos, setArchivos] = useState<File[]>([])
  const [titulo, setTitulo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function abrir(origenElegido: 'archivo' | 'carpeta') {
    setError(null)
    if (origenElegido === 'archivo') archivoRef.current?.click()
    else carpetaRef.current?.click()
  }

  function seleccionarArchivos(event: React.ChangeEvent<HTMLInputElement>) {
    const seleccionados = Array.from(event.target.files || [])
    if (!seleccionados.length) return
    setArchivos(seleccionados)
    setTitulo(seleccionados.length === 1
      ? seleccionados[0].name.replace(/\.[^/.]+$/, '')
      : '')
    setError(null)
    event.target.value = ''
  }

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!archivos.length || (archivos.length === 1 && !titulo.trim())) {
      setError('Elegí uno o más archivos e indicá un título para el archivo.')
      return
    }

    setCargando(true)
    setError(null)
    let guardados = 0
    try {
      for (const [indice, archivo] of archivos.entries()) {
        const resultado = await onSubmit({
          titulo: archivos.length === 1 ? titulo.trim() : archivo.name.replace(/\.[^/.]+$/, ''),
          archivoUrl: await leerArchivo(archivo),
          nombre: archivo.name,
        })
        if (!resultado.success) {
          const pendientes = archivos.slice(indice)
          setArchivos(pendientes)
          setTitulo(pendientes.length === 1 ? pendientes[0].name.replace(/\.[^/.]+$/, '') : '')
          if (guardados) router.refresh()
          setError(`${guardados ? `Se guardaron ${guardados} archivo(s). ` : ''}${resultado.error || `No se pudo guardar ${archivo.name}.`}`)
          return
        }
        guardados += 1
      }
      setAbierto(false)
      setArchivos([])
      setTitulo('')
      router.refresh()
    } catch {
      const pendientes = archivos.slice(guardados)
      setArchivos(pendientes)
      setTitulo(pendientes.length === 1 ? pendientes[0].name.replace(/\.[^/.]+$/, '') : '')
      if (guardados) router.refresh()
      setError(`${guardados ? `Se guardaron ${guardados} archivo(s). ` : ''}No se pudo guardar el documento.`)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <input ref={archivoRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={seleccionarArchivos} className="hidden" />
      <input ref={carpetaRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" onChange={seleccionarArchivos} className="hidden" {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)} />
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
              {!archivos.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => abrir('archivo')} className="p-5 rounded-2xl border-2 border-cs-border hover:border-cs-green hover:bg-cs-surface-alt text-left transition">
                    <span className="text-3xl block mb-2">📄</span>
                    <span className="font-bold text-cs-text block">Desde mi equipo</span>
                    <span className="text-sm text-cs-muted">Elegir un archivo</span>
                  </button>
                  <button type="button" onClick={() => abrir('carpeta')} className="p-5 rounded-2xl border-2 border-cs-border hover:border-cs-green hover:bg-cs-surface-alt text-left transition">
                    <span className="text-3xl block mb-2">📁</span>
                    <span className="font-bold text-cs-text block">Desde una carpeta</span>
                    <span className="text-sm text-cs-muted">Elegir una carpeta y guardar sus archivos</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={guardar} className="space-y-4">
                  {archivos.length === 1 ? (
                    <>
                      <p className="text-sm text-cs-muted">Archivo seleccionado: <strong className="text-cs-text">{archivos[0].name}</strong></p>
                      <label className="block text-sm font-bold text-cs-text">Título
                        <input value={titulo} onChange={(event) => setTitulo(event.target.value)} required className="w-full mt-2 px-4 py-3 border border-cs-border rounded-xl bg-cs-surface text-cs-text" />
                      </label>
                    </>
                  ) : (
                    <div className="text-sm text-cs-muted">
                      <p>Se guardarán {archivos.length} documentos con sus nombres originales:</p>
                      <ul className="mt-2 max-h-32 list-inside list-disc overflow-y-auto">
                        {archivos.map((archivo) => <li key={`${archivo.webkitRelativePath || archivo.name}-${archivo.size}`}>{archivo.webkitRelativePath || archivo.name}</li>)}
                      </ul>
                    </div>
                  )}
                  {error && <p className="p-3 rounded-xl bg-cs-danger-soft text-cs-danger text-sm font-bold">{error}</p>}
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => { setArchivos([]); setError(null) }} disabled={cargando} className="px-5 py-2.5 border border-cs-border rounded-xl font-bold disabled:opacity-50">Elegir otro</button>
                    <button type="submit" disabled={cargando} className="px-5 py-2.5 bg-cs-green text-white rounded-xl font-bold disabled:opacity-50">{cargando ? 'Guardando...' : archivos.length === 1 ? 'Guardar documento' : 'Guardar documentos'}</button>
                  </div>
                </form>
              )}
              {error && !archivos.length && <p className="p-3 rounded-xl bg-cs-danger-soft text-cs-danger text-sm font-bold">{error}</p>}
              {!archivos.length && <button type="button" onClick={() => setAbierto(false)} className="w-full px-5 py-2.5 border border-cs-border rounded-xl font-bold">Cancelar</button>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
