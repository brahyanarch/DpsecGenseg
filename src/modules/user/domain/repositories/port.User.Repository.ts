// src/domain/repositories/port.User.Repository.ts
import { AssignRoleDTO } from "../../infrastructure/http/dto/dto.AssignRole";
import { entUser } from "../entities/ent.User";

export interface portUserRepository {
    assignRole(data: AssignRoleDTO): Promise<boolean | null>;
    // Definición de métodos de "Puerto"
    findByEmail(email: string): Promise<entUser | null>;
    findById(id: number): Promise<entUser | null>;
    save(user: entUser): Promise<void>;
    updateFailedAttempts(id: number, attempts: number, date: Date | null): Promise<void>;
}