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
              { dni: { contains: busqueda } },
            ],
          }
        : undefined,
      orderBy: { apellido: 'asc' },
      include: {
        infoMedica: true,
        _count: {
          select: {
            responsables: true,
            historial: true,
            documentos: true,
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

    const nuevoEstudiante = await prisma.estudiante.create({
      data: {
        dni,
        nombre,
        apellido,
        curso,
        division,
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

    revalidatePath('/')
    revalidatePath('/estudiantes')
    return { success: true, data: nuevoEstudiante }
  } catch (error) {
    console.error('Error al crear estudiante:', error)
    return { success: false, error: 'Error interno al guardar el estudiante.' }
  }
}

export async function actualizarEstudiante(id: string, input: Partial<EstudianteInput>) {
  try {
    const data: any = {
      dni: input.dni,
      nombre: input.nombre,
      apellido: input.apellido,
      curso: input.curso,
      division: input.division,
      email: input.email || null,
      direccion: input.direccion || null,
    }

    const tieneInfoMedica = input.grupoSanguineo || input.alergias || input.medicacion ||
                            input.enfermedades || input.problemasCardiacos || input.observacionesMedicas

    const estudianteActualizado = await prisma.estudiante.update({
      where: { id },
      data,
    })

    if (tieneInfoMedica) {
      await prisma.infoMedica.upsert({
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