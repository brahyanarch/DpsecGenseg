import { portUserRepository } from "../../domain/repositories/port.User.Repository";
import { appError } from "../../domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";

export class useGetUsers {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(context: SecurityContext): Promise<any[]> {
        // El caso de uso delega la lógica de filtrado al repositorio pasando el contexto de seguridad
        return await this._userRepo.findUsersByScope(context);
    }
}
