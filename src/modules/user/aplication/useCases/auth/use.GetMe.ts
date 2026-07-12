import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { appError } from "../../../domain/exceptions/app.Error";

export class useGetMe {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(idUser: number) {
        const user = await this._userRepo.findById(idUser);

        if (!user) {
            throw new appError("40401", "Usuario no encontrado", "User not found", true);
        }

        return {
            idUser: user.getId(),
            cEmail: user.getEmail(),
            cNombre: user.getNombre(),
            perfiles: user.getPerfiles(),
            permisos: user.getPermissions(),
        };
    }
}
