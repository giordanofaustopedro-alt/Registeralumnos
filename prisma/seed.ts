import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Limpiando datos antiguos...')

  await prisma.historial.deleteMany()
  await prisma.sancion.deleteMany()
  await prisma.amonestacion.deleteMany()
  await prisma.documento.deleteMany()
  await prisma.infoMedica.deleteMany()
  await prisma.responsable.deleteMany()
  await prisma.estudiante.deleteMany()
  await prisma.recurso.deleteMany()

  console.log('🚀 Cargando datos iniciales...')

  await prisma.recurso.createMany({
    data: [
      {
        titulo: 'Guía de Ejercicios de Álgebra',
        descripcion: 'Ejercicios resueltos y prácticos para nivel secundario.',
        nivelEducativo: 'Secundaria',
        categoria: 'Matemática',
        archivoUrl: 'https://ejemplo.com/recursos/algebra_guias.pdf',
        esDescargable: true,
      },
      {
        titulo: 'Compendio de Lectura Breve',
        descripcion: 'Cuentos seleccionados para análisis sintáctico.',
        nivelEducativo: 'Primaria',
        categoria: 'Lengua',
        archivoUrl: 'https://ejemplo.com/recursos/lecturas.pdf',
        esDescargable: true,
      },
      {
        titulo: 'Atlas Geográfico Interactivo',
        descripcion: 'Mapas y actividades de geografía argentina y mundial.',
        nivelEducativo: 'Secundaria',
        categoria: 'Geografía',
        archivoUrl: 'https://ejemplo.com/recursos/atlas.pdf',
        esDescargable: true,
      },
    ],
  })

  await prisma.estudiante.create({
    data: {
      dni: '45123456',
      nombre: 'Mateo',
      apellido: 'González',
      email: 'mateo.gonzalez@escuela.edu.ar',
      direccion: 'Av. San Martín 1234, Córdoba',
      curso: '5°',
      division: 'A',
      responsables: {
        create: [
          {
            nombre: 'Carlos González',
            apellido: 'González',
            dni: '22123456',
            parentesco: 'Padre',
            tipo: 'PADRE',
            telefono: '+5493511234567',
            email: 'carlos.gonzalez@example.com',
            direccion: 'Av. San Martín 1234, Córdoba',
          },
          {
            nombre: 'María López',
            apellido: 'López',
            dni: '23987654',
            parentesco: 'Madre',
            tipo: 'MADRE',
            telefono: '+5493519876543',
            email: 'maria.lopez@example.com',
          },
        ],
      },
      infoMedica: {
        create: {
          grupoSanguineo: 'A+',
          alergias: 'Penicilina',
          medicacion: 'Ninguna',
          enfermedades: 'Asma bronquial leve',
          problemasCardiacos: 'Sin antecedentes',
          observaciones: 'Apto para realizar educación física. Requiere inhalador de rescate.',
        },
      },
      documentos: {
        create: [
          {
            titulo: 'Ficha Médica 2026',
            tipo: 'FICHA_MEDICA',
            archivoUrl: 'https://ejemplo.com/docs/ficha_mateo.pdf',
          },
          {
            titulo: 'Autorización Salida de Campo',
            tipo: 'AUTORIZACION',
            archivoUrl: 'https://ejemplo.com/docs/autorizacion_campo_mateo.pdf',
          },
        ],
      },
      sanciones: {
        create: [
          {
            tipo: 'Apercibimiento',
            categoria: 'Llegada tarde',
            motivo: 'Ingresó 20 minutos tarde a la primera hora.',
            descripcion: 'Se le comunicó a padre por teléfono.',
          },
        ],
      },
      historial: {
        create: [
          {
            tipo: 'Apercibimiento',
            categoria: 'Llegada tarde',
            motivo: 'Ingresó 20 minutos tarde a la primera hora.',
            descripcion: 'Se le comunicó a padre por teléfono.',
          },
          {
            tipo: 'Observación positiva',
            categoria: 'Participación',
            motivo: 'Destacada participación en el acto del Día de la Patria.',
          },
        ],
      },
    },
  })

  await prisma.estudiante.create({
    data: {
      dni: '46987654',
      nombre: 'Sofía',
      apellido: 'López',
      email: 'sofia.lopez@escuela.edu.ar',
      curso: '4°',
      division: 'B',
      responsables: {
        create: [
          {
            nombre: 'Laura Martínez',
            apellido: 'Martínez',
            dni: '25987654',
            parentesco: 'Madre',
            tipo: 'MADRE',
            telefono: '+5493517654321',
            email: 'laura.martinez@example.com',
          },
        ],
      },
      infoMedica: {
        create: {
          grupoSanguineo: '0+',
          alergias: 'Polen, ácaros',
          medicacion: 'Antihistamínico en temporada de alergias',
          enfermedades: 'Rinitis alérgica',
          problemasCardiacos: 'Sin antecedentes',
          observaciones: 'Se recomienda actividad física moderada en días de alta polinización.',
        },
      },
      documentos: {
        create: [
          {
            titulo: 'Autorización Salida de Campo',
            tipo: 'AUTORIZACION',
            archivoUrl: 'https://ejemplo.com/docs/autorizacion_sofia.pdf',
          },
        ],
      },
      amonestaciones: {
        create: [
          {
            motivo: 'Uso de celular en clase',
            descripcion: 'Celular decomisado y devuelto a madre al finalizar la jornada.',
          },
        ],
      },
      historial: {
        create: [
          {
            tipo: 'Amonestación',
            categoria: 'Disciplina',
            motivo: 'Uso de celular en clase',
            descripcion: 'Celular decomisado y devuelto a madre al finalizar la jornada.',
          },
        ],
      },
    },
  })

  await prisma.estudiante.create({
    data: {
      dni: '47321987',
      nombre: 'Lucas',
      apellido: 'Fernández',
      curso: '3°',
      division: 'C',
      email: 'lucas.fernandez@escuela.edu.ar',
      infoMedica: {
        create: {
          grupoSanguineo: 'B-',
          alergias: 'Ninguna',
          medicacion: 'Ninguna',
          enfermedades: 'Ninguna',
          problemasCardiacos: 'Sin antecedentes',
          observaciones: 'Apto físico completo.',
        },
      },
    },
  })

  console.log('✅ ¡Base de datos poblada con éxito!')
  console.log('📚 3 estudiantes cargados')
  console.log('📄 3 recursos educativos cargados')
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })