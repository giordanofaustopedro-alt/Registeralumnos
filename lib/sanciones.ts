import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const SancionInputSchema = z.object({
  tipo: z.enum(['Amonestación', 'Suspensión', 'Llamado a padres', 'Observación'], {
    message: 'El tipo de sanción no está permitido.',
  }),
  categoria: z.enum(['Disciplina', 'Conducta', 'Falta de asistencia', 'Uso indebido de tecnología', 'Incumplimiento de tareas', 'Otro'], {
    message: 'La categoría no está permitida.',
  }),
  motivo: z.string().min(5, 'El motivo es obligatorio'),
  descripcion: z.string().optional(),
  fecha: z.coerce.date().optional(),
  profesorId: z.string().uuid().optional().or(z.literal('')),
})

export type SancionInput = z.infer<typeof SancionInputSchema>

export async function guardarSancionIdempotente(
  estudianteId: string,
  input: SancionInput,
  id: string,
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existente = await tx.sancion.findUnique({ where: { id } })
      if (existente) return { sancion: existente, creada: false }

      const sancion = await tx.sancion.create({
        data: {
          id,
          tipo: input.tipo,
          categoria: input.categoria,
          motivo: input.motivo,
          descripcion: input.descripcion || null,
          fecha: input.fecha,
          profesorId: input.profesorId || null,
          estudianteId,
        },
      })

      await tx.historial.create({
        data: {
          tipo: input.tipo,
          categoria: input.categoria,
          motivo: input.motivo,
          descripcion: input.descripcion || null,
          fecha: input.fecha,
          estudianteId,
        },
      })

      if (input.tipo === 'Amonestación') {
        await tx.amonestacion.create({
          data: {
            motivo: input.motivo,
            descripcion: input.descripcion || null,
            fecha: input.fecha,
            estudianteId,
          },
        })
      }

      return { sancion, creada: true }
    })
  } catch (error) {
    const existente = await prisma.sancion.findUnique({ where: { id } }).catch(() => null)
    if (existente) return { sancion: existente, creada: false }
    throw error
  }
}