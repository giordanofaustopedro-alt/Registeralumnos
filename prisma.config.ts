import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Usa DIRECT_URL (puerto 5432) para db push / migraciones, o cae en DATABASE_URL si no existe
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});