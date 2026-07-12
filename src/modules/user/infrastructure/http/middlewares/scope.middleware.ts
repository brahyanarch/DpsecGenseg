import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../../../shared/database/prisma.client";
import { appError } from "../../../domain/exceptions/app.Error";
import { SecurityContext } from "../../../../../shared/types/security";

export const resolveScope = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idActiveProfile = req.user?.idActiveProfile;

        if (!idActiveProfile) {
            throw new appError("40102", "No hay un perfil activo asociado al token", "No active profile in token", true);
        }

        const profile = await prisma.usuarioUniversidad.findUnique({
            where: { idUsuarioUni: idActiveProfile },
            include: { 
                rol: true,
                oficina: true 
            }
        });

        if (!profile || !profile.lVigente) {
            throw new appError("40302", "El perfil activo ya no es válido o ha sido eliminado", "Active profile is no longer valid", true);
        }

        // DEFINICIÓN de ALCANCE GLOBAL
        const isGlobalAdmin = profile.rol.cNombreRol === 'ADMINISTRADOR' && 
                              (profile.oficina?.cNombreOficina === 'CENTRAL' || profile.idOficina === 1); 

        const context: SecurityContext = {
            scope: isGlobalAdmin ? 'GLOBAL' : 'LOCAL',
            idOficina: profile.idOficina,
            idRol: profile.idRol,
            cNombreRol: profile.rol.cNombreRol
        };

        (req as any).securityContext = context;
        next();
    } catch (error) {
        next(error);
    }
};

