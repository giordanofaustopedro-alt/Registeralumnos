'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { guardarSancionIdempotente, SancionInputSchema } from '@/lib/sanciones'
import { FechaNacimientoSchema } from '@/lib/fecha-nacimiento'

const ResponsableSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres'),
  parentesco: z.string().min(2, 'El parentesco es obligatorio'),
  fechaNacimiento: FechaNacimientoSchema,
  telefono: z.string().min(6, 'El teléfono es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

const ProfesorSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio'),
  apellido: z.string().trim().min(2, 'El apellido es obligatorio'),
  cargo: z.string().trim().min(2, 'El cargo es obligatorio'),
  email: z.string().trim().email('Email inválido').optional().or(z.literal('')),
  firmaUrl: z.string().startsWith('data:image/').max(2_000_000).optional().or(z.literal('')),
})

export async function getProfesores() {
  try {
    const profesores = await prisma.profesor.findMany({
      where: { activo: true },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    })
    return { success: true, data: profesores }
  } catch (error) {
    console.error('Error al obtener profesores:', error)
    return { success: false, error: 'No se pudieron obtener los profesores.' }
  }
}

export async function crearProfesor(input: {
  nombre: string
  apellido: string
  cargo: string
  email?: string
  firmaUrl?: string
}) {
  const validacion = ProfesorSchema.safeParse(input)
  if (!validacion.success) {
    return { success: false, error: validacion.error.issues[0].message }
  }

  try {
    const profesor = await prisma.profesor.create({
      data: { ...validacion.data, email: validacion.data.email || null, firmaUrl: validacion.data.firmaUrl || null },
    })
    revalidatePath('/sanciones')
    revalidatePath('/sanciones/nueva')
    return { success: true, data: profesor }
  } catch (error) {
    console.error('Error al crear profesor:', error)
    return { success: false, error: 'No se pudo guardar el profesor.' }
  }
}

export async function vincularFirmaProfesor(profesorId: string, firmaUrl: string) {
  const validacion = z.object({
    profesorId: z.string().uuid(),
    firmaUrl: z.string().startsWith('data:image/').max(2_000_000),
  }).safeParse({ profesorId, firmaUrl })

  if (!validacion.success) {
    return { success: false, error: 'La firma debe ser una imagen válida.' }
  }

  try {
    await prisma.profesor.update({
      where: { id: profesorId },
      data: { firmaUrl },
    })
    revalidatePath('/sanciones')
    revalidatePath('/sanciones/nueva')
    return { success: true }
  } catch (error) {
    console.error('Error al vincular firma:', error)
    return { success: false, error: 'No se pudo vincular la firma.' }
  }
}

export async function eliminarProfesor(profesorId: string) {
  const validacion = z.string().uuid().safeParse(profesorId)
  if (!validacion.success) {
    return { success: false, error: 'El profesor seleccionado no es válido.' }
  }

  try {
    await prisma.profesor.delete({ where: { id: profesorId } })
    revalidatePath('/sanciones')
    revalidatePath('/sanciones/nueva')
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar profesor:', error)
    return { success: false, error: 'No se pudo eliminar el profesor.' }
  }
}

export async function agregarResponsable(
  estudianteId: string,
  input: {
    nombre: string
    dni: string
    parentesco: string
    fechaNacimiento?: string
    telefono: string
    email?: string
  }
) {
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

export async function actualizarFechaNacimientoResponsable(
  estudianteId: string,
  responsableId: string,
  fechaNacimiento: string,
) {
  const idsValidos = z.object({
    estudianteId: z.string().uuid(),
    responsableId: z.string().uuid(),
  }).safeParse({ estudianteId, responsableId })
  const fechaValidada = FechaNacimientoSchema.safeParse(fechaNacimiento)

  if (!idsValidos.success) return { success: false, error: 'El responsable no es válido.' }
  if (!fechaValidada.success) return { success: false, error: fechaValidada.error.issues[0].message }

  try {
    const actualizacion = await prisma.responsable.updateMany({
      where: { id: responsableId, estudianteId },
      data: { fechaNacimiento: fechaValidada.data },
    })
    if (actualizacion.count !== 1) return { success: false, error: 'No se encontró el responsable.' }

    revalidatePath(`/estudiantes/${estudianteId}`)
    return { success: true }
  } catch (error) {
    console.error('Error al actualizar fecha de nacimiento del responsable:', error)
    return { success: false, error: 'No se pudo guardar la fecha de nacimiento.' }
  }
}

export async function eliminarResponsable(estudianteId: string, responsableId: string) {
  const idsValidos = z.object({
    estudianteId: z.string().uuid(),
    responsableId: z.string().uuid(),
  }).safeParse({ estudianteId, responsableId })
  if (!idsValidos.success) return { success: false, error: 'El responsable seleccionado no es válido.' }

  try {
    const eliminacion = await prisma.responsable.deleteMany({
      where: { id: responsableId, estudianteId },
    })
    if (eliminacion.count !== 1) return { success: false, error: 'No se encontró el responsable.' }

    revalidatePath('/')
    revalidatePath(`/estudiantes/${estudianteId}`)
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar responsable:', error)
    return { success: false, error: 'No se pudo eliminar el responsable.' }
  }
}

export async function registrarSancion(
  estudianteId: string,
  input: {
    tipo: string
    categoria: string
    motivo: string
    descripcion?: string
    profesorId?: string
  },
  sancionId?: string,
) {
  const validacion = SancionInputSchema.safeParse(input)
  if (!validacion.success) {
    return { success: false, error: validacion.error.issues[0].message }
  }
  const idValidado = sancionId ? z.string().uuid().safeParse(sancionId) : null
  if (idValidado && !idValidado.success) {
    return { success: false, error: 'El identificador de la sanción no es válido.' }
  }

  try {
    const { sancion } = await guardarSancionIdempotente(
      estudianteId,
      validacion.data,
      idValidado?.success ? idValidado.data : randomUUID(),
    )

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

export async function agregarDocumento(
  estudianteId: string,
  data: {
    titulo: string
    archivoUrl: string
    nombre?: string
    tipo?: 'FICHA_MEDICA' | 'AUTORIZACION' | 'OTRO'
  }
) {
  try {
    const documento = await prisma.documento.create({
      data: {
        titulo: data.titulo,
        archivoUrl: data.archivoUrl,
        nombre: data.nombre,
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

export async function eliminarDocumento(estudianteId: string, documentoId: string) {
  const idsValidos = z.object({
    estudianteId: z.string().uuid(),
    documentoId: z.string().uuid(),
  }).safeParse({ estudianteId, documentoId })
  if (!idsValidos.success) return { success: false, error: 'El documento seleccionado no es válido.' }

  try {
    const eliminacion = await prisma.documento.deleteMany({
      where: { id: documentoId, estudianteId },
    })
    if (eliminacion.count !== 1) return { success: false, error: 'No se encontró el documento.' }

    revalidatePath(`/estudiantes/${estudianteId}`)
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar documento:', error)
    return { success: false, error: 'No se pudo eliminar el documento.' }
  }
}