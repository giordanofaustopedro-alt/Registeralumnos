'use client'

import { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import { getEstudiantePorId, getEstudiantes } from '@/app/actions/estudiantes'
import { getProfesores, registrarSancion } from '@/app/actions/expediente'
import GestionProfesores from '@/app/components/GestionProfesores'

export default function NuevaSancionPage() {
  const [estudiantes, setEstudiantes] = useState<
    Array<{
      id: string
      apellido: string | null
      nombre: string | null
      dni: string | null
      curso: string | null
      division: string | null
    }>
  >([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)
  const [profesores, setProfesores] = useState<Array<{
    id: string
    nombre: string
    apellido: string
    cargo: string
    email: string | null
    firmaUrl: string | null
  }>>([])
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<string>('')
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<{
    id: string
    nombre: string
    apellido: string
    dni: string
    curso: string | null
    division: string | null
    direccion: string | null
    sanciones: Array<{
      fecha: Date
      tipo: string
      categoria: string | null
      motivo: string
    }>
  } | null>(null)

  useEffect(() => {
    getEstudiantes().then((r) => {
      setEstudiantes(r.data || [])
      setCargandoLista(false)
    })
    getProfesores().then((r) => setProfesores(r.data || []))
  }, [])

  async function cargarEstudiante(id: string) {
    if (!id) {
      setEstudianteSeleccionado(null)
      return
    }

    const resultado = await getEstudiantePorId(id)
    if (resultado.success && resultado.data) {
      setEstudianteSeleccionado({
        id: resultado.data.id,
        nombre: resultado.data.nombre,
        apellido: resultado.data.apellido,
        dni: resultado.data.dni,
        curso: resultado.data.curso,
        division: resultado.data.division,
        direccion: resultado.data.direccion,
        sanciones: resultado.data.sanciones.map((sancion) => ({
          fecha: sancion.fecha,
          tipo: sancion.tipo,
          categoria: sancion.categoria,
          motivo: sancion.motivo,
        })),
      })
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setError(null)
    setExito(false)

    const formData = new FormData(e.currentTarget)
    const estudianteId = String(formData.get('estudianteId') || '')
    const data = {
      tipo: String(formData.get('tipo') || ''),
      categoria: String(formData.get('categoria') || ''),
      motivo: String(formData.get('motivo') || ''),
      descripcion: String(formData.get('descripcion') || ''),
      profesorId: String(formData.get('profesorId') || ''),
    }

    try {
      const resultado = await registrarSancion(estudianteId, data)
      if (!resultado.success) {
        setError(resultado.error || 'Error al registrar la sanción')
        return
      }

      if (profesorSeleccionado) {
        const profesor = profesores.find((item) => item.id === profesorSeleccionado)
        if (!profesor?.email) {
          setError('La sanción se guardó, pero el profesor seleccionado no tiene un correo cargado.')
          return
        }

        const solicitud = await fetch(`/api/profesores/${profesorSeleccionado}/solicitud-firma`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enviarCorreo: true }),
        })
        const respuestaSolicitud = await solicitud.json()
        if (!solicitud.ok) {
          setError(respuestaSolicitud.error || 'La sanción se guardó, pero no se pudo enviar la solicitud de firma.')
          return
        }
      }

      setExito(true)
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      await Promise.all(
        Array.from(document.querySelectorAll<HTMLImageElement>('.firma-impresion')).map((imagen) =>
          imagen.decode().catch(() => undefined),
        ),
      )
      window.print()
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const tipos = [
    'Amonestación',
    'Suspensión',
    'Llamado a padres',
    'Observación',
  ]
  const categorias = [
    'Disciplina',
    'Conducta',
    'Falta de asistencia',
    'Uso indebido de tecnología',
    'Incumplimiento de tareas',
    'Otro',
  ]

  const inputCls =
    'w-full px-4 py-3 border border-cs-border rounded-xl focus:outline-none focus:ring-2 focus:ring-cs-danger/30 focus:border-cs-danger/50 bg-cs-surface text-cs-text placeholder-cs-muted'
  const labelCls = 'block text-sm font-bold text-cs-text mb-2'

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 printable-sancion">
      <div className="screen-only flex justify-between items-center flex-wrap gap-4">
        <div>
          <Link
            href="/sanciones"
            className="screen-only text-sm text-cs-muted hover:text-cs-text font-bold inline-flex items-center gap-1"
          >
            ← Volver al registro
          </Link>
          <h1 className="text-3xl font-extrabold text-cs-text tracking-tight mt-3">
            Cargar Nueva Sanción
          </h1>
        </div>
      </div>

      {error && (
        <div className="screen-only p-4 bg-cs-danger-soft/70 border border-cs-danger/30 text-cs-danger rounded-2xl text-sm font-bold shadow-sm">
          ⚠️ {error}
        </div>
      )}
      {exito && (
        <div className="screen-only p-4 bg-cs-success-soft border border-cs-success/30 text-cs-green rounded-2xl text-sm font-bold shadow-sm">
          ✓ Sanción registrada correctamente. Redirigiendo...
        </div>
      )}

      <div className="screen-only">
        <GestionProfesores
          profesores={profesores}
          onFirmaActualizada={(profesorId, firmaUrl) => {
            setProfesores((actuales) => actuales.map((profesor) =>
              profesor.id === profesorId ? { ...profesor, firmaUrl } : profesor,
            ))
          }}
        />
      </div>

      <form onSubmit={handleSubmit} className="print-sheet bg-white border border-gray-300 shadow-lg">
        <header className="institution-header border-b-2 border-gray-800 pb-4">
          <div className="institution-mark">CÓRDOBA</div>
          <div className="text-center leading-tight">
            <p className="text-lg font-black uppercase">Gobierno de la Provincia de Córdoba</p>
            <p className="font-semibold">Ministerio de Educación</p>
            <p>Secretaría de Educación</p>
            <p>Dirección General de Educación Pública de Gestión Privada</p>
            <p>Inspección de Institutos Privados</p>
            <p className="font-black uppercase mt-1">Instituto &quot;Nuestra Señora de la Merced&quot;</p>
          </div>
          <div className="institution-mark">EDU</div>
        </header>

        <div className="relative py-5 text-center">
          <h2 className="text-2xl font-bold italic">Solicitud de Aplicación de Medidas Disciplinarias</h2>
          <label className="absolute right-0 top-6 text-sm font-bold">
            Parte N°:
            <input name="parteNumero" className="paper-line w-24 ml-2" />
          </label>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 text-sm mb-3">
          <label className="font-bold">Curso:
            <input value={estudianteSeleccionado ? `${estudianteSeleccionado.curso || ''} ${estudianteSeleccionado.division || ''}` : ''} readOnly className="paper-line ml-2 w-28" />
          </label>
          <label className="font-bold">Fecha:
            <input name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="paper-line ml-2 w-32" />
          </label>
          <label className="font-bold text-right">Alumno:
            <input value={estudianteSeleccionado ? `${estudianteSeleccionado.apellido}, ${estudianteSeleccionado.nombre}` : ''} readOnly className="paper-line ml-2 w-48" />
          </label>
          <label className="font-bold">DNI:
            <input value={estudianteSeleccionado?.dni || ''} readOnly className="paper-line ml-2 w-28" />
          </label>
        </div>

        <div className="screen-only mb-4">
          <label className={labelCls}>Seleccionar alumno *</label>
          {cargandoLista ? (
            <div className="w-full px-4 py-3 border border-cs-border rounded-xl bg-cs-surface-alt text-cs-muted font-medium">
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-cs-muted/40 border-t-cs-muted animate-spin" />
                Cargando estudiantes...
              </span>
            </div>
          ) : estudiantes.length === 0 ? (
            <div className="p-4 border border-dashed border-cs-border rounded-xl bg-cs-surface-alt text-cs-muted text-sm font-medium text-center">
              📭 No hay estudiantes cargados. Regístralos primero desde{' '}
              <Link
                href="/estudiantes/nuevo"
                className="text-cs-green font-bold underline"
              >
                aquí
              </Link>
              .
            </div>
          ) : (
            <select name="estudianteId" required className={inputCls} onChange={(event) => cargarEstudiante(event.target.value)}>
              <option value="">Seleccione un estudiante...</option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.apellido}, {e.nombre} — DNI: {e.dni} — {e.curso} &quot;{e.division}&quot;
                </option>
              ))}
            </select>
          )}
        </div>

        <p className="text-sm font-semibold mb-2">Señora DIRECTORA solicito que a este alumno se le aplique una medida disciplinaria por la siguiente falta:</p>
        <div className="screen-only mb-4">
          <label className={labelCls}>Profesor o preceptor que firma</label>
          <select name="profesorId" value={profesorSeleccionado} onChange={(event) => setProfesorSeleccionado(event.target.value)} className={inputCls}>
            <option value="">Seleccionar profesor...</option>
            {profesores.map((profesor) => (
              <option key={profesor.id} value={profesor.id}>{profesor.apellido}, {profesor.nombre} · {profesor.cargo}</option>
            ))}
          </select>
          {profesores.length === 0 && <p className="text-xs text-cs-muted mt-1">Agregá profesores desde la sección Profesores y firmas.</p>}
        </div>
        <div className="screen-only grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <select name="tipo" required className={inputCls}>
            <option value="">Tipo de sanción *</option>
            {tipos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
          <select name="categoria" required className={inputCls}>
            <option value="">Categoría *</option>
            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </select>
        </div>

        <input name="motivo" required placeholder="Escriba aquí la falta" className="paper-line w-full text-sm font-semibold" />
        <label className="block text-sm font-bold mt-3">Descripción de lo ocurrido:</label>
        <textarea name="descripcion" rows={4} className="paper-area w-full mt-1" />

        <div className="signature-row mt-5">
          <span className="signature-line">
            {profesores.find((profesor) => profesor.id === profesorSeleccionado)?.firmaUrl && (
              <img src={profesores.find((profesor) => profesor.id === profesorSeleccionado)?.firmaUrl || ''} alt="Firma del profesor" className="firma-impresion mx-auto h-12 max-w-40 object-contain" />
            )}
            {profesores.find((profesor) => profesor.id === profesorSeleccionado) ? `${profesores.find((profesor) => profesor.id === profesorSeleccionado)?.nombre} ${profesores.find((profesor) => profesor.id === profesorSeleccionado)?.apellido}` : 'Aclaración de la firma'}
          </span>
          <span className="signature-line">Profesor o Preceptor</span>
        </div>

        <section className="border-t-2 border-gray-800 mt-6 pt-3">
          <h3 className="text-center font-black text-lg">Medidas Disciplinarias Anteriores</h3>
          <div className="previous-measures mt-3">
            <div className="font-bold">Fecha</div><div className="font-bold">Cant. Sanciones</div><div className="font-bold">Parte N°</div><div className="font-bold">Causa de la Sanción</div>
            {estudianteSeleccionado?.sanciones.slice(0, 3).map((sancion) => (
              <Fragment key={`${sancion.fecha.toString()}-${sancion.motivo}`}>
                <div>{new Date(sancion.fecha).toLocaleDateString('es-AR')}</div><div>{sancion.tipo}</div><div>—</div><div>{sancion.motivo}</div>
              </Fragment>
            ))}
            {!estudianteSeleccionado?.sanciones.length && <div className="col-span-4 py-5 text-gray-500 italic">Sin medidas disciplinarias anteriores</div>}
          </div>
          <div className="signature-row mt-6"><span /><span className="signature-line">{profesores.find((profesor) => profesor.id === profesorSeleccionado)?.firmaUrl && <img src={profesores.find((profesor) => profesor.id === profesorSeleccionado)?.firmaUrl || ''} alt="Firma del profesor" className="firma-impresion mx-auto h-12 max-w-40 object-contain" />}Profesor o Preceptor</span></div>
        </section>

        <section className="border-t-2 border-gray-800 mt-6 pt-3">
          <h3 className="text-center font-black text-lg">Resolución</h3>
          <p className="text-sm font-semibold mt-4">Señora DIRECTORA estimo que corresponde se le aplique:</p>
          <input name="resolucion" placeholder="Medida disciplinaria / resolución" className="paper-line w-full mt-3" />
          <div className="grid grid-cols-2 gap-8 text-sm mt-5">
            <label>Día y mes: <input className="paper-line w-32" /></label>
            <span className="signature-line">Preceptor</span>
            <label>Conforme y anotado: <input className="paper-line w-40" /></label>
            <span className="signature-line">
              <img src="/firmaDirector-digital.png" alt="Firma del responsable directivo" width={100} height={120} className="firma-impresion mx-auto h-[120px] w-[100px] object-contain" />
              Responsable Directivo
            </span>
          </div>
        </section>

        <section className="border-t-2 border-gray-800 mt-6 pt-3">
          <h3 className="text-center font-black text-lg">Solicitud de Aplicación de Medidas Disciplinarias</h3>
          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
            <label>Curso: <input value={estudianteSeleccionado ? `${estudianteSeleccionado.curso || ''} ${estudianteSeleccionado.division || ''}` : ''} readOnly className="paper-line w-32" /></label>
            <label>Fecha: <input className="paper-line w-32" /></label>
            <label>Legajo N°: <input name="legajo" className="paper-line w-32" /></label>
            <label>Dirección: <input value={estudianteSeleccionado?.direccion || ''} readOnly className="paper-line w-48" /></label>
          </div>
          <p className="text-sm mt-4">Señor/a <input value={estudianteSeleccionado ? `${estudianteSeleccionado.apellido}, ${estudianteSeleccionado.nombre}` : ''} readOnly className="paper-line w-64" /> comunico a Usted que al alumno se le han aplicado las medidas indicadas por la siguiente falta.</p>
          <p className="text-sm mt-4">con estas amonestaciones suman en total <input className="paper-line w-16" />.</p>
          <div className="signature-row mt-8">
            <span />
            <span className="signature-line">
              <img src="/firmaDirector-digital.png" alt="Firma del responsable directivo" width={100} height={120} className="firma-impresion mx-auto h-[120px] w-[100px] object-contain" />
              Responsable Directivo
            </span>
          </div>
          <p className="text-center italic font-semibold mt-6">Lugar y Fecha:</p>
          <p className="italic text-sm mt-6">Me notifico de la Sanción Disciplinaria, según corresponde a lo establecido en el Acuerdo Escolar de Convivencia.</p>
          <div className="signature-row mt-12"><span /><span className="signature-line">Firma del Responsable del Alumno</span></div>
          <p className="italic font-bold text-sm mt-8">NOTA: El alumno no será admitido en el Establecimiento sin presentar este parte firmado por el padre o tutor.</p>
        </section>

        <div className="screen-only pt-4 flex justify-end gap-3">
          <Link href="/sanciones" className="px-6 py-3 border border-cs-border rounded-xl font-bold">Cancelar</Link>
          <button type="submit" disabled={cargando || estudiantes.length === 0} className="px-8 py-3 bg-cs-danger text-white font-bold rounded-xl disabled:opacity-50">
            {cargando ? 'Guardando y enviando...' : profesorSeleccionado ? 'Aplicar, enviar solicitud e imprimir' : 'Aplicar e imprimir'}
          </button>
        </div>
      </form>
    </div>
  )
}
