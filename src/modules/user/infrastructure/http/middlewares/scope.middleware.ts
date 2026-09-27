import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../../../shared/database/prisma.client";
import { appError } from "../../../domain/exceptions/app.Error";
import { SecurityContext } from "../../../../../shared/types/security";

export const resolveScope = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idActiveProfile = req.user?.idActiveProfile;
        const idActiveSystemAssignment = req.user?.idActiveSystemAssignment;
        if (idActiveProfile != null && idActiveSystemAssignment != null) {
            throw new appError("40302", "El token contiene contextos incompatibles", "Token contains conflicting active contexts", true);
        }
        if (idActiveProfile == null && idActiveSystemAssignment == null) {
            throw new appError("40302", "No hay un contexto activo asociado al token", "No active context in token", true);
        }

        const now = new Date();
        if (idActiveSystemAssignment != null) {
            const assignment = await prisma.usuarioSistema.findFirst({
                where: { idUsuarioSistema: idActiveSystemAssignment, idUser: req.user!.nId, lActivo: true, lVigente: true, rol: { lActivo: true, lVigente: true, cTipoRol: "SISTEMA" } },
                include: { rol: { include: { detallePermisos: { where: { lActivo: true, lVigente: true, permiso: { lActivo: true, lVigente: true, cTipoRol: "SISTEMA" } }, include: { permiso: true } } } } }
            });
            if (!assignment) throw new appError("40302", "La asignación de sistema ya no es válida", "Active system assignment is no longer valid", true);
            (req as any).securityContext = { scope: "GLOBAL", idOficina: null, idRol: assignment.idRol, cNombreRol: assignment.rol.cNombreRol, cTipoRol: assignment.rol.cTipoRol, permissions: assignment.rol.detallePermisos.map(dp => dp.permiso.cNombrePermiso) } satisfies SecurityContext;
            next();
            return;
        }

        const profile = await prisma.usuarioUniversidad.findFirst({
            where: {
                idUsuarioUni: idActiveProfile!,
                idUser: req.user!.nId,
                lActivo: true,
                lVigente: true,
                OR: [{ dExpiresAt: null }, { dExpiresAt: { gt: now } }],
                rol: { lActivo: true, lVigente: true, cTipoRol: "UNIVERSIDAD" },
                oficina: { lActivo: true, lVigente: true }
            },
            include: { 
                rol: {
                    include: {
                        detallePermisos: {
                            include: { permiso: true },
                            where: { lVigente: true, lActivo: true, permiso: { lVigente: true, lActivo: true, cTipoRol: "UNIVERSIDAD" } }
                        }
                    }
                },
                oficina: true 
            }
        });

        if (!profile) {
            throw new appError("40302", "El perfil activo ya no es válido o ha sido eliminado", "Active profile is no longer valid", true);
        }

        // Extraemos los nombres de los permisos
        const permissions = profile.rol.detallePermisos.map(dp => dp.permiso.cNombrePermiso);

        const context: SecurityContext = {
            scope: 'LOCAL',
            idOficina: profile.idOficina,
            idRol: profile.idRol,
            cNombreRol: profile.rol.cNombreRol,
            cTipoRol: profile.rol.cTipoRol,
            permissions: permissions
        };

        (req as any).securityContext = context;
        next();
    } catch (error) {
        next(error);
    }
};

