// src/modules/user/aplication/useCases/auth/use.AssignRole.ts
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { AssignRoleDTO } from "../../../infrastructure/http/dto/dto.AssignRole";

export class useAssignRole {
    constructor(private readonly _userRepo: portUserRepository) {}

    async execute(data: AssignRoleDTO) {
        // 1. Aquí aplicarías lógica de negocio
        // Ej: ¿El usuario ya existe? ¿El rol es válido?
        
        // 2. Llamar al repositorio para persistir
        return await this._userRepo.assignRole(data);
    }
}