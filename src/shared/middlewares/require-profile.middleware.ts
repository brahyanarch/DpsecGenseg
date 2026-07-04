// src/shared/middlewares/require-profile.middleware.ts

import { Request, Response, NextFunction } from "express";
import { appError } from "../../modules/user/domain/exceptions/app.Error";

export const requireProfile = (req: Request, res: Response, next: NextFunction) => {
    // Si no encuentra el activeProfile, pasamos el error al manejador global con next()
    if (!req.user?.idActiveProfile) {
        return next(new appError("403", "INVALID_PROFILE", "Debes seleccionar un rol y oficina para continuar", true));
    }
    next();
};