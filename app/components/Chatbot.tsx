'use client'

import { useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'

function textoMensaje(message: { parts?: Array<{ type: string; text?: string }> }) {
  return (message.parts || [])
    .filter((part) => part.type === 'text')
    .map((part) => part.text || '')
    .join('')
}

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false)
  const [entrada, setEntrada] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [identificadorArchivo, setIdentificadorArchivo] = useState('')
  const [tituloArchivo, setTituloArchivo] = useState('')
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [estadoArchivo, setEstadoArchivo] = useState<string | null>(null)
  const archivoRef = useRef<HTMLInputElement>(null)
  const { messages, append, status, error } = useChat({ api: '/api/chat' })
  const cargando = status === 'submitted' || status === 'streaming'

  async function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const texto = entrada.trim()
    if (!texto || cargando) return
    setEntrada('')
    await append({ role: 'user', content: texto })
  }

  async function guardarArchivo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!archivo || !identificadorArchivo.trim() || !tituloArchivo.trim()) return

    setSubiendoArchivo(true)
    setEstadoArchivo(null)
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('identificador', identificadorArchivo.trim())
    formData.append('titulo', tituloArchivo.trim())

    try {
      const response = await fetch('/api/chat/document', { method: 'POST', body: formData })
      const resultado = await response.json()
      if (!response.ok) {
        setEstadoArchivo(resultado.error || 'No se pudo guardar el archivo.')
        return
      }
      setEstadoArchivo(`Archivo guardado en el expediente de ${resultado.alumno.apellido}, ${resultado.alumno.nombre}.`)
      setArchivo(null)
      setIdentificadorArchivo('')
      setTituloArchivo('')
      if (archivoRef.current) archivoRef.current.value = ''
    } catch {
      setEstadoArchivo('No se pudo conectar con el servidor.')
    } finally {
      setSubiendoArchivo(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="chatbot-launcher print-hide"
        aria-label="Abrir asistente escolar"
        title="Asistente escolar"
      >
        <span aria-hidden="true">✦</span>
        <span>Asistente</span>
      </button>

      {abierto && (
        <section className="chatbot-panel print-hide" aria-label="Asistente escolar">
          <header className="chatbot-header">
            <div>
              <p className="chatbot-eyebrow">Gestión Escolar</p>
              <h2>Asistente para preceptores</h2>
            </div>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">×</button>
          </header>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <strong>¿En qué te ayudo?</strong>
                <p>Podés preguntar por sanciones, responsables o pedir una redacción formal.</p>
                <div className="chatbot-examples">
                  <button type="button" onClick={() => setEntrada('¿Cuántas sanciones tiene Juan?')}>Sanciones de un alumno</button>
                  <button type="button" onClick={() => setEntrada('¿Quién es el responsable de Juan?')}>Responsable y teléfono</button>
                  <button type="button" onClick={() => setEntrada('Redactá formalmente: el alumno llegó tarde tres veces.')}>Redactar sanción</button>
                </div>
              </div>
            )}
            {messages.map((message) => {
              const texto = textoMensaje(message)
              if (!texto) return null
              return (
                <div key={message.id} className={`chatbot-message ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}>
                  {texto}
                </div>
              )
            })}
            {cargando && <div className="chatbot-message is-assistant chatbot-typing">Consultando...</div>}
            {error && <div className="chatbot-error">No se pudo responder. Revisá la API key de Gemini.</div>}
          </div>

          <input ref={archivoRef} type="file" className="hidden" onChange={(event) => {
            const seleccionado = event.target.files?.[0] || null
            setArchivo(seleccionado)
            setTituloArchivo(seleccionado?.name.replace(/\.[^/.]+$/, '') || '')
            setEstadoArchivo(null)
          }} />
          <div className="chatbot-upload">
            <button type="button" onClick={() => archivoRef.current?.click()} disabled={subiendoArchivo}>
              📎 Adjuntar archivo
            </button>
            {archivo && (
              <form onSubmit={guardarArchivo} className="chatbot-upload-form">
                <span className="chatbot-file-name">{archivo.name}</span>
                <input value={identificadorArchivo} onChange={(event) => setIdentificadorArchivo(event.target.value)} placeholder="DNI o nombre del alumno" required />
                <input value={tituloArchivo} onChange={(event) => setTituloArchivo(event.target.value)} placeholder="Título del documento" required />
                <button type="submit" disabled={subiendoArchivo}>{subiendoArchivo ? 'Guardando...' : 'Guardar en expediente'}</button>
              </form>
            )}
            {estadoArchivo && <p className="chatbot-upload-status">{estadoArchivo}</p>}
          </div>

          <form onSubmit={enviar} className="chatbot-form">
            <input value={entrada} onChange={(event) => setEntrada(event.target.value)} placeholder="Escribí tu consulta..." disabled={cargando} />
            <button type="submit" disabled={!entrada.trim() || cargando} aria-label="Enviar consulta">➜</button>
          </form>
        </section>
      )}
    </>
  )
}
