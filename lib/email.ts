import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  ...(process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
      }
    : { service: 'gmail' }),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export function emailConfigurado() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS)
}