import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { appError } from "../../../domain/exceptions/app.Error";
import { TokenPayload } from "../../../../../shared/services/auth.service";

export class useGetMe {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(idUser: number, claims: Pick<TokenPayload, "idActiveProfile" | "idActiveSystemAssignment">) {
        const user = await this._userRepo.findById(idUser);

        if (!user) {
            throw new appError("40401", "Usuario no encontrado", "User not found", true);
        }

        return {
            idUser: user.getId(),
            cEmail: user.getEmail(),
            cNombre: user.getNombre(),
            perfiles: user.getPerfiles(),
            asignacionesSistema: user.getAsignacionesSistema(),
            contextoActivo: user.getActiveContext(claims.idActiveProfile, claims.idActiveSystemAssignment),
            permisos: user.getPermissionsForContext(claims.idActiveProfile, claims.idActiveSystemAssignment),
        };
    }
}
