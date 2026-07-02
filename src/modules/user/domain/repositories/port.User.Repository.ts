// src/modules/user/domain/repositories/port.User.Repository.ts
import { AssignRoleDTO } from "../../infrastructure/http/dto/dto.AssignRole";
import { entUser } from "../entities/ent.User";

export interface portUserRepository {
    // Definición de métodos de "Puerto"
    assignRole(data: AssignRoleDTO): Promise<boolean | null>;
    findByEmail(email: string): Promise<entUser | null>;
    findById(id: number): Promise<entUser | null>;
    save(user: entUser): Promise<void>;
    updateFailedAttempts(id: number, attempts: number, date: Date | null): Promise<void>;
    existsUser(idUser: number): Promise<boolean>;
    existsRol(idRol: number): Promise<boolean>;
    existsOficina(idOficina: number): Promise<boolean>;
    hasRoleInOffice(idUser: number, idRol: number, idOficina: number): Promise<boolean>;
}