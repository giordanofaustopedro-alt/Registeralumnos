import { z } from 'zod'

export const FechaNacimientoSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((value) => {
    if (!value) return true
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

    const fecha = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(fecha.getTime())
      && fecha.toISOString().slice(0, 10) === value
      && value <= new Date().toISOString().slice(0, 10)
  }, 'La fecha de nacimiento no es válida.')
  .transform((value) => value ? new Date(`${value}T00:00:00.000Z`) : null)

export function fechaParaInput(fecha: Date | null) {
  return fecha?.toISOString().slice(0, 10) || ''
}
