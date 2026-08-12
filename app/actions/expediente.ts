'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ResponsableSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres'),
  parentesco: z.string().min(2, 'El parentesco es obligatorio'),
  telefono: z.string().min(6, 'El teléfono es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

const SancionSchema = z.object({
  tipo: z.string().min(2, 'El tipo es obligatorio'),
  categoria: z.string().min(2, 'La categoría es obligatoria'),
  motivo: z.string().min(5, 'El motivo es obligatorio'),
  descripcion: z.string().optional(),
})

export async function agregarResponsable(estudianteId: string, input: {
  nombre: string
  dni: string
  parentesco: string
  telefono: string
  email?: string
}) {
  const validacion = ResponsableSchema.safeParse(input)
  if (!validacion.success) {
    return { success: false, error: validacion.error.issues[0].message }
  }

  try {
    const responsable = await prisma.responsable.create({
      data: {
        ...validacion.data,
        estudianteId,
      },
    })

    revalidatePath('/')
    revalidatePath(`/estudiantes/${estudianteId}`)
    return { success: true, data: responsable }
  } catch (error) {
    console.error('Error al agregar responsable:', error)
    return { success: false, error: 'No se pudo vincular el responsable.' }
  }
}

export async function registrarSancion(estudianteId: string, input: {
  tipo: string
  categoria: string
  motivo: string
  descripcion?: string
}) {
  const validacion = SancionSchema.safeParse(input)
  if (!validacion.success) {
    return { success: false, error: validacion.error.issues[0].message }
  }

  try {
    const sancion = await prisma.sancion.create({
      data: {
        ...validacion.data,
        estudianteId,
      },
    })

    await prisma.historial.create({
      data: {
        tipo: validacion.data.tipo,
        categoria: validacion.data.categoria,
        motivo: validacion.data.motivo,
        descripcion: validacion.data.descripcion,
        estudianteId,
      },
    })

    revalidatePath('/')
    revalidatePath('/sanciones')
    revalidatePath(`/estudiantes/${estudianteId}`)
    return { success: true, data: sancion }
  } catch (error) {
    console.error('Error al registrar sanción:', error)
    return { success: false, error: 'No se pudo guardar la sanción.' }
  }
}

export async function eliminarSancion(sancionId: string) {
  try {
    await prisma.sancion.delete({
      where: { id: sancionId },
    })

    revalidatePath('/')
    revalidatePath('/sanciones')
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar sanción:', error)
    return { success: false, error: 'Error al borrar la sanción.' }
  }
}

export async function agregarDocumento(estudianteId: string, data: {
  titulo: string
  archivoUrl: string
  tipo?: 'FICHA_MEDICA' | 'AUTORIZACION' | 'OTRO'
}) {
  try {
    const documento = await prisma.documento.create({
      data: {
        titulo: data.titulo,
        archivoUrl: data.archivoUrl,
        tipo: data.tipo || 'OTRO',
        estudianteId,
      },
    })

    revalidatePath(`/estudiantes/${estudianteId}`)
    return { success: true, data: documento }
  } catch (error) {
    console.error('Error al agregar documento:', error)
    return { success: false, error: 'No se pudo guardar el documento.' }
  }
}