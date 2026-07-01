import { Request, Response, NextFunction } from "express";
import { UserValidator } from "./validation/user.validation";

export const validateUserRegister = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Si la validación falla, lanza el error y el catch lo atrapa
        UserValidator.validateRegister(req.body);
        
        // Si pasa, continúa al controlador
        next();
    } catch (error) {
        // Pasamos el error al manejador de errores global
        next(error);
    }
};