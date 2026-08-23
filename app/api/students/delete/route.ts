import { NextResponse } from "next/server";
import { eliminarEstudiante } from "@/app/actions/eliminar-estudiante";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await eliminarEstudiante(
      { id: body.id, dni: body.dni },
      body.confirmar === true,
    );

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo eliminar el alumno.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}