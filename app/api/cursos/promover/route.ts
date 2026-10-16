import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const promocionSchema = z.object({
  estudiantesIds: z.array(z.string().uuid()).min(1).refine(
    (ids) => new Set(ids).size === ids.length,
    'La selección contiene alumnos repetidos.',
  ),
  nuevoCursoId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const validacion = promocionSchema.safeParse(await request.json().catch(() => null))
    if (!validacion.success) {
      return NextResponse.json({ error: validacion.error.issues[0]?.message || 'Seleccioná alumnos y un curso destino.' }, { status: 400 })
    }

    const { estudiantesIds, nuevoCursoId } = validacion.data
    const resultado = await prisma.$transaction(async (tx) => {
      const curso = await tx.curso.findUnique({ where: { id: nuevoCursoId } })
      if (!curso) return { tipo: 'curso-inexistente' as const }

      const estudiantesExistentes = await tx.estudiante.count({
        where: { id: { in: estudiantesIds } },
      })
      if (estudiantesExistentes !== estudiantesIds.length) {
        return { tipo: 'estudiante-inexistente' as const }
      }

      const actualizacion = await tx.estudiante.updateMany({
        where: { id: { in: estudiantesIds } },
        data: {
          cursoId: curso.id,
          curso: String(curso.anio),
          division: curso.division,
        },
      })
      return { tipo: 'actualizado' as const, actualizados: actualizacion.count }
    })

    if (resultado.tipo === 'curso-inexistente') {
      return NextResponse.json({ error: 'El curso destino no existe.' }, { status: 404 })
    }
    if (resultado.tipo === 'estudiante-inexistente') {
      return NextResponse.json({ error: 'Uno o más alumnos seleccionados ya no existen. Actualizá la página e intentá nuevamente.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, actualizados: resultado.actualizados })
  } catch (error) {
    console.error('Error al promover estudiantes:', error)
    return NextResponse.json({ error: 'No se pudo cambiar de curso.' }, { status: 500 })
  }
}
