import { NextResponse } from 'next/server'
import { emailConfigurado, transporter } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { emailProfesor, nombreProfesor, token, nombreAlumno } = await req.json()
    if (!emailProfesor || !token) {
      return NextResponse.json({ error: 'Faltan el correo del profesor o el token de firma.' }, { status: 400 })
    }
    if (!emailConfigurado()) {
      return NextResponse.json({ error: 'Faltan EMAIL_USER y EMAIL_PASS en el entorno.' }, { status: 503 })
    }

    // Detecta la URL automáticamente según dónde esté corriendo el sistema
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const linkFirma = `${baseUrl.replace(/\/$/, '')}/firmar/profesor/${token}`

    await transporter.sendMail({
      from: `"Preceptoría Escolar" <${process.env.EMAIL_USER}>`,
      to: emailProfesor, // Puede ser cualquier correo (@gmail, @hotmail, etc.)
      subject: `Solicitud de Firma: Sanción de ${nombreAlumno}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hola, ${nombreProfesor}</h2>
          <p>Se ha generado una solicitud de firma para el estudiante <strong>${nombreAlumno}</strong>.</p>
          <p>Puedes firmar directamente desde tu celular ingresando al siguiente enlace:</p>
          <p style="margin: 20px 0;">
            <a href="${linkFirma}" 
               style="background-color: #047857; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Firmar Sanción
            </a>
          </p>
          <p style="font-size: 12px; color: #666;">Enlace directo: ${linkFirma}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error enviando email:', error)
    return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 })
  }
}