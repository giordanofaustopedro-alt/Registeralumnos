import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { emailConfigurado } from '@/lib/email'
import { enviarCorreoSolicitudFirma } from '@/lib/solicitudes-firma'
import { guardarSancionIdempotente, SancionInputSchema } from '@/lib/sanciones'

const SolicitudSchema = z.object({
  id: z.string().uuid(),
  estudianteId: z.string().uuid(),
  ...SancionInputSchema.shape,
})

export async function POST(request: Request) {
  const validacion = SolicitudSchema.safeParse(await request.json().catch(() => null))
  if (!validacion.success) {
    return NextResponse.json({ error: validacion.error.issues[0]?.message || 'Los datos de la sanción no son válidos.' }, { status: 400 })
  }

  const { id, estudianteId, ...entrada } = validacion.data

  try {
    const { sancion, creada } = await guardarSancionIdempotente(estudianteId, entrada, id)
    if (creada) {
      revalidatePath('/')
      revalidatePath('/sanciones')
      revalidatePath(`/estudiantes/${estudianteId}`)
    }
    if (!entrada.profesorId) return NextResponse.json({ success: true, emailSent: false })

    try {
      const profesor = await prisma.profesor.findUnique({
        where: { id: entrada.profesorId },
        select: { id: true, nombre: true, email: true },
      })
      if (!profesor?.email) {
        return NextResponse.json({
          success: true,
          emailSent: false,
          emailError: 'No se envió la solicitud de firma porque el profesor no tiene un correo cargado.',
        })
      }
      if (!emailConfigurado()) {
        return NextResponse.json({
          success: true,
          emailSent: false,
          emailError: 'La sanción quedó registrada, pero falta configurar el correo para enviar la solicitud de firma.',
        })
      }

      const token = id.replaceAll('-', '')
      const solicitudExistente = await prisma.solicitudFirma.findUnique({ where: { token } })
      if (solicitudExistente?.usadoEn) {
        return NextResponse.json({ success: true, emailSent: false })
      }
      if (solicitudExistente && solicitudExistente.profesorId !== profesor.id) {
        return NextResponse.json({
          success: true,
          emailSent: false,
          emailError: 'La sanción quedó registrada, pero la solicitud de firma pertenece a otro profesor.',
        })
      }

      await prisma.solicitudFirma.updateMany({
        where: { profesorId: profesor.id, usadoEn: null, token: { not: token } },
        data: { usadoEn: new Date() },
      })

      const expiraEn = new Date(Date.now() + 30 * 60 * 1000)
      const solicitud = solicitudExistente
        ? await prisma.solicitudFirma.update({
            where: { token },
            data: { expiraEn },
          })
        : await prisma.solicitudFirma.create({
            data: {
              profesorId: profesor.id,
              token,
              expiraEn,
            },
          })

      await enviarCorreoSolicitudFirma({
        nombre: profesor.nombre,
        email: profesor.email,
        token: solicitud.token,
        baseUrl: process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin,
      })

      return NextResponse.json({ success: true, emailSent: true, sanctionId: sancion.id })
    } catch (error) {
      console.error('Error al enviar la solicitud de firma:', error)
      return NextResponse.json({
        success: true,
        emailSent: false,
        emailError: 'La sanción quedó registrada, pero no se pudo enviar la solicitud de firma.',
      })
    }
  } catch (error) {
    console.error('Error al registrar sanción:', error)
    return NextResponse.json({ error: 'No se pudo guardar la sanción en el servidor.' }, { status: 503 })
  }
}
