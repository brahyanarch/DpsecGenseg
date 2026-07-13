import { portAccessControlRepository } from "../../domain/repositories/port.AccessControl.Repository";
import { SecurityContext } from "../../../../shared/types/security";

export class useGetRoles {
    constructor(private readonly _repo: portAccessControlRepository) {}

    public async execute(context: SecurityContext, page: number, limit: number): Promise<{ roles: any[], total: number, page: number, totalPages: number }> {
        const skip = (page - 1) * limit;
        
        const { roles, total } = await this._repo.findRolesWithScope(context, skip, limit);

        return {
            roles,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
