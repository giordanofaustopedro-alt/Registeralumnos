'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Suspense } from 'react'

type ModoImpresion = 'elegir' | 'plantillas' | 'pdfs' | 'ambos'

function esPdf(archivoUrl: string, nombre: string | null, titulo: string) {
  const urlEnMinusculas = archivoUrl.toLowerCase()
  return urlEnMinusculas.startsWith('data:application/pdf') ||
    /\.pdf(?:$|[?#])/.test(urlEnMinusculas) ||
    `${nombre || ''} ${titulo}`.toLowerCase().trim().endsWith('.pdf')
}

function VistaImpresionLote() {
  const searchParams = useSearchParams()
  const alumnosParam = searchParams.get('alumnos') || ''
  const docs = searchParams.get('docs')?.split(',') || []
  const seleccionParam = searchParams.get('seleccion') || ''
  const seleccion = (() => {
    try {
      return JSON.parse(seleccionParam) as Record<string, string[]>
    } catch {
      return {}
    }
  })()

  const [estudiantes, setEstudiantes] = useState<Array<{
    id: string
    nombre: string
    apellido: string
    dni: string
    curso: string | null
    division: string | null
    infoMedica: {
      grupoSanguineo: string | null
      alergias: string | null
      medicacion: string | null
      enfermedades: string | null
      observaciones: string | null
    } | null
    responsables: Array<{ nombre: string; apellido: string | null; dni: string | null; parentesco: string | null; telefono: string | null }>
    amonestaciones: Array<{ fecha: Date; motivo: string; descripcion: string | null }>
    documentos: Array<{ id: string; titulo: string; nombre: string | null; archivoUrl: string; tipo: string; creadoEn: string }>
  }>>([])
  const [modo, setModo] = useState<ModoImpresion>('elegir')

  useEffect(() => {
    if (alumnosParam) {
      fetch(`/api/estudiantes/lote?ids=${alumnosParam}`)
        .then(res => res.json())
        .then(data => setEstudiantes(Array.isArray(data) ? data : []))
    }
  }, [alumnosParam])

  const pdfs = estudiantes.flatMap(estudiante => estudiante.documentos
    .filter(documento => esPdf(documento.archivoUrl, documento.nombre, documento.titulo))
    .map(documento => ({ ...documento, estudiante })))
  const mostrarPlantillas = modo === 'plantillas' || modo === 'ambos' || (modo === 'elegir' && pdfs.length === 0)
  const mostrarPdfs = modo === 'pdfs' || modo === 'ambos'

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0">
      <div className="print:hidden mb-6 border-b border-gray-200 pb-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-sm font-semibold">Impresión por lote</p>
            <p className="text-xs text-gray-500">{estudiantes.length} alumno(s) seleccionado(s) · {pdfs.length} PDF detectado(s)</p>
          </div>
          {mostrarPlantillas && <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-lg shadow">🖨️ Imprimir plantillas</button>}
        </div>
      </div>

      {modo === 'elegir' && pdfs.length > 0 && (
        <section className="print:hidden mb-8 max-w-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-base font-bold">Encontré {pdfs.length} PDF guardado(s)</h2>
          <p className="mt-1 text-sm text-gray-600">¿Qué querés imprimir en este lote?</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <button onClick={() => setModo('plantillas')} className="border border-gray-300 bg-white p-3 text-left text-xs font-semibold hover:border-emerald-600">Solo plantillas del sistema</button>
            <button onClick={() => setModo('pdfs')} className="border border-gray-300 bg-white p-3 text-left text-xs font-semibold hover:border-emerald-600">Solo PDFs guardados</button>
            <button onClick={() => setModo('ambos')} className="border border-emerald-700 bg-emerald-700 p-3 text-left text-xs font-semibold text-white hover:bg-emerald-800">Plantillas y PDFs</button>
          </div>
        </section>
      )}

      {mostrarPdfs && (
        <section className="print:hidden mb-8 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h2 className="text-sm font-bold uppercase">PDFs detectados</h2>
            <span className="text-xs text-gray-500">Abrilos para imprimirlos</span>
          </div>
          {pdfs.map(({ estudiante, ...documento }) => (
            <div key={documento.id} className="flex flex-wrap items-center justify-between gap-3 border border-gray-200 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{documento.titulo}</p>
                <p className="text-xs text-gray-500">{estudiante.apellido}, {estudiante.nombre} · DNI {estudiante.dni}</p>
              </div>
              <a href={documento.archivoUrl} target="_blank" rel="noreferrer" className="shrink-0 bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-700">Abrir e imprimir PDF</a>
            </div>
          ))}
        </section>
      )}

      {/* Hojas a imprimir */}
      {mostrarPlantillas && estudiantes.map((e) => (
        <div key={e.id} className="page-break flex flex-col gap-6 p-6 border print:border-none print:p-0 mb-8 print:mb-0 h-[297mm]">
          {/* Cabecera oficial de la institución */}
          <div className="border-b-2 border-black pb-2 flex justify-between items-end">
            <div>
              <h1 className="text-lg font-bold uppercase">Carpeta de Viaje / Legajo Escolar</h1>
              <p className="text-xs">Documentación de Salida Educativa y Representación</p>
            </div>
            <div className="text-right text-xs font-mono">
              <p>DNI: {e.dni}</p>
                  <Image src="/firmaDirector-digital.png" alt="Firma del responsable directivo" width={100} height={120} className="ml-auto mt-1 h-16 w-20 object-contain" />
            </div>
          </div>

          {/* Datos del estudiante */}
          <div className="bg-gray-50 print:bg-transparent p-3 rounded border text-xs grid grid-cols-2 gap-2">
            <p><strong>Estudiante:</strong> {e.apellido}, {e.nombre}</p>
            <p><strong>DNI:</strong> {e.dni}</p>
            <p><strong>Curso:</strong> {e.curso || 'S/D'} &quot;{e.division || 'S/D'}&quot;</p>
            <p><strong>Legajo:</strong> S/D</p>
          </div>

          {(seleccion[e.id] || docs).includes('amonestacion') && (
            <div className="border p-4 rounded text-xs space-y-3">
              <h3 className="font-bold underline uppercase text-center">Amonestaciones registradas</h3>
              {e.amonestaciones.length === 0 ? <p>No hay amonestaciones registradas.</p> : e.amonestaciones.map(amonestacion => (
                <div key={`${amonestacion.fecha}-${amonestacion.motivo}`} className="border-b border-gray-300 pb-2">
                  <p><strong>Fecha:</strong> {new Date(amonestacion.fecha).toLocaleDateString('es-AR')}</p>
                  <p><strong>Motivo:</strong> {amonestacion.motivo}</p>
                  {amonestacion.descripcion && <p><strong>Descripción:</strong> {amonestacion.descripcion}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Plantilla 1: Autorización de Viaje */}
          {(seleccion[e.id] || docs).includes('autorizacionViaje') && (
            <div className="border p-4 rounded text-xs space-y-3">
              <h3 className="font-bold underline uppercase text-center">Autorización de Salida Educativa</h3>
              <p className="leading-relaxed">
                Por la presente, autorizo a mi hijo/a <strong>{e.apellido}, {e.nombre}</strong> (DNI: <strong>{e.dni}</strong>)
                a participar de la salida educativa programada por el establecimiento escolar.
              </p>
              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-[10px]">
                <div className="border-t border-black pt-1">Firma del Padre/Madre/Tutor</div>
                <div className="border-t border-black pt-1">Aclaración y DNI</div>
              </div>
              <p><strong>Responsable:</strong> {e.responsables[0] ? `${e.responsables[0].apellido ? `${e.responsables[0].apellido}, ` : ''}${e.responsables[0].nombre}` : 'Sin responsable registrado'}</p>
              <p><strong>Parentesco:</strong> {e.responsables[0]?.parentesco || 'S/D'} &nbsp; <strong>DNI:</strong> {e.responsables[0]?.dni || 'S/D'}</p>
              <p><strong>Teléfono:</strong> {e.responsables[0]?.telefono || 'S/D'}</p>
            </div>
          )}

          {/* Plantilla 2: Ficha de Salud / CADA */}
          {(seleccion[e.id] || docs).includes('fichaSalud') && (
            <div className="border p-4 rounded text-xs space-y-2">
              <h3 className="font-bold underline uppercase text-center">Ficha Médica de Aptitud Física (CADA)</h3>
              <p><strong>Alumno:</strong> {e.apellido}, {e.nombre} - DNI: {e.dni}</p>
              <p><strong>Alergias:</strong> {e.infoMedica?.alergias || 'Ninguna'}</p>
              <p><strong>Medicación:</strong> {e.infoMedica?.medicacion || 'Ninguna'}</p>
              <p><strong>Enfermedades:</strong> {e.infoMedica?.enfermedades || 'Ninguna'}</p>
              <p><strong>Grupo sanguíneo:</strong> {e.infoMedica?.grupoSanguineo || 'Sin especificar'}</p>
              <div className="pt-8 text-right text-[10px]">
                <span className="border-t border-black px-8 pt-1">Firma y Sello Médico</span>
              </div>
            </div>
          )}

          {/* Salto de página para la impresión de cada alumno */}
          <style jsx>{`
            @media print {
              .page-break {
                page-break-after: always;
                height: 100vh;
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  )
}

export default function PaginaImpresionLote() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-600">Cargando impresión...</div>}>
      <VistaImpresionLote />
    </Suspense>
  )
}