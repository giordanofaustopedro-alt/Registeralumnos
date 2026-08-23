import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const archivo = formData.get('archivo')
    const identificador = String(formData.get('identificador') || '').trim()
    const titulo = String(formData.get('titulo') || '').trim()

    if (!(archivo instanceof File) || !identificador || !titulo) {
      return Response.json({ error: 'Faltan el archivo, el alumno o el título.' }, { status: 400 })
    }

    const alumno = await prisma.estudiante.findFirst({
      where: {
        OR: [
          { dni: identificador },
          { nombre: { contains: identificador, mode: 'insensitive' } },
          { apellido: { contains: identificador, mode: 'insensitive' } },
        ],
      },
      select: { id: true, nombre: true, apellido: true },
    })

    if (!alumno) return Response.json({ error: 'No se encontró un alumno con ese DNI o nombre.' }, { status: 404 })

    const bytes = Buffer.from(await archivo.arrayBuffer())
    const archivoUrl = `data:${archivo.type || 'application/octet-stream'};base64,${bytes.toString('base64')}`
    const documento = await prisma.documento.create({
      data: { estudianteId: alumno.id, titulo, archivoUrl, nombre: archivo.name },
      select: { id: true, titulo: true, nombre: true },
    })

    revalidatePath(`/estudiantes/${alumno.id}`)
    return Response.json({ success: true, alumno, documento })
  } catch (error) {
    console.error('Error al guardar archivo desde el chatbot:', error)
    return Response.json({ error: 'No se pudo guardar el archivo.' }, { status: 500 })
  }
}