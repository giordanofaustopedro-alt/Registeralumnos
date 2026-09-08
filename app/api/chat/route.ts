import { google } from '@ai-sdk/google'
import { convertToCoreMessages, streamText, tool } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { eliminarEstudiante } from '@/app/actions/estudiantes'

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const messages = convertToCoreMessages(body.messages || [])

    const result = streamText({
      model: google('gemini-3.6-flash'),
      system: `Sos el asistente de Gestión Escolar para preceptores y directivos.
    Cuando te pregunten por alumnos nuevos, recientes o agregados últimamente, usa la herramienta alumnosRecientes.
    Para eliminar, primero pide confirmación mostrando nombre, apellido y DNI; solo usa eliminarAlumno después de una confirmación explícita.
Respondé siempre en español, con claridad y sin inventar datos.
Podés consultar alumnos, sanciones y responsables usando las herramientas disponibles.
Si una consulta requiere datos que no encontrás, decilo explícitamente.
No reveles información de un alumno que no sea necesaria para responder la pregunta.
Para redactar una sanción, transformá el relato informal en un texto formal, objetivo y respetuoso, sin agregar hechos que no fueron proporcionados.
Podés crear alumnos solo cuando el usuario proporcione todos los datos obligatorios y confirme que desea guardarlos. Antes de crear, buscá el DNI para evitar duplicados.`,
      messages,
      maxSteps: 4,
      tools: {
        crearAlumno: tool({
          description: 'Crea un alumno nuevo en la base de datos después de confirmar todos sus datos.',
          parameters: z.object({
            dni: z.string().min(7),
            nombre: z.string().min(2),
            apellido: z.string().min(2),
            curso: z.string().regex(/^[1-6](°)?$/, 'El curso debe ser del 1 al 6.'),
            division: z.enum(['A', 'B']),
            email: z.string().email().optional(),
            direccion: z.string().optional(),
          }),
          execute: async ({ dni, nombre, apellido, curso, division, email, direccion }) => {
            const existe = await prisma.estudiante.findUnique({ where: { dni } })
            if (existe) return { creado: false, mensaje: 'Ya existe un alumno con ese DNI.', alumnoId: existe.id }

            const anio = Number.parseInt(curso, 10)
            const especialidad = anio >= 4
              ? division === 'A' ? 'HUMANIDADES' : 'INFORMATICA'
              : 'CICLO_BASICO'

            const alumno = await prisma.$transaction(async (tx) => {
              const cursoRef = await tx.curso.upsert({
                where: { anio_division: { anio, division } },
                update: {},
                create: { anio, division, especialidad },
              })
              return tx.estudiante.create({
                data: {
                  dni,
                  nombre,
                  apellido,
                  curso,
                  division,
                  email: email || null,
                  direccion: direccion || null,
                  cursoRef: { connect: { id: cursoRef.id } },
                },
                select: { id: true, nombre: true, apellido: true, dni: true, curso: true, division: true },
              })
            })

            return { creado: true, alumno }
          },
        }),
        buscarAlumno: tool({
          description: 'Busca alumnos por nombre, apellido o DNI y devuelve datos básicos.',
          parameters: z.object({
            busqueda: z.string().min(2),
          }),
          execute: async ({ busqueda }) => {
            const alumnos = await prisma.estudiante.findMany({
              where: {
                OR: [
                  { nombre: { contains: busqueda, mode: 'insensitive' } },
                  { apellido: { contains: busqueda, mode: 'insensitive' } },
                  { dni: { contains: busqueda, mode: 'insensitive' } },
                ],
              },
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                curso: true,
                division: true,
                _count: { select: { sanciones: true, amonestaciones: true } },
              },
              take: 10,
              orderBy: { apellido: 'asc' },
            })
            return alumnos
          },
        }),
        alumnosRecientes: tool({
          description: 'Devuelve los alumnos agregados recientemente, ordenados desde el ultimo incorporado.',
          parameters: z.object({
            dias: z.number().int().min(1).max(365).default(30),
            limite: z.number().int().min(1).max(50).default(10),
          }),
          execute: async ({ dias, limite }) => {
            const desde = new Date()
            desde.setDate(desde.getDate() - dias)

            return prisma.estudiante.findMany({
              where: { creadoEn: { gte: desde } },
              select: {
                id: true,
                nombre: true,
                apellido: true,
                dni: true,
                curso: true,
                division: true,
                creadoEn: true,
              },
              orderBy: { creadoEn: 'desc' },
              take: limite,
            })
          },
        }),
        eliminarAlumno: tool({
          description: 'Elimina un alumno solo despues de que el usuario confirme explicitamente la operacion.',
          parameters: z.object({
            alumnoId: z.string(),
            confirmar: z.boolean(),
          }),
          execute: async ({ alumnoId, confirmar }) => {
            if (!confirmar) {
              return { eliminado: false, mensaje: 'Falta confirmacion explicita.' }
            }

            const resultado = await eliminarEstudiante(alumnoId)
            return {
              eliminado: resultado.success,
              mensaje: resultado.success
                ? 'El alumno fue eliminado correctamente.'
                : resultado.error,
            }
          },
        }),
        consultarSanciones: tool({
          description: 'Consulta las sanciones y amonestaciones registradas de un alumno.',
          parameters: z.object({
            alumnoId: z.string().optional(),
            nombreODni: z.string().optional(),
          }),
          execute: async ({ alumnoId, nombreODni }) => {
            let id = alumnoId
            if (!id && nombreODni) {
              const alumno = await prisma.estudiante.findFirst({
                where: {
                  OR: [
                    { nombre: { contains: nombreODni, mode: 'insensitive' } },
                    { apellido: { contains: nombreODni, mode: 'insensitive' } },
                    { dni: { contains: nombreODni, mode: 'insensitive' } },
                  ],
                },
                select: { id: true },
              })
              id = alumno?.id
            }
            if (!id) return { encontrado: false, mensaje: 'No se encontró el alumno.' }

            const sanciones = await prisma.sancion.findMany({
              where: { estudianteId: id },
              select: { fecha: true, tipo: true, categoria: true, motivo: true, descripcion: true },
              orderBy: { fecha: 'desc' },
            })
            return { encontrado: true, cantidad: sanciones.length, sanciones }
          },
        }),
        consultarResponsable: tool({
          description: 'Consulta los responsables y sus teléfonos de un alumno.',
          parameters: z.object({
            alumnoId: z.string().optional(),
            nombreODni: z.string().optional(),
          }),
          execute: async ({ alumnoId, nombreODni }) => {
            let id = alumnoId
            if (!id && nombreODni) {
              const alumno = await prisma.estudiante.findFirst({
                where: {
                  OR: [
                    { nombre: { contains: nombreODni, mode: 'insensitive' } },
                    { apellido: { contains: nombreODni, mode: 'insensitive' } },
                    { dni: { contains: nombreODni, mode: 'insensitive' } },
                  ],
                },
                select: { id: true },
              })
              id = alumno?.id
            }
            if (!id) return { encontrado: false, mensaje: 'No se encontró el alumno.' }

            const responsables = await prisma.responsable.findMany({
              where: { estudianteId: id },
              select: { nombre: true, apellido: true, parentesco: true, telefono: true, email: true },
            })
            return { encontrado: true, responsables }
          },
        }),
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error en el asistente de Gemini:', error)
    return Response.json({ error: 'No se pudo iniciar el asistente.' }, { status: 500 })
  }
}
