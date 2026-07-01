// src/infrastructure/http/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../../../services/auth.service";
import { appError } from "../../../domain/exceptions/app.Error";

// Extendemos el Request de Express para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new appError("40101", "Token no proporcionado", "Authorization header is missing or invalid", true);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);

        req.user = decoded; 
        next();
    } catch (error) {
        throw new appError("40101", "Token inválido o expirado", "JWT verification failed", true);
    }
};