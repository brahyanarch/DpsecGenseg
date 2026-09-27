import { portUserRepository } from "../../domain/repositories/port.User.Repository";
import { appError } from "../../domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";
import { UserFilter } from "../../../../shared/types/user-filter";

export class useGetUsers {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(context: SecurityContext, filter: UserFilter): Promise<{ users: any[], total: number, page: number, totalPages: number }> {
        const { page = 1, limit = 10 } = filter;

        const isGlobalSystem = context?.cTipoRol === "SISTEMA"
            && Array.isArray(context.permissions)
            && context.permissions.includes("ACCESO_TOTAL_SISTEMA");
        const isLocalUniversity = context?.cTipoRol === "UNIVERSIDAD"
            && Number.isInteger(context.idOficina)
            && context.idOficina! > 0;

        if (!isGlobalSystem && !isLocalUniversity) {
            throw new appError("40302", "Contexto no autorizado para listar usuarios", "Security context is not authorized to list users", true);
        }
        
        const { users, total } = await this._userRepo.findUsersByScope(context, filter);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
