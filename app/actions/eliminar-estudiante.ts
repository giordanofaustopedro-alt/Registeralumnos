"use server";

import { prisma } from "@/lib/prisma";

type IdentificadorEstudiante = {
  id?: string;
  dni?: string;
};

export async function eliminarEstudiante(
  identificador: IdentificadorEstudiante,
  confirmar: boolean,
) {
  if (!confirmar) {
    throw new Error("La eliminación requiere confirmación explícita.");
  }

  if (!identificador.id && !identificador.dni) {
    throw new Error("Indicá el ID o DNI del alumno que querés eliminar.");
  }

  const estudiante = await prisma.estudiante.findFirst({
    where: identificador.id
      ? { id: identificador.id }
      : { dni: identificador.dni },
    select: { id: true, nombre: true, apellido: true, dni: true },
  });

  if (!estudiante) {
    throw new Error("No encontré un alumno con esos datos.");
  }

  await prisma.estudiante.delete({ where: { id: estudiante.id } });

  return {
    ok: true,
    estudiante,
  };
}