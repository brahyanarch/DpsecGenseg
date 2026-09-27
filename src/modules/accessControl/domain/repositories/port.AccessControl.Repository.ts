import { entRol } from "../entities/ent.Rol";
import { entPermiso } from "../entities/ent.Permiso";
import { SecurityContext } from "../../../../shared/types/security";

export interface portAccessControlRepository {
    createRole(rol: entRol): Promise<void>;
    createPermission(permiso: entPermiso): Promise<void>;
    findValidPermissions(): Promise<entPermiso[]>;
    findValidRoles(): Promise<entRol[]>;
    findRolesWithScope(context: SecurityContext, skip: number, take: number): Promise<{ roles: entRol[], total: number }>;
}
