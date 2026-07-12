import { portUserRepository } from "../../domain/repositories/port.User.Repository";
import { appError } from "../../domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";

export class useGetUsers {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(context: SecurityContext, page: number, limit: number): Promise<{ users: any[], total: number, page: number, totalPages: number }> {
        const skip = (page - 1) * limit;
        
        const { users, total } = await this._userRepo.findUsersByScope(context, skip, limit);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
