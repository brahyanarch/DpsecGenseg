import { prisma } from "../../../../shared/database/prisma.client";
import { portAccessControlRepository } from "../../domain/repositories/port.AccessControl.Repository";
import { entRol } from "../../domain/entities/ent.Rol";
import { entPermiso } from "../../domain/entities/ent.Permiso";
import { SecurityContext } from "../../../../shared/types/security";

export class repoAccessControlPrisma implements portAccessControlRepository {

    async createRole(rol: entRol): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // 1. Crear el Rol
            const newRol = await tx.rol.create({
                data: {
                    cNombreRol: rol.cNombreRol,
                    cAbrevRol: rol.cAbrevRol,
                    lActivo: rol.lActivo,
                    lVigente: rol.lVigente
                }
            });

            // 2. Buscar todos los permisos vigentes
            const permissions = await tx.permiso.findMany({
                where: { lVigente: true }
            });

            // 3. Crear las asociaciones en DetallePermiso
            if (permissions.length > 0) {
                await tx.detallePermiso.createMany({
                    data: permissions.map(p => ({
                        idRol: newRol.idRol,
                        idPermiso: p.idPermiso,
                        lActivo: true,
                        lVigente: true
                    }))
                });
            }
        });
    }

    async createPermission(permiso: entPermiso): Promise<void> {
        await prisma.$transaction(async (tx) => {
            // 1. Crear el Permiso
            const newPermiso = await tx.permiso.create({
                data: {
                    cNombrePermiso: permiso.cNombrePermiso,
                    cAbrevPermiso: permiso.cAbrevPermiso,
                    lActivo: permiso.lActivo,
                    lVigente: permiso.lVigente
                }
            });

            // 2. Buscar todos los roles vigentes
            const roles = await tx.rol.findMany({
                where: { lVigente: true }
            });

            // 3. Crear las asociaciones en DetallePermiso
            if (roles.length > 0) {
                await tx.detallePermiso.createMany({
                    data: roles.map(r => ({
                        idRol: r.idRol,
                        idPermiso: newPermiso.idPermiso,
                        lActivo: true,
                        lVigente: true
                    }))
                });
            }
        });
    }

    async findValidPermissions(): Promise<entPermiso[]> {
        const results = await prisma.permiso.findMany({
            where: { lVigente: true }
        });
        return results.map(p => new entPermiso(p.idPermiso, p.cNombrePermiso, p.cAbrevPermiso, p.lActivo, p.lVigente));
    }

    async findValidRoles(): Promise<entRol[]> {
        const results = await prisma.rol.findMany({
            where: { lVigente: true }
        });
        return results.map(r => new entRol(r.idRol, r.cNombreRol, r.cAbrevRol, r.lActivo, r.lVigente));
    }

    async findRolesWithScope(context: SecurityContext, skip: number, take: number): Promise<{ roles: entRol[], total: number }> {
        const where: any = { lVigente: true };

        // Si el scope es LOCAL, solo vemos los roles que están asignados en nuestra oficina
        if (context.scope === 'LOCAL' && context.idOficina) {
            where.asignaciones = {
                some: {
                    idOficina: context.idOficina,
                    lVigente: true,
                    lActivo: true
                }
            };
        }

        const [total, rolesDb] = await prisma.$transaction([
            prisma.rol.count({ where }),
            prisma.rol.findMany({
                where,
                skip,
                take,
                orderBy: { cNombreRol: 'asc' },
                include: {
                    asignaciones: { 
                        where: { lVigente: true, lActivo: true } 
                    }
                }
            })
        ]);

        return {
            roles: rolesDb.map(r => new entRol(r.idRol, r.cNombreRol, r.cAbrevRol, r.lActivo, r.lVigente)),
            total
        };
    }
}
