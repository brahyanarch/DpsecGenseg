import { Request, Response, NextFunction } from "express";
import { appError } from "../../../domain/exceptions/app.Error";

export const checkPermission = (permissionName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const securityContext = (req as any).securityContext;

            if (!securityContext) {
                throw new appError("50001", "Contexto de seguridad no resuelto", "Security context missing", true);
            }

            if (!securityContext.permissions.includes(permissionName)) {
                throw new appError("40301", `No tienes el permiso necesario: ${permissionName}`, `Missing permission: ${permissionName}`, true);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

