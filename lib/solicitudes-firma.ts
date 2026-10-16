import { transporter } from '@/lib/email'

export async function enviarCorreoSolicitudFirma({
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