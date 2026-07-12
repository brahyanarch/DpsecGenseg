import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { generateToken } from "../../../../../shared/services/auth.service";
import { appError } from "../../../domain/exceptions/app.Error";

export class useSwitchProfile {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(idUser: number, idActiveProfile: number): Promise<{ token: string, user: any }> {
        // 1. Validar que el usuario exista y esté activo
        const user = await this._userRepo.findById(idUser);
        if (!user) {
            throw new appError("40401", "Usuario no encontrado", "User not found", true);
        }

        // 2. Validar que el usuario posea el perfil solicitado
        if (!user.verifyProfile(idActiveProfile)) {
            throw new appError("40301", "El usuario no tiene acceso a este perfil", "User does not own this profile", true);
        }

        // 3. Generar nuevo token con el nuevo perfil activo
        const token = generateToken({
            nId: user.getId(),
            cEmail: user.getEmail(),
            idActiveProfile: idActiveProfile
        });

        // 4. Preparar datos del usuario para la respuesta (similar al login)
        const userData = {
            email: user.getEmail(),
            nombre: user.getNombre(),
            perfiles: user.getPerfiles()
        };

        return { token, user: userData };
    }
}
