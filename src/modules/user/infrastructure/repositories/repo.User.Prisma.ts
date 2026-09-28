// src/infrastructure/repositories/repo.User.Prisma.ts
import { prisma } from "../../../../shared/database/prisma.client";
import { portUserRepository } from "../../domain/repositories/port.User.Repository";
import { entUser } from "../../domain/entities/ent.User";
import { UserMapper } from "../mappers/User.Mapper"; 
import { AssignRoleDTO } from "../http/dto/dto.AssignRole";
import { appError } from "../../domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";
import { UserFilter } from "../../../../shared/types/user-filter";

export class repoUserPrisma implements portUserRepository {
    
    async findByEmail(cEmail: string): Promise<entUser | null> {
        const userDb = await prisma.user.findUnique({
            where: { cEmail: cEmail, lVigente: true },
            include: {
                perfiles: { where: { lVigente: true, lActivo: true, OR: [{ dExpiresAt: null }, { dExpiresAt: { gt: new Date() } }], rol: { lActivo: true, lVigente: true, cTipoRol: "UNIVERSIDAD" } }, include: { rol: { include: { detallePermisos: { where: { lActivo: true, lVigente: true, permiso: { lActivo: true, lVigente: true, cTipoRol: "UNIVERSIDAD" } }, include: { permiso: true } } } }, oficina: true } },
                asignacionesSistema: { where: { lVigente: true, lActivo: true, rol: { lActivo: true, lVigente: true, cTipoRol: "SISTEMA" } }, include: { rol: { include: { detallePermisos: { where: { lActivo: true, lVigente: true, permiso: { lActivo: true, lVigente: true, cTipoRol: "SISTEMA" } }, include: { permiso: true } } } } } }
            }
        });
        return userDb ? UserMapper.toDomain(userDb) : null;
    }

    async findById(id: number): Promise<entUser | null> {
        const userDb = await prisma.user.findUnique({
            where: { idUser: id, lActivo: true, lVigente: true },
            include: {
                perfiles: { 
                    include: { 
                        rol: { 
                            include: { 
                                detallePermisos: { include: { permiso: true }, where: { lVigente: true, lActivo: true, permiso: { lVigente: true, lActivo: true, cTipoRol: "UNIVERSIDAD" } } }
                            } 
                        }, 
                        oficina: true 
                    }, 
                    where: { lVigente: true, lActivo: true, OR: [{ dExpiresAt: null }, { dExpiresAt: { gt: new Date() } }], rol: { lActivo: true, lVigente: true, cTipoRol: "UNIVERSIDAD" } }
                },
                asignacionesSistema: { where: { lVigente: true, lActivo: true, rol: { lActivo: true, lVigente: true, cTipoRol: "SISTEMA" } }, include: { rol: { include: { detallePermisos: { where: { lActivo: true, lVigente: true, permiso: { lActivo: true, lVigente: true, cTipoRol: "SISTEMA" } }, include: { permiso: true } } } } } }
            }
        });
        return userDb ? UserMapper.toDomain(userDb) : null;
    }

   async save(user: entUser): Promise<number> {
        const userData = UserMapper.toPersistence(user);
        const createdUser = await prisma.user.create({
            data: userData
        });
        return createdUser.idUser;
    }

    async updateFailedAttempts(idUser: number, attempts: number, date: Date | null): Promise<void> {
        await prisma.user.update({
            where: { idUser },
            data: { nFailedAttempts: attempts, dLastFailedAttempt: date }
        });
    }

    async updateUserStatus(idUser: number, lActivo: boolean): Promise<void> {
        await prisma.user.update({
            where: { idUser },
            data: { lActivo }
        });
    }

    async updateProfileStatus(idUsuarioUni: number, lActivo: boolean): Promise<void> {
        await prisma.usuarioUniversidad.update({
            where: { idUsuarioUni },
            data: { lActivo }
        });
    }

    async softDeleteUser(idUser: number): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { idUser }
        });

        if (!user) return;

        const deletedAt = new Date();
        const deletedAtLabel = deletedAt.toISOString().replace(/[:.]/g, "-");
        const deletedEmail = `${user.cEmail}__deleted_${deletedAtLabel}_${idUser}`;

        await prisma.$transaction([
            prisma.usuarioUniversidad.updateMany({
                where: { idUser },
                data: { lActivo: false, lVigente: false }
            }),
            prisma.user.update({
                where: { idUser },
                data: {
                    cEmail: deletedEmail,
                    lActivo: false,
                    lVigente: false,
                    dDeletedAt: deletedAt
                }
            })
        ]);
    }

    async softDeleteProfile(idUsuarioUni: number): Promise<void> {
        await prisma.usuarioUniversidad.update({
            where: { idUsuarioUni },
            data: { lActivo: false, lVigente: false }
        });
    }

    async assignRole(data: AssignRoleDTO): Promise<boolean | null> {
        await prisma.usuarioUniversidad.create({
            data: {
                idUser: data.idUser,
                idRol: data.idRol,
                idOficina: data.idOficina,
                dExpiresAt: data.dExpiresAt || null,
            }
        });
        return true;
    }

    public async existsOficina(idOficina: number): Promise<boolean> {
        const oficina = await prisma.oficina.findUnique({
            where: { idOficina: idOficina, lVigente: true }
        });
        return !!oficina;
    }

    public async existsUser(idUser: number): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { idUser: idUser, lVigente: true }
        });

        return !!user;
    }

    public async existsUserById(idUser: number): Promise<boolean> {
        const user = await prisma.user.findFirst({
            where: { idUser: idUser, lVigente: true }
        });

        return !!user;
    }

    public async existsProfile(idUsuarioUni: number): Promise<boolean> {
        const profile = await prisma.usuarioUniversidad.findFirst({
            where: { idUsuarioUni: idUsuarioUni, lVigente: true }
        });

        return !!profile;
    }

    public async existsRol(idRol: number): Promise<boolean> {
        const rol = await prisma.rol.findUnique({
            where: { idRol: idRol, lActivo:true, lVigente:true }
        });

        return rol?.cTipoRol === "UNIVERSIDAD";
    }

    public async hasRoleInOffice(idUser: number, idRol: number, idOficina: number): Promise<boolean> {
        const registro = await prisma.usuarioUniversidad.findUnique({
            where: { 
                unique_usuario_rol_oficina: {
                    idUser: idUser,
                    idRol: idRol,
                    idOficina: idOficina
                },
                lActivo: true,
                lVigente: true
            }
        });
        return !!registro;
    }

    async findUsersByScope(context: SecurityContext, filter: UserFilter): Promise<{ users: entUser[], total: number }> {
        const { search, lActivo, sortBy, sortOrder, page = 1, limit = 10 } = filter;
        const skip = (page - 1) * limit;
        const isGlobalSystem = context?.cTipoRol === "SISTEMA"
            && Array.isArray(context.permissions)
            && context.permissions.includes("ACCESO_TOTAL_SISTEMA");
        const isLocalUniversity = context?.cTipoRol === "UNIVERSIDAD"
            && Number.isInteger(context.idOficina)
            && context.idOficina! > 0;

        if (!isGlobalSystem && !isLocalUniversity) {
            throw new appError("40302", "Contexto no autorizado para listar usuarios", "Security context is not authorized to list users", true);
        }

        // Filtro base: solo usuarios vigentes
        const where: any = { lVigente: true };

        // Scope filter
        if (isLocalUniversity) {
            const now = new Date();
            where.perfiles = {
                some: {
                    idOficina: context.idOficina,
                    lVigente: true,
                    OR: [{ dExpiresAt: null }, { dExpiresAt: { gt: now } }],
                    rol: { lActivo: true, lVigente: true, cTipoRol: "UNIVERSIDAD" },
                    oficina: { lActivo: true, lVigente: true }
                }
            };
        }

        // Advanced filter
        if (search) {
            where.OR = [
                { cNombre: { contains: search, mode: 'insensitive' } },
                { cEmail: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (lActivo !== undefined) {
            where.lActivo = lActivo;
        }

        // Sorting
        const orderBy: any = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'asc';
        } else {
            orderBy.cNombre = 'asc';
        }

        // Ejecutamos el conteo y la búsqueda en paralelo para optimizar
        const [total, usersDb] = await prisma.$transaction([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    perfiles: { include: { rol: true, oficina: true }, where: { lVigente: true, OR: [{ dExpiresAt: null }, { dExpiresAt: { gt: new Date() } }], rol: { lActivo: true, lVigente: true, cTipoRol: "UNIVERSIDAD" }, oficina: { lActivo: true, lVigente: true } } }
                }
            })
        ]);

        return {
            users: usersDb.map(u => UserMapper.toDomain(u)),
            total
        };
    }
}
