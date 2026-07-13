import { portUserRepository } from "../../domain/repositories/port.User.Repository";
import { appError } from "../../domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";
import { UserFilter } from "../../../../shared/types/user-filter";

export class useGetUsers {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(context: SecurityContext, filter: UserFilter): Promise<{ users: any[], total: number, page: number, totalPages: number }> {
        const { page = 1, limit = 10 } = filter;
        
        const { users, total } = await this._userRepo.findUsersByScope(context, filter);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
