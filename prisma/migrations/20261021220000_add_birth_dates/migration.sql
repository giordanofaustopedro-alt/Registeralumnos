ALTER TABLE "Estudiante"
ADD COLUMN IF NOT EXISTS "fechaNacimiento" DATE;

ALTER TABLE "Responsable"
ADD COLUMN IF NOT EXISTS "fechaNacimiento" DATE;
