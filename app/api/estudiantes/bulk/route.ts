'use server'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const estudianteImportadoSchema = z.object({
  dni: z.string().trim().min(7),
  nombre: z.string().trim().min(2),
  apellido: z.string().trim().min(2),
  curso: z.string().trim().min(1),
  division: z.string().trim().min(1).max(2),
  email: z.string().trim().email().optional().or(z.literal('')),
})

function valorFila(fila: Record<string, unknown>, nombres: string[]) {
  const entrada = Object.entries(fila).find(([clave]) =>
    nombres.includes(clave.trim().toLowerCase()),
  )
  return typeof entrada?.[1] === 'number' ? String(entrada[1]) : String(entrada?.[1] ?? '')
}

function normalizarFila(fila: Record<string, unknown>) {
  return {
    dni: valorFila(fila, ['dni', 'documento', 'n° documento']),
    nombre: valorFila(fila, ['nombre', 'nombres']),
    apellido: valorFila(fila, ['apellido', 'apellidos']),
    curso: valorFila(fila, ['curso', 'año', 'anio']),
    division: valorFila(fila, ['division', 'división']),
    email: valorFila(fila, ['email', 'correo']),
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'El archivo no contiene alumnos.' }, { status: 400 })
    }

    const filas = body.map((fila) => normalizarFila(fila as Record<string, unknown>))
    const validacion = z.array(estudianteImportadoSchema).safeParse(filas)
    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Cada fila debe incluir DNI, nombre, apellido, curso y división.' },
        { status: 400 },
      )
    }

    const filasUnicas = [...new Map(validacion.data.map((fila) => [fila.dni, fila])).values()]
    const cursos = new Map<string, string>()

    await prisma.$transaction(async (tx) => {
      for (const fila of filasUnicas) {
        const anio = Number.parseInt(fila.curso, 10)
        if (!Number.isInteger(anio) || anio < 1 || anio > 6) {
          throw new Error(`Curso inválido para el DNI ${fila.dni}`)
        }
        const claveCurso = `${anio}-${fila.division.toUpperCase()}`
        if (!cursos.has(claveCurso)) {
          const curso = await tx.curso.upsert({
            where: { anio_division: { anio, division: fila.division.toUpperCase() } },
            update: {},
            create: {
              anio,
              division: fila.division.toUpperCase(),
              especialidad: anio >= 4
                ? fila.division.toUpperCase() === 'A' ? 'HUMANIDADES' : 'INFORMATICA'
                : 'CICLO_BASICO',
            },
          })
          cursos.set(claveCurso, curso.id)
        }
      }

      await tx.estudiante.createMany({
        data: filasUnicas.map((fila) => ({
          dni: fila.dni,
          nombre: fila.nombre,
          apellido: fila.apellido,
          curso: fila.curso,
          division: fila.division.toUpperCase(),
          cursoId: cursos.get(`${Number.parseInt(fila.curso, 10)}-${fila.division.toUpperCase()}`),
          email: fila.email || null,
        })),
        skipDuplicates: true,
      })
    })

    return NextResponse.json({ success: true, importados: filasUnicas.length })
  } catch (error) {
    console.error('Error al importar estudiantes:', error)
    return NextResponse.json({ error: 'No se pudieron importar los alumnos.' }, { status: 500 })
  }
}
