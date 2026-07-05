import { appError } from "../../../domain/exceptions/app.Error";
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";

export class useUpdateProfileStatus {
    constructor(private readonly _userRepo: portUserRepository) {}

    async execute(idUsuarioUni: number, lActivo: boolean): Promise<void> {
        if (!Number.isInteger(idUsuarioUni) || idUsuarioUni <= 0) {
            throw new appError("40001", "INVALID_FIELD", "idUsuarioUni", true);
        }

        if (typeof lActivo !== "boolean") {
            throw new appError("40001", "INVALID_FIELD", "lActivo", true);
        }

        const profileExists = await this._userRepo.existsProfile(idUsuarioUni);
        if (!profileExists) {
            throw new appError("40402", "Perfil no encontrado", "idUsuarioUni", true);
        }

        await this._userRepo.updateProfileStatus(idUsuarioUni, lActivo);
    }
}
