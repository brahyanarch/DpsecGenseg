// prisma/prisma.config.ts
import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // Esto carga tu archivo .env automáticamente

export default defineConfig({
  datasource: {
    url: process.env.POSTGRESDB_URL, // Asegúrate de que este nombre coincida con tu .env
  },
});