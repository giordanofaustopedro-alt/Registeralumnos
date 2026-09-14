'use client'
import { useState } from 'react'

interface Estudiante {
  id: string
  nombre: string
  apellido: string
  dni: string
  curso?: string
}

type Documento = 'amonestacion' | 'fichaSalud' | 'autorizacionViaje'

const documentosDisponibles: Array<{ id: Documento; etiqueta: string }> = [
  { id: 'amonestacion', etiqueta: 'Amonestaciones' },
  { id: 'fichaSalud', etiqueta: 'Ficha médica' },
  { id: 'autorizacionViaje', etiqueta: 'Viaje' },
]

export default function SeleccionImpresion({ estudiantes }: { estudiantes: Estudiante[] }) {
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<string[]>([])
  const [busqueda, setBusqueda] = useState('')
  
  const [documentosPorAlumno, setDocumentosPorAlumno] = useState<Record<string, Documento[]>>({})

  // Toggle seleccionar/deseleccionar individual
  const toggleAlumno = (id: string) => {
    setAlumnosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    )
  }

  const alternarDocumento = (alumnoId: string, documento: Documento) => {
    setDocumentosPorAlumno(prev => {
      const actuales = prev[alumnoId] || ['amonestacion']
      const siguientes = actuales.includes(documento)
        ? actuales.filter(item => item !== documento)
        : [...actuales, documento]
      return { ...prev, [alumnoId]: siguientes }
    })
  }

  // Seleccionar todos los visibles
  const seleccionarTodos = () => {
    if (alumnosSeleccionados.length === estudiantesFiltrados.length) {
      setAlumnosSeleccionados([])
    } else {
      setAlumnosSeleccionados(estudiantesFiltrados.map(e => e.id))
    }
  }

  // Marcar automáticamente todo lo necesario para "Carpeta de Viaje"
  const activarModoCarpetaViaje = () => {
    setDocumentosPorAlumno(Object.fromEntries(
      alumnosSeleccionados.map(id => [id, ['fichaSalud', 'autorizacionViaje']]),
    ))
  }

  // Filtrado por nombre, apellido o DNI
  const estudiantesFiltrados = estudiantes.filter(e =>
    `${e.apellido} ${e.nombre} ${e.dni}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleImprimir = () => {
    if (alumnosSeleccionados.length === 0) {
      alert('Por favor, selecciona al menos un estudiante.')
      return
    }

    const configuracion = Object.fromEntries(alumnosSeleccionados.map(id => [
      id,
      documentosPorAlumno[id] || ['amonestacion'],
    ]))

    if (Object.values(configuracion).every(docs => docs.length === 0)) {
      alert('Por favor, selecciona al menos un tipo de documento para imprimir.')
      return
    }

    // Generar URL con parámetros para la vista de impresión en lote
    const params = new URLSearchParams({
      alumnos: alumnosSeleccionados.join(','),
      seleccion: JSON.stringify(configuracion),
    })

    window.open(`/imprimir-lote?${params.toString()}`, '_blank')
  }

  return (
    <div className="p-5 bg-white rounded-2xl border shadow-sm space-y-4 max-w-2xl">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-base">🖨️ Impresión por Lote / Legajos</h3>
          <p className="text-xs text-gray-500">Selecciona alumnos y plantillas a imprimir</p>
        </div>
        
        {/* Botón rápido para Carpeta de Viaje */}
        <button
          type="button"
          onClick={activarModoCarpetaViaje}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
        >
          🚌 Modo &quot;Carpeta de Viaje&quot;
        </button>
      </div>

      {/* Buscador y Selección de Alumnos */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por Nombre, Apellido o DNI..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
          <button
            type="button"
            onClick={seleccionarTodos}
            className="text-xs text-emerald-700 hover:underline font-semibold whitespace-nowrap"
          >
            {alumnosSeleccionados.length === estudiantesFiltrados.length ? 'Desmarcar todos' : 'Marcar todos'}
          </button>
        </div>

        {/* Lista de Alumnos con DNI */}
        <div className="max-h-52 overflow-y-auto border rounded-xl divide-y">
          {estudiantesFiltrados.map(e => (
            <label
              key={e.id}
              className="flex items-center justify-between p-2 hover:bg-emerald-50/50 cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={alumnosSeleccionados.includes(e.id)}
                  onChange={() => toggleAlumno(e.id)}
                />
                <span className="font-semibold text-gray-800">
                  {e.apellido}, {e.nombre}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] text-gray-500">
                <span className="font-mono">DNI: {e.dni}</span>
                {documentosDisponibles.map(documento => {
                  const activos = documentosPorAlumno[e.id] || ['amonestacion']
                  return <label key={documento.id} className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5">
                    <input type="checkbox" checked={activos.includes(documento.id)} onChange={() => alternarDocumento(e.id, documento.id)} />
                    {documento.etiqueta}
                  </label>
                })}
              </div>
            </label>
          ))}
          {estudiantesFiltrados.length === 0 && (
            <p className="p-3 text-center text-xs text-gray-400">No se encontraron estudiantes.</p>
          )}
        </div>
      </div>

      {/* Botón de Impresión */}
      <button
        onClick={handleImprimir}
        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
      >
        🖨️ Generar Vista de Impresión ({alumnosSeleccionados.length} Seleccionados)
      </button>
    </div>
  )
}