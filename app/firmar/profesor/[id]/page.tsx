'use client'

import { use, useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function PaginaFirmaProfesor({ params }: { params: Promise<{ id: string }> }) {
  const { id: token } = use(params)
  const sigCanvas = useRef<SignatureCanvas | null>(null)
  const [estado, setEstado] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [valido, setValido] = useState<boolean | null>(null)
  const [firmaVacia, setFirmaVacia] = useState(true)
  const [completada, setCompletada] = useState(false)
  const [cierreBloqueado, setCierreBloqueado] = useState(false)

  useEffect(() => {
    fetch(`/api/firmas/${token}`)
      .then(async (respuesta) => {
        setValido(respuesta.ok)
        if (!respuesta.ok) {
          const resultado = await respuesta.json()
          setEstado(resultado.error || 'Este enlace ya no es válido.')
        }
      })
      .catch(() => setEstado('No se pudo validar el enlace. Revisá tu conexión.'))
  }, [token])

  useEffect(() => {
    if (!completada) return
    const cierre = window.setTimeout(() => {
      window.close()
      window.setTimeout(() => {
        if (!window.closed) setCierreBloqueado(true)
      }, 300)
    }, 1200)
    return () => window.clearTimeout(cierre)
  }, [completada])

  const enviarFirma = async () => {
    if (valido !== true || sigCanvas.current?.isEmpty()) {
      setEstado('Por favor, firmá antes de enviar.')
      return
    }

    const firmaBase64 = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')
    setEnviando(true)
    setEstado(null)

    try {
      const respuesta = await fetch(`/api/firmas/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firma: firmaBase64 }),
      })
      const resultado = await respuesta.json()
      if (respuesta.ok) {
        setValido(false)
        setCompletada(true)
      }
      setEstado(respuesta.ok ? 'Firma registrada. Esta página se cerrará automáticamente.' : resultado.error || 'No se pudo guardar la firma. Podés corregirla y volver a intentar.')
    } catch {
      setEstado('No se pudo conectar con el sistema. Revisá la conexión y volvé a intentar; podés borrar la firma para hacerla otra vez.')
    } finally {
      setEnviando(false)
    }
  }

  if (completada) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4 py-8 text-gray-800">
        <p className="text-center text-base font-semibold" role="status">
          {cierreBloqueado ? 'Firma registrada correctamente. Ya podés cerrar esta página.' : 'Firma registrada correctamente. Esta página se cerrará automáticamente.'}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen w-full bg-gray-100 px-4 py-8 text-gray-800 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
      <h2 className="font-bold text-base text-gray-800">Firma digital del profesor</h2>
      <p className="text-center text-xs text-gray-600">Dibujá tu firma con el dedo, mouse o lápiz digital:</p>

      <div className="relative w-full overflow-hidden rounded-xl border-2 border-emerald-600 bg-white touch-none">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          onBegin={() => setFirmaVacia(false)}
          canvasProps={{ width: 900, height: 360, className: 'h-auto w-full', 'aria-label': 'Recuadro para dibujar la firma' }}
        />
        {firmaVacia && valido === true && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">Pon tu firma</span>
        )}
      </div>

      <div className="flex w-full max-w-md gap-4">
        <button type="button" onClick={() => { sigCanvas.current?.clear(); setFirmaVacia(true); setEstado(null) }} className="flex-1 py-3 text-xs font-bold bg-gray-200 text-gray-700 rounded-lg">
          Borrar y reintentar
        </button>
        <button type="button" onClick={enviarFirma} disabled={enviando || valido !== true} className="flex-1 py-3 text-xs font-bold bg-emerald-700 text-white rounded-lg shadow disabled:opacity-50">
          {enviando ? 'Guardando...' : 'Confirmar firma'}
        </button>
      </div>
      {estado && <p className="max-w-xs text-center text-sm font-semibold text-gray-700" role="status">{estado}</p>}
      </div>
    </main>
  )
}