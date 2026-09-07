import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { emailConfigurado, transporter } from '@/lib/email'

async function enviarSolicitudFirma({
  nombre,
  email,
  token,
  baseUrl,
}: {
  nombre: string
  email: string
  token: string
  baseUrl: string
}) {
  const urlFirma = `${baseUrl.replace(/\/$/, '')}/firmar/profesor/${token}`
  await transporter.sendMail({
    from: `"Preceptoría Escolar" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Solicitud de firma digital',
    text: `Hola ${nombre},\n\nPodés firmar digitalmente desde este enlace (válido por 30 minutos y de un solo uso):\n${urlFirma}`,
    html: `<p>Hola ${nombre},</p><p>Podés firmar digitalmente desde este enlace:</p><p><a href="${urlFirma}">Firmar digitalmente</a></p><p>El enlace vence en 30 minutos y es de un solo uso.</p>`,
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'El profesor no es válido.' }, { status: 400 })
  }

  try {
    const cuerpo = await request.json().catch(() => ({})) as { token?: string; enviarCorreo?: boolean }
    const profesor = await prisma.profesor.findUnique({ where: { id }, select: { id: true, nombre: true, email: true } })
    if (!profesor) return NextResponse.json({ error: 'Profesor no encontrado.' }, { status: 404 })

    if (cuerpo.enviarCorreo && cuerpo.token) {
      const solicitud = await prisma.solicitudFirma.findUnique({ where: { token: cuerpo.token } })
      if (!solicitud || solicitud.profesorId !== id || solicitud.usadoEn || solicitud.expiraEn < new Date()) {
        return NextResponse.json({ error: 'El enlace de firma ya no es válido.' }, { status: 410 })
      }
      if (!profesor.email) return NextResponse.json({ error: 'El profesor no tiene un correo cargado.' }, { status: 400 })
      if (!emailConfigurado()) {
        return NextResponse.json({ error: 'Faltan EMAIL_USER y EMAIL_PASS en el entorno.' }, { status: 503 })
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
      await enviarSolicitudFirma({ nombre: profesor.nombre, email: profesor.email, token: cuerpo.token, baseUrl })
      return NextResponse.json({ enviado: true })
    }

    if (cuerpo.enviarCorreo) {
      if (!profesor.email) return NextResponse.json({ error: 'El profesor no tiene un correo cargado.' }, { status: 400 })
      if (!emailConfigurado()) {
        return NextResponse.json({ error: 'Faltan EMAIL_USER y EMAIL_PASS en el entorno.' }, { status: 503 })
      }
    }

    await prisma.solicitudFirma.updateMany({
      where: { profesorId: id, usadoEn: null },
      data: { usadoEn: new Date() },
    })

    const solicitud = await prisma.solicitudFirma.create({
      data: {
        profesorId: id,
        token: randomBytes(32).toString('hex'),
        expiraEn: new Date(Date.now() + 30 * 60 * 1000),
      },
    })

    if (cuerpo.enviarCorreo && profesor.email) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
        await enviarSolicitudFirma({ nombre: profesor.nombre, email: profesor.email, token: solicitud.token, baseUrl })
      } catch (error) {
        console.error('Error al enviar solicitud de firma con Nodemailer:', error)
        return NextResponse.json({ error: 'La solicitud se creó, pero no se pudo enviar el correo.' }, { status: 502 })
      }
    }

    return NextResponse.json({ token: solicitud.token, expiraEn: solicitud.expiraEn, email: profesor.email, enviado: Boolean(cuerpo.enviarCorreo) })
  } catch (error) {
    console.error('Error al generar solicitud de firma:', error)
    return NextResponse.json({ error: 'No se pudo generar el enlace de firma.' }, { status: 500 })
  }
}