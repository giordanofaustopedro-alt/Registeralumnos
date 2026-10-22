-- Baseline for the existing PostgreSQL schema.
-- On the existing database this migration is marked as applied, not executed.
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "Especialidad" AS ENUM ('HUMANIDADES', 'INFORMATICA', 'CICLO_BASICO');
CREATE TYPE "TipoResponsable" AS ENUM ('PADRE', 'MADRE', 'TUTOR');
CREATE TYPE "TipoDocumento" AS ENUM ('FICHA_MEDICA', 'AUTORIZACION', 'OTRO');

CREATE TABLE "Curso" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "division" TEXT NOT NULL,
    "especialidad" "Especialidad" DEFAULT 'CICLO_BASICO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Estudiante" (
    "id" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fechaNacimiento" DATE,
    "curso" TEXT,
    "division" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "cursoId" TEXT,
    "direccion" TEXT,
    "email" TEXT,
    "fotoUrl" TEXT,
    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Responsable" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "parentesco" TEXT,
    "nombre" TEXT NOT NULL,
    "dni" TEXT,
    "fechaNacimiento" DATE,
    "telefono" TEXT,
    "email" TEXT,
    "apellido" TEXT,
    "direccion" TEXT,
    "tipo" "TipoResponsable",
    CONSTRAINT "Responsable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InfoMedica" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "grupoSanguineo" TEXT,
    "alergias" TEXT,
    "medicacion" TEXT,
    "enfermedades" TEXT,
    "observaciones" TEXT,
    "problemasCardiacos" TEXT,
    CONSTRAINT "InfoMedica_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre" TEXT,
    "tipo" "TipoDocumento" NOT NULL DEFAULT 'OTRO',
    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Amonestacion" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Amonestacion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Sancion" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT,
    "motivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,
    "fechaFirma" TIMESTAMP(3),
    "firmadaPorEstudiante" BOOLEAN NOT NULL DEFAULT false,
    "profesorId" TEXT,
    CONSTRAINT "Sancion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profesor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "firmaUrl" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    CONSTRAINT "Profesor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SolicitudFirma" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "profesorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    CONSTRAINT "SolicitudFirma_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Historial" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT,
    "motivo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Historial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recurso" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "nivelEducativo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "archivoUrl" TEXT NOT NULL,
    "esDescargable" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recurso_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Curso_anio_division_key" ON "Curso"("anio", "division");
CREATE UNIQUE INDEX "Estudiante_dni_key" ON "Estudiante"("dni");
CREATE INDEX "Estudiante_dni_idx" ON "Estudiante"("dni");
CREATE INDEX "Estudiante_apellido_nombre_idx" ON "Estudiante"("apellido", "nombre");
CREATE INDEX "Responsable_estudianteId_idx" ON "Responsable"("estudianteId");
CREATE UNIQUE INDEX "InfoMedica_estudianteId_key" ON "InfoMedica"("estudianteId");
CREATE INDEX "Documento_estudianteId_idx" ON "Documento"("estudianteId");
CREATE INDEX "Amonestacion_estudianteId_idx" ON "Amonestacion"("estudianteId");
CREATE INDEX "Sancion_profesorId_idx" ON "Sancion"("profesorId");
CREATE INDEX "Sancion_estudianteId_idx" ON "Sancion"("estudianteId");
CREATE INDEX "Profesor_apellido_nombre_idx" ON "Profesor"("apellido", "nombre");
CREATE UNIQUE INDEX "SolicitudFirma_token_key" ON "SolicitudFirma"("token");
CREATE INDEX "SolicitudFirma_profesorId_idx" ON "SolicitudFirma"("profesorId");
CREATE INDEX "SolicitudFirma_expiraEn_idx" ON "SolicitudFirma"("expiraEn");
CREATE INDEX "Historial_estudianteId_idx" ON "Historial"("estudianteId");

ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Responsable" ADD CONSTRAINT "Responsable_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InfoMedica" ADD CONSTRAINT "InfoMedica_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Amonestacion" ADD CONSTRAINT "Amonestacion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Sancion" ADD CONSTRAINT "Sancion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Sancion" ADD CONSTRAINT "Sancion_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SolicitudFirma" ADD CONSTRAINT "SolicitudFirma_profesorId_fkey" FOREIGN KEY ("profesorId") REFERENCES "Profesor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Historial" ADD CONSTRAINT "Historial_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;
