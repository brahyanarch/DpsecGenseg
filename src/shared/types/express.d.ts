// src/shared/types/express.d.ts
import { Request } from 'express';
import { SecurityContext } from './security';

declare global {
    namespace Express {
        interface Request {
            user?: any;
            securityContext?: SecurityContext;
        }
    }
}

export {};