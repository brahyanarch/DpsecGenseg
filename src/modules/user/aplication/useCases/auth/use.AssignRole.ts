// src/modules/user/aplication/useCases/auth/use.AssignRole.ts
import { appError } from "../../../domain/exceptions/app.Error";
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { AssignRoleDTO } from "../../../infrastructure/http/dto/dto.AssignRole";

export class useAssignRole {
    constructor(private readonly _userRepo: portUserRepository) {}

    async execute(data: AssignRoleDTO) {
        // 1. Validar existencia de entidades base
        const userExists = await this._userRepo.existsUser(data.idUser);
        if (!userExists) throw new appError("Usuario no encontrado", "NOT_FOUND", "idUser", true);

        const rolExists = await this._userRepo.existsRol(data.idRol);
        if (!rolExists) throw new appError("Rol inválido", "INVALID_FIELD", "idRol", true);

        const oficinaExists = await this._userRepo.existsOficina(data.idOficina);
        if (!oficinaExists) throw new appError("Oficina no encontrada", "NOT_FOUND", "idOficina", true);

        // 2. Validar regla de negocio específica: ¿Ya tiene este rol en esta oficina?
        const alreadyHasRole = await this._userRepo.hasRoleInOffice(data.idUser, data.idRol, data.idOficina);
        if (alreadyHasRole) {
            throw new appError("El usuario ya tiene este rol activo en dicha oficina", "CONFLICT", "idUser", true);
        }
        
        // Llamar al repositorio para persistir
        return await this._userRepo.assignRole(data);
    }
}