import { appError } from "../../../domain/exceptions/app.Error";
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";

export class useSoftDeleteUser {
    constructor(private readonly _userRepo: portUserRepository) {}

    async execute(idUser: number): Promise<void> {
        if (!Number.isInteger(idUser) || idUser <= 0) {
            throw new appError("40001", "INVALID_FIELD", "idUser", true);
        }

        const userExists = await this._userRepo.existsUserById(idUser);
        if (!userExists) {
            throw new appError("40401", "Usuario no encontrado", "idUser", true);
        }

        await this._userRepo.softDeleteUser(idUser);
    }
}
