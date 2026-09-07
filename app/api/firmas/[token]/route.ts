import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { emailConfigurado, transporter } from '@/lib/email'

const FirmaSchema = z.object({
  firma: z.string().startsWith('data:image/png;base64,').max(2_000_000),
})

async function obtenerSolicitud(token: string) {
  return prisma.solicitudFirma.findUnique({
    where: { token },
    include: { profesor: { select: { nombre: true, apellido: true, firmaUrl: true } } },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const solicitud = await obtenerSolicitud(token)
  if (!solicitud) {
    return NextResponse.json({ error: 'Este enlace ya no es válido.' }, { status: 404 })
  }
  if (solicitud.usadoEn) {
    return NextResponse.json({ error: 'Este enlace ya fue utilizado.', firmada: true, firmaUrl: solicitud.profesor.firmaUrl }, { status: 410 })
  }
  if (solicitud.expiraEn < new Date()) {
    return NextResponse.json({ error: 'Este enlace venció.', firmada: false }, { status: 410 })
  }
  return NextResponse.json({ profesorNombre: `${solicitud.profesor.nombre} ${solicitud.profesor.apellido}` })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const solicitud = await obtenerSolicitud(token)
  if (!solicitud || solicitud.usadoEn || solicitud.expiraEn < new Date()) {
    return NextResponse.json({ error: 'Este enlace ya no es válido o ya fue utilizado.' }, { status: 410 })
  }

  const validacion = FirmaSchema.safeParse(await request.json().catch(() => null))
  if (!validacion.success) {
    return NextResponse.json({ error: 'La firma digital no es válida.' }, { status: 400 })
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const consumo = await tx.solicitudFirma.updateMany({
        where: { token, usadoEn: null, expiraEn: { gt: new Date() } },
        data: { usadoEn: new Date() },
      })
      if (consumo.count !== 1) return false

      await tx.profesor.update({
        where: { id: solicitud.profesorId },
        data: { firmaUrl: validacion.data.firma },
      })
      return true
    })

    if (!resultado) return NextResponse.json({ error: 'Este enlace ya fue utilizado.' }, { status: 410 })
    await notificarFirmaAlPreceptor(`${solicitud.profesor.nombre} ${solicitud.profesor.apellido}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al guardar firma digital:', error)
    return NextResponse.json({ error: 'No se pudo guardar la firma.' }, { status: 500 })
  }
}

async function notificarFirmaAlPreceptor(profesorNombre: string) {
  if (!emailConfigurado()) return

  const preceptores = await prisma.profesor.findMany({
    where: {
      activo: true,
      email: { not: null },
      cargo: { contains: 'preceptor', mode: 'insensitive' },
    },
    select: { email: true },
  })

  const envios = preceptores
    .filter((preceptor): preceptor is { email: string } => Boolean(preceptor.email))
    .map((preceptor) => transporter.sendMail({
      from: `"Preceptoría Escolar" <${process.env.EMAIL_USER}>`,
      to: preceptor.email,
      subject: 'Firma digital recibida',
      text: `El profesor ${profesorNombre} ya completó su firma digital.`,
      html: `<p>El profesor <strong>${profesorNombre}</strong> ya completó su firma digital.</p>`,
    }))

  const resultados = await Promise.allSettled(envios)
  resultados.filter((resultado) => resultado.status === 'rejected').forEach((resultado) => {
    console.error('No se pudo notificar a un preceptor:', resultado.reason)
  })
}