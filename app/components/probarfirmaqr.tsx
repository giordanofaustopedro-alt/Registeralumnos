'use client'
import { QRCodeSVG } from 'qrcode.react'

export default function ProbarFirmaQR({ sancionId = 'prueba-123' }: { sancionId?: string }) {
  // Dirección IP de tu PC para la prueba en red local
  const ipLocal = '192.168.1.40:3000'
  const urlFirma = `http://${ipLocal}/firmar/${sancionId}`

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border max-w-sm mx-auto text-center space-y-4">
      <h3 className="font-bold text-gray-800 text-sm">Prueba de Firma Digital</h3>
      <p className="text-xs text-gray-500">
        Conecta tu celular al **mismo Wi-Fi** y escanea este código QR con la cámara:
      </p>

      <div className="p-4 bg-gray-50 border rounded-xl flex justify-center">
        <QRCodeSVG value={urlFirma} size={200} level="H" includeMargin={true} />
      </div>

      <div className="bg-gray-100 p-2 rounded text-[11px] font-mono text-gray-600 break-all">
        {urlFirma}
      </div>
    </div>
  )
}