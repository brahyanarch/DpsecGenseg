import { appError } from "../../../domain/exceptions/app.Error";
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";

export class useUpdateProfileStatus {
    constructor(private readonly _userRepo: portUserRepository) {}

    async execute(idUsuarioUni: number, lActivo: boolean): Promise<void> {
        console.log(`[DEBUG] useUpdateProfileStatus.execute - Params: idUsuarioUni=${idUsuarioUni}, lActivo=${lActivo}`);

        if (!Number.isInteger(idUsuarioUni) || idUsuarioUni <= 0) {
            console.log(`[DEBUG] useUpdateProfileStatus.execute - Validation Error: idUsuarioUni is not a valid integer`);
            throw new appError("40001", "INVALID_FIELD", "idUsuarioUni", true);
        }

        if (typeof lActivo !== "boolean") {
            console.log(`[DEBUG] useUpdateProfileStatus.execute - Validation Error: lActivo is not a boolean`);
            throw new appError("40001", "INVALID_FIELD", "lActivo", true);
        }

        console.log(`[DEBUG] useUpdateProfileStatus.execute - Checking if profile ${idUsuarioUni} exists...`);
        const profileExists = await this._userRepo.existsProfile(idUsuarioUni);
        console.log(`[DEBUG] useUpdateProfileStatus.execute - Profile exists: ${profileExists}`);

        if (!profileExists) {
            throw new appError("40402", "Perfil no encontrado", "idUsuarioUni", true);
        }

        console.log(`[DEBUG] useUpdateProfileStatus.execute - Updating profile status in repository...`);
        await this._userRepo.updateProfileStatus(idUsuarioUni, lActivo);
        console.log(`[DEBUG] useUpdateProfileStatus.execute - Repository update completed`);
    }
}
