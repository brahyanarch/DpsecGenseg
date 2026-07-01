// src/modules/user/infrastructure/http/dto/dto.AssignRole.ts
export interface AssignRoleDTO {
    idUser: number;
    idRol: number;
    idOficina: number;
    dExpiresAt?: Date | null;
}