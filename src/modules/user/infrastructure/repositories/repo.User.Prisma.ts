// src/infrastructure/repositories/repo.User.Prisma.ts
import { prisma } from "../../../../shared/database/prisma.client";
import { portUserRepository } from "../../domain/repositories/port.User.Repository";
import { entUser } from "../../domain/entities/ent.User";
import { UserMapper } from "../mappers/User.Mapper"; 
import { AssignRoleDTO } from "../http/dto/dto.AssignRole";

export class repoUserPrisma implements portUserRepository {
    
    async findByEmail(cEmail: string): Promise<entUser | null> {

        console.log(`Buscando usuario por email: ${cEmail}`);
        const userDb = await prisma.user.findUnique({
            where: { cEmail: cEmail },
            include: {
                perfiles: { include: { rol: true, oficina: true } }
            }
        });

        console.log("Resultado de la consulta a la base de datos:", userDb);
        return userDb ? UserMapper.toDomain(userDb) : null;
    }

    // AÑADE ESTE MÉTODO QUE TE ESTÁ PIDIENDO TYPESCRIPT:
    async findById(id: number): Promise<entUser | null> {
        console.log(`Buscando usuario por ID: ${id}`);
        const userDb = await prisma.user.findUnique({
            where: { idUser: id },
            include: {
                perfiles: { include: { rol: true, oficina: true } }
            }
        });
        console.log("Resultado de la consulta a la base de datos:", userDb);
        return userDb ? UserMapper.toDomain(userDb) : null;
    }

   async save(user: entUser): Promise<void> {
        // 1. Convertimos la Entidad a un formato que Prisma entienda
        // (Esto debería estar en tu UserMapper)
        const userData = UserMapper.toPersistence(user);
        
        // 2. Guardamos en la base de datos
        await prisma.user.create({
            data: userData
        });
    }

    async updateFailedAttempts(idUser: number, attempts: number, date: Date | null): Promise<void> {
        await prisma.user.update({
            where: { idUser },
            data: { nFailedAttempts: attempts, dLastFailedAttempt: date }
        });
    }

    async assignRole(data: AssignRoleDTO): Promise<boolean | null> {
        await prisma.usuarioUniversidad.create({
            data: {
                idUser: data.idUser,
                idRol: data.idRol,
                idOficina: data.idOficina,
                lVigente: true, // Por defecto al asignar
                dExpiresAt: data.dExpiresAt || null,
            }
        });
        return true;
    }
}