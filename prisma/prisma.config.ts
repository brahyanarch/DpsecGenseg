/// <reference types="node" />
import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma", // Asegúrate de que tu schema esté aquí
  datasource: {
    // Usamos process.env en lugar de env() en TypeScript
    url: process.env.POSTGRESDB_URL,
  },
});