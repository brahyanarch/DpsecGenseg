// src/shared/types/express.d.ts
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: number; // Tu idUser
                activeProfile?: number; // Tu idUsuarioUni
            };
        }
    }
}

export {};