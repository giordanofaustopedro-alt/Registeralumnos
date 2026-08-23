'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const EstudianteSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres'),
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  apellido: z.string().min(2, 'El apellido es obligatorio'),
  curso: z.string().min(1, 'El curso es obligatorio'),
  division: z.string().min(1, 'La división es obligatoria'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  grupoSanguineo: z.string().optional(),
  alergias: z.string().optional(),
  medicacion: z.string().optional(),
  enfermedades: z.string().optional(),
  problemasCardiacos: z.string().optional(),
  observacionesMedicas: z.string().optional(),
})

export type EstudianteInput = z.infer<typeof EstudianteSchema>

export async function getEstudiantes(busqueda?: string) {
  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: busqueda
        ? {
            OR: [
              { nombre: { contains: busqueda, mode: 'insensitive' } },
              { apellido: { contains: busqueda, mode: 'insensitive' } },
              { dni: { contains: busqueda, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { apellido: 'asc' },
      select: {
        id: true,
        dni: true,
        nombre: true,
        apellido: true,
        curso: true,
        division: true,
        email: true,
        direccion: true,
        infoMedica: true,
        _count: {
          select: {
            responsables: true,
            historial: true,
            documentos: true,
            sanciones: true,       // Contador optimizado para métricas
            amonestaciones: true,  // Contador optimizado para métricas
          },
        },
      },
    })
    return { success: true, data: estudiantes }
  } catch (error) {
    console.error('Error al obtener estudiantes:', error)
    return { success: false, error: 'No se pudieron obtener los estudiantes.' }
  }
}

export async function getEstudiantePorId(id: string) {
  try {
    const estudiante = await prisma.estudiante.findUnique({
      where: { id },
      include: {
        responsables: true,
        infoMedica: true,
        documentos: true,
        historial: {
          orderBy: { fecha: 'desc' },
        },
        sanciones: {
          orderBy: { fecha: 'desc' },
        },
        amonestaciones: {
          orderBy: { fecha: 'desc' },
        },
      },
    })

    if (!estudiante) {
      return { success: false, error: 'Estudiante no encontrado.' }
    }

    return { success: true, data: estudiante }
  } catch (error) {
    console.error('Error al obtener el expediente:', error)
    return { success: false, error: 'Error al consultar el expediente.' }
  }
}

export async function crearEstudiante(input: EstudianteInput) {
  const validacion = EstudianteSchema.safeParse(input)

  if (!validacion.success) {
    return {
      success: false,
      error: validacion.error.issues[0].message,
    }
  }

  const {
    dni,
    nombre,
    apellido,
    curso,
    division,
    email,
    direccion,
    grupoSanguineo,
    alergias,
    medicacion,
    enfermedades,
    problemasCardiacos,
    observacionesMedicas,
  } = validacion.data

  try {
    const existe = await prisma.estudiante.findUnique({ where: { dni } })
    if (existe) {
      return { success: false, error: 'Ya existe un estudiante registrado con ese DNI.' }
    }

    const anio = Number.parseInt(curso, 10) 
    const especialidad = anio >= 4
      ? division === 'A' ? 'HUMANIDADES' : 'INFORMATICA'
      : 'CICLO_BASICO'

    const nuevoEstudiante = await prisma.$transaction(async (tx) => {
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
          cursoRef: { connect: { id: cursoRef.id } },
          email: email || null,
          direccion: direccion || null,
          infoMedica: {
            create: {
              grupoSanguineo: grupoSanguineo || 'Sin especificar',
              alergias: alergias || 'Ninguna',
              medicacion: medicacion || 'Ninguna',
              enfermedades: enfermedades || 'Ninguna',
              problemasCardiacos: problemasCardiacos || 'Sin antecedentes',
              observaciones: observacionesMedicas || '',
            },
          },
        },
      })
    })

    revalidatePath('/')
    revalidatePath('/estudiantes')
    revalidatePath('/cursos')
    return { success: true, data: nuevoEstudiante }
  } catch (error) {
    console.error('Error al crear estudiante:', error)
    return { success: false, error: 'Error interno al guardar el estudiante.' }
  }
}

export async function actualizarEstudiante(id: string, input: Partial<EstudianteInput>) {
  try {
    const data: {
      dni?: string
      nombre?: string
      apellido?: string
      curso?: string
      division?: string
      email?: string | null
      direccion?: string | null
    } = {
      dni: input.dni,
      nombre: input.nombre,
      apellido: input.apellido,
      curso: input.curso,
      division: input.division,
      email: input.email !== undefined ? (input.email || null) : undefined,
      direccion: input.direccion !== undefined ? (input.direccion || null) : undefined,
    }

    const tieneInfoMedica =
      input.grupoSanguineo !== undefined ||
      input.alergias !== undefined ||
      input.medicacion !== undefined ||
      input.enfermedades !== undefined ||
      input.problemasCardiacos !== undefined ||
      input.observacionesMedicas !== undefined

    // Operación atómica en una sola transacción para mejorar performance
    const estudianteActualizado = await prisma.$transaction(async (tx) => {
      const estudiante = await tx.estudiante.update({
        where: { id },
        data,
      })

      if (tieneInfoMedica) {
        await tx.infoMedica.upsert({
          where: { estudianteId: id },
          update: {
            grupoSanguineo: input.grupoSanguineo,
            alergias: input.alergias,
            medicacion: input.medicacion,
            enfermedades: input.enfermedades,
            problemasCardiacos: input.problemasCardiacos,
            observaciones: input.observacionesMedicas,
          },
          create: {
            estudianteId: id,
            grupoSanguineo: input.grupoSanguineo || 'Sin especificar',
            alergias: input.alergias || 'Ninguna',
            medicacion: input.medicacion || 'Ninguna',
            enfermedades: input.enfermedades || 'Ninguna',
            problemasCardiacos: input.problemasCardiacos || 'Sin antecedentes',
            observaciones: input.observacionesMedicas || '',
          },
        })
      }

      return estudiante
    })

    revalidatePath('/')
    revalidatePath('/estudiantes')
    revalidatePath(`/estudiantes/${id}`)
    return { success: true, data: estudianteActualizado }
  } catch (error) {
    console.error('Error al actualizar estudiante:', error)
    return { success: false, error: 'No se pudo actualizar la información.' }
  }
}

export async function eliminarEstudiante(id: string) {
  try {
    await prisma.estudiante.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/estudiantes')
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar estudiante:', error)
    return { success: false, error: 'No se pudo eliminar el alumno.' }
  }
}