'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Obtener todos los recursos educativos
export async function getRecursos(categoria?: string) {
  try {
    const recursos = await prisma.recurso.findMany({
      where: categoria ? { categoria } : undefined,
      orderBy: { creadoEn: 'desc' },
    })
    return { success: true, data: recursos }
  } catch (error) {
    console.error('Error al obtener recursos:', error)
    return { success: false, error: 'No se pudieron cargar los recursos.' }
  }
}

// Crear un nuevo recurso educativo
export async function crearRecurso(formData: {
  titulo: string
  descripcion?: string
  nivelEducativo: string
  categoria: string
  archivoUrl: string
  esDescargable?: boolean
}) {
  try {
    const nuevoRecurso = await prisma.recurso.create({
      data: formData,
    })

    revalidatePath('/recursos')
    return { success: true, data: nuevoRecurso }
  } catch (error) {
    console.error('Error al crear recurso:', error)
    return { success: false, error: 'No se pudo guardar el recurso.' }
  }
}