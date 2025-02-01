import { Usuario } from "@prisma/client";
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] }; // Para múltiples archivos
      responses?: Record<string, any>; // Para respuestas dinámicas
    }
  }
}

export {};