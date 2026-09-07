'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type Props = {
  profesorId: string
  profesorNombre: string
  profesorEmail: string | null
  onClose: () => void
  onFirmada: (firmaUrl: string | null) => void
}

export default function ModalSolicitarFirma({ profesorId, profesorNombre, profesorEmail, onClose, onFirmada }: Props) {
  const [urlFirma, setUrlFirma] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviandoCorreo, setEnviandoCorreo] = useState(false)

  useEffect(() => {
    let activo = true

    async function generarEnlace() {
      const respuesta = await fetch(`/api/profesores/${profesorId}/solicitud-firma`, { method: 'POST' })
      const resultado = await respuesta.json()
      if (!activo) return
      if (!respuesta.ok) {
        setError(resultado.error || 'No se pudo generar el enlace.')
        return
      }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      setToken(resultado.token)
      setUrlFirma(`${baseUrl.replace(/\/$/, '')}/firmar/profesor/${resultado.token}`)
    }

    generarEnlace().catch(() => setError('No se pudo generar el enlace.'))
    return () => { activo = false }
  }, [profesorId])

  useEffect(() => {
    if (!urlFirma) return
    const token = urlFirma.split('/').pop()
    const intervalo = window.setInterval(async () => {
      const respuesta = await fetch(`/api/firmas/${token}`)
      if (respuesta.status === 410) {
        const resultado = await respuesta.json()
        if (resultado.firmada) {
          window.clearInterval(intervalo)
          onFirmada(resultado.firmaUrl || null)
        }
      }
    }, 3000)
    return () => window.clearInterval(intervalo)
  }, [urlFirma, onFirmada])

  const enviarPorCorreo = async () => {
    if (!profesorEmail || !urlFirma) return
    setEnviandoCorreo(true)
    setError(null)
    try {
      const respuesta = await fetch(`/api/profesores/${profesorId}/solicitud-firma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, enviarCorreo: true }),
      })
      const resultado = await respuesta.json()
      setError(respuesta.ok ? 'Correo enviado correctamente.' : resultado.error || 'No se pudo enviar el correo.')
    } catch {
      setError('No se pudo conectar con el servicio de correo.')
    } finally {
      setEnviandoCorreo(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="firma-profesor-titulo">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-xl">
        <h3 id="firma-profesor-titulo" className="font-bold text-gray-800">Firma digital de {profesorNombre}</h3>
        <p className="text-xs text-gray-500">Escaneá este código o enviá el enlace por correo. La pantalla funciona en celular, tablet y PC.</p>
        <div className="flex justify-center rounded-lg bg-gray-50 p-4">
          {urlFirma ? <QRCodeSVG value={urlFirma} size={180} level="H" includeMargin /> : <span className="h-45 w-45 animate-pulse bg-gray-200" />}
        </div>
        <p className="break-all text-[11px] text-gray-500">{urlFirma}</p>
        {profesorEmail ? <button type="button" onClick={enviarPorCorreo} disabled={!urlFirma || enviandoCorreo} className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-bold text-white disabled:opacity-50">{enviandoCorreo ? 'Enviando...' : 'Enviar enlace por correo'}</button> : <p className="text-xs text-amber-600">Este profesor no tiene correo cargado.</p>}
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        <p className="text-xs text-amber-600">El enlace vence en 30 minutos y se invalida al firmar.</p>
        <button type="button" onClick={onClose} className="w-full rounded-lg bg-gray-800 py-2.5 text-sm font-bold text-white">Cerrar</button>
      </div>
    </div>
  )
}
