import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const promocionSchema = z.object({
  estudiantesIds: z.array(z.string().uuid()).min(1),
  nuevoCursoId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const validacion = promocionSchema.safeParse(await request.json())
    if (!validacion.success) {
      return NextResponse.json({ error: 'Seleccioná alumnos y un curso destino.' }, { status: 400 })
    }

    const { estudiantesIds, nuevoCursoId } = validacion.data
    const curso = await prisma.curso.findUnique({ where: { id: nuevoCursoId } })
    if (!curso) {
      return NextResponse.json({ error: 'El curso destino no existe.' }, { status: 404 })
    }

    const resultado = await prisma.estudiante.updateMany({
      where: { id: { in: estudiantesIds } },
      data: {
        cursoId: curso.id,
        curso: String(curso.anio),
        division: curso.division,
      },
    })

    return NextResponse.json({ success: true, actualizados: resultado.count })
  } catch (error) {
    console.error('Error al promover estudiantes:', error)
    return NextResponse.json({ error: 'No se pudo cambiar de curso.' }, { status: 500 })
  }
}
