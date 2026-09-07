'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearProfesor, eliminarProfesor, vincularFirmaProfesor } from '@/app/actions/expediente'
import ModalSolicitarFirma from '@/app/components/modalsolicitarfirma'

type Profesor = { id: string; nombre: string; apellido: string; cargo: string; email: string | null; firmaUrl: string | null }

type Props = {
  profesores: Profesor[]
  onFirmaActualizada?: (profesorId: string, firmaUrl: string | null) => void
}

function leerFirma(archivo: File) {
  return new Promise<string>((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(String(lector.result))
    lector.onerror = () => reject(new Error('No se pudo leer la firma.'))
    lector.readAsDataURL(archivo)
  })
}

export default function GestionProfesores({ profesores, onFirmaActualizada }: Props) {
  const router = useRouter()
  const archivoRef = useRef<HTMLInputElement>(null)
  const [abierto, setAbierto] = useState(false)
  const [firma, setFirma] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [estado, setEstado] = useState<string | null>(null)
  const [profesorParaFirmar, setProfesorParaFirmar] = useState<Profesor | null>(null)
  const [firmasActualizadas, setFirmasActualizadas] = useState<Record<string, string | null>>({})
  const profesoresVisibles = profesores.map((profesor) => firmasActualizadas[profesor.id] === undefined
    ? profesor
    : { ...profesor, firmaUrl: firmasActualizadas[profesor.id] })

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCargando(true)
    setEstado(null)
    const datos = new FormData(event.currentTarget)
    try {
      const resultado = await crearProfesor({
        nombre: String(datos.get('nombre') || ''),
        apellido: String(datos.get('apellido') || ''),
        cargo: String(datos.get('cargo') || ''),
                  email: String(datos.get('email') || ''),
        firmaUrl: firma || undefined,
      })
      if (!resultado.success) throw new Error(resultado.error)
      setEstado('Profesor guardado correctamente.')
      setAbierto(false)
      setFirma(null)
      event.currentTarget.reset()
      router.refresh()
    } catch (error) {
      setEstado(error instanceof Error ? error.message : 'No se pudo guardar el profesor.')
    } finally {
      setCargando(false)
    }
  }

  async function seleccionarFirma(event: React.ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0]
    if (!archivo) return
    setEstado(null)
    if (!archivo.type.startsWith('image/')) {
      setEstado('La firma debe ser una imagen PNG, JPG o WEBP.')
      return
    }
    const firmaUrl = await leerFirma(archivo)
    if (event.target.dataset.profesorId) {
      setCargando(true)
      const resultado = await vincularFirmaProfesor(event.target.dataset.profesorId, firmaUrl)
      setEstado(resultado.success ? 'Firma vinculada correctamente.' : resultado.error || 'No se pudo vincular la firma.')
      setCargando(false)
      if (resultado.success) router.refresh()
    } else {
      setFirma(firmaUrl)
    }
  }

  async function borrarProfesor(profesor: Profesor) {
    if (!window.confirm(`¿Eliminar a ${profesor.nombre} ${profesor.apellido}? Las sanciones históricas se conservarán sin profesor vinculado.`)) return
    setCargando(true)
    setEstado(null)
    const resultado = await eliminarProfesor(profesor.id)
    setEstado(resultado.success ? 'Profesor eliminado correctamente.' : resultado.error || 'No se pudo eliminar el profesor.')
    setCargando(false)
    if (resultado.success) router.refresh()
  }

  return (
    <section className="bg-white rounded-3xl border border-cs-border p-6 shadow-sm space-y-5">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-cs-text">Profesores y firmas</h2>
          <p className="text-sm text-cs-muted mt-1">Administrá quién firma las sanciones y cargá su firma escaneada.</p>
        </div>
        <button type="button" onClick={() => { setAbierto(true); setEstado(null) }} className="px-4 py-2.5 bg-cs-green text-white rounded-xl text-sm font-bold">+ Agregar profesor</button>
      </div>

      {profesoresVisibles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profesoresVisibles.map((profesor) => (
            <div key={profesor.id} className="flex items-center gap-3 border border-cs-border rounded-xl p-3 bg-cs-surface-alt">
              <div className="w-10 h-10 rounded-full bg-cs-blue-soft text-cs-green flex items-center justify-center font-bold">{profesor.nombre[0]}{profesor.apellido[0]}</div>
              <div className="min-w-0">
                <p className="font-bold text-cs-text truncate">{profesor.apellido}, {profesor.nombre}</p>
                <p className="text-xs text-cs-muted">{profesor.cargo} · {profesor.firmaUrl ? 'Firma cargada' : 'Sin firma vinculada'}</p>
                <label className="text-xs font-bold text-cs-green cursor-pointer">
                  {profesor.firmaUrl ? 'Cambiar firma' : 'Vincular firma'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" data-profesor-id={profesor.id} onChange={seleccionarFirma} disabled={cargando} className="hidden" />
                </label>
                <button type="button" onClick={() => setProfesorParaFirmar(profesor)} disabled={cargando} className="ml-3 text-xs font-bold text-cs-green hover:underline disabled:opacity-50">
                  Firmar con QR
                </button>
                <button type="button" onClick={() => borrarProfesor(profesor)} disabled={cargando} className="ml-3 text-xs font-bold text-cs-danger hover:underline disabled:opacity-50">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-cs-muted">Todavía no hay profesores cargados.</p>}

      {abierto && (
        <form onSubmit={guardar} className="border-t border-cs-border pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-bold text-cs-text">Nombre<input name="nombre" required className="w-full mt-1 px-3 py-2.5 border border-cs-border rounded-xl bg-cs-surface" /></label>
          <label className="text-sm font-bold text-cs-text">Apellido<input name="apellido" required className="w-full mt-1 px-3 py-2.5 border border-cs-border rounded-xl bg-cs-surface" /></label>
          <label className="text-sm font-bold text-cs-text">Cargo<input name="cargo" placeholder="Profesor, Preceptor, Directivo..." required className="w-full mt-1 px-3 py-2.5 border border-cs-border rounded-xl bg-cs-surface" /></label>
          <label className="text-sm font-bold text-cs-text">Correo<input name="email" type="email" placeholder="profesor@ejemplo.com" className="w-full mt-1 px-3 py-2.5 border border-cs-border rounded-xl bg-cs-surface" /></label>
          <div>
            <span className="text-sm font-bold text-cs-text block">Firma escaneada</span>
            <input ref={archivoRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={seleccionarFirma} className="w-full mt-1 text-sm" />
            {firma && <img src={firma} alt="Vista previa de la firma" className="mt-2 h-14 max-w-48 object-contain border border-cs-border bg-white" />}
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={() => { setAbierto(false); setFirma(null) }} className="px-4 py-2.5 border border-cs-border rounded-xl font-bold text-sm">Cancelar</button>
            <button type="submit" disabled={cargando} className="px-4 py-2.5 bg-cs-green text-white rounded-xl font-bold text-sm disabled:opacity-50">{cargando ? 'Guardando...' : 'Guardar profesor'}</button>
          </div>
        </form>
      )}
      {profesorParaFirmar && (
        <ModalSolicitarFirma
          profesorId={profesorParaFirmar.id}
          profesorNombre={`${profesorParaFirmar.nombre} ${profesorParaFirmar.apellido}`}
          profesorEmail={profesorParaFirmar.email}
          onClose={() => setProfesorParaFirmar(null)}
          onFirmada={(firmaUrl) => {
            setFirmasActualizadas((actuales) => ({ ...actuales, [profesorParaFirmar.id]: firmaUrl }))
            onFirmaActualizada?.(profesorParaFirmar.id, firmaUrl)
            setProfesorParaFirmar(null)
            setEstado('Firma recibida correctamente y cargada.')
            router.refresh()
          }}
        />
      )}
      {estado && <p className="text-sm font-semibold text-cs-muted" role="status">{estado}</p>}
    </section>
  )
}
