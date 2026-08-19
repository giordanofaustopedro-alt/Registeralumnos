'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Obtener todos los cursos con sus estudiantes
export async function getCursos() {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        estudiantes: true,
      },
      orderBy: [{ anio: 'asc' }, { division: 'asc' }],
    })
    return { success: true, data: cursos }
  } catch (error) {
    console.error('Error al obtener cursos:', error)
    return { success: false, error: 'Error al cargar los cursos' }
  }
}

// 2. Sembrar la estructura escolar inicial (1° a 6°)
export async function sembrarCursos() {
  try {
    const estructura = [
      { anio: 1, division: 'A', especialidad: 'CICLO_BASICO' as const },
      { anio: 1, division: 'B', especialidad: 'CICLO_BASICO' as const },
      { anio: 2, division: 'A', especialidad: 'CICLO_BASICO' as const },
      { anio: 2, division: 'B', especialidad: 'CICLO_BASICO' as const },
      { anio: 3, division: 'A', especialidad: 'CICLO_BASICO' as const },
      { anio: 3, division: 'B', especialidad: 'CICLO_BASICO' as const },
      { anio: 4, division: 'A', especialidad: 'HUMANIDADES' as const },
      { anio: 4, division: 'B', especialidad: 'INFORMATICA' as const },
      { anio: 5, division: 'A', especialidad: 'HUMANIDADES' as const },
      { anio: 5, division: 'B', especialidad: 'INFORMATICA' as const },
      { anio: 6, division: 'A', especialidad: 'HUMANIDADES' as const },
      { anio: 6, division: 'B', especialidad: 'INFORMATICA' as const },
    ]

    for (const c of estructura) {
      await prisma.curso.upsert({
        where: {
          anio_division: { anio: c.anio, division: c.division },
        },
        update: { especialidad: c.especialidad },
        create: {
          anio: c.anio,
          division: c.division,
          especialidad: c.especialidad,
        },
      })
    }

    revalidatePath('/cursos')
    return { success: true }
  } catch (error) {
    console.error('Error al sembrar cursos:', error)
    return { success: false, error: 'No se pudieron crear los cursos.' }
  }
}

// 3. Eliminar un curso existente
export async function eliminarCurso(cursoId: string) {
  try {
    await prisma.curso.delete({
      where: { id: cursoId },
    })
    revalidatePath('/cursos')
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar curso:', error)
    return { success: false, error: 'No se pudo eliminar el curso.' }
  }
}