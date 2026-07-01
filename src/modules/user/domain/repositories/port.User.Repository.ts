// src/domain/repositories/port.User.Repository.ts
import { entUser } from "../entities/ent.User";

export interface portUserRepository {
    // Definición de métodos de "Puerto"
    findByEmail(email: string): Promise<entUser | null>;
    findById(id: number): Promise<entUser | null>;
    save(user: entUser): Promise<void>;
    updateFailedAttempts(id: number, attempts: number, date: Date | null): Promise<void>;
}