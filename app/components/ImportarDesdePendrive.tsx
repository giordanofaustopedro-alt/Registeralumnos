'use client'
import * as XLSX from 'xlsx'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportarDesdePendrive() {
  const router = useRouter()
  const [estado, setEstado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      setCargando(true)
      setEstado(null)
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)
        const respuesta = await fetch('/api/estudiantes/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const resultado = await respuesta.json()
        if (!respuesta.ok) throw new Error(resultado.error)
        setEstado(`${resultado.importados} alumno(s) procesado(s) correctamente.`)
        router.refresh()
      } catch (error) {
        setEstado(error instanceof Error ? error.message : 'No se pudo importar el archivo.')
      } finally {
        setCargando(false)
        e.target.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="p-4 border-2 border-dashed border-cs-border rounded-xl text-center">
      <p className="text-xs font-semibold mb-2">Conecta tu pendrive y selecciona el archivo Excel/CSV:</p>
      <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={cargando} className="text-xs" />
      {cargando && <p className="text-xs text-cs-muted mt-2">Importando...</p>}
      {estado && <p className="text-xs font-semibold text-cs-muted mt-2" role="status">{estado}</p>}
    </div>
  )
}