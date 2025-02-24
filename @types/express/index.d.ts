import { Request } from 'express';
import { User, Usuario } from "../../src/models/interface/user.interface"

declare global {
  namespace Express {
    interface Request {
      user?: User;
      usuario?: Usuario;
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] }; // Para múltiples archivos
      responses?: Record<string, any>; // Para respuestas dinámicas
    }
  }
}

export {};