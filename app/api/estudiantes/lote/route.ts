import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const IdsSchema = z.array(z.string().uuid()).min(1).max(200)

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean) || []
  const validacion = IdsSchema.safeParse(ids)
  if (!validacion.success) {
    return NextResponse.json({ error: 'La selección de alumnos no es válida.' }, { status: 400 })
  }

  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: { id: { in: validacion.data } },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
        curso: true,
        division: true,
        infoMedica: {
          select: {
            grupoSanguineo: true,
            alergias: true,
            medicacion: true,
            enfermedades: true,
            observaciones: true,
          },
        },
        responsables: {
          take: 1,
          orderBy: { nombre: 'asc' },
          select: { nombre: true, apellido: true, dni: true, parentesco: true, telefono: true },
        },
        documentos: {
          orderBy: { creadoEn: 'desc' },
          select: { id: true, titulo: true, nombre: true, archivoUrl: true, tipo: true, creadoEn: true },
        },
          amonestaciones: {
            orderBy: { fecha: 'desc' },
            select: { fecha: true, motivo: true, descripcion: true },
          },
      },
      orderBy: { apellido: 'asc' },
    })
    return NextResponse.json(estudiantes)
  } catch (error) {
    console.error('Error al obtener alumnos para impresión:', error)
    return NextResponse.json({ error: 'No se pudieron obtener los datos de impresión.' }, { status: 500 })
  }
}