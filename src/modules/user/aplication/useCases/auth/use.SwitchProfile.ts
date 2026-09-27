import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { generateToken } from "../../../../../shared/services/auth.service";
import { appError } from "../../../domain/exceptions/app.Error";

export class useSwitchProfile {
    constructor(private readonly _userRepo: portUserRepository) {}

    public async execute(idUser: number, idActiveProfile?: number, idActiveSystemAssignment?: number): Promise<{ token: string, user: any }> {
        // 1. Validar que el usuario exista y esté activo
        const user = await this._userRepo.findById(idUser);
        if (!user) {
            throw new appError("40401", "Usuario no encontrado", "User not found", true);
        }

        // 2. Validar que el usuario posea el perfil solicitado
        if (idActiveProfile != null && idActiveSystemAssignment != null) throw new appError("40001", "Seleccione un solo contexto", "Select exactly one active context", true);
        if (idActiveProfile == null && idActiveSystemAssignment == null) throw new appError("40001", "Se requiere un contexto activo", "An active context is required", true);
        if (idActiveProfile != null && !user.verifyProfile(idActiveProfile)) {
            throw new appError("40301", "El usuario no tiene acceso a este perfil", "User does not own this profile", true);
        }
        if (idActiveSystemAssignment != null && !user.verifySystemAssignment(idActiveSystemAssignment)) throw new appError("40301", "El usuario no tiene acceso a esta asignación", "User does not own this system assignment", true);

        // 3. Generar nuevo token con el nuevo perfil activo
        const token = generateToken({
            nId: user.getId(),
            cEmail: user.getEmail(),
            idActiveProfile: idActiveProfile ?? null,
            idActiveSystemAssignment: idActiveSystemAssignment ?? null
        });

        // 4. Preparar datos del usuario para la respuesta (similar al login)
        const userData = {
            email: user.getEmail(),
            nombre: user.getNombre(),
            perfiles: user.getPerfiles(),
            asignacionesSistema: user.getAsignacionesSistema()
        };

        return { token, user: userData };
    }
}
