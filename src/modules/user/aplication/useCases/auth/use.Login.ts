// src/application/useCases/auth/use.Login.ts
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { comparePassword } from "../../../../../shared/services/password.service";
import { generateToken } from "../../../../../shared/services/auth.service";

export class useLogin {
    // Inyectamos el repositorio (el puerto)
    constructor(private readonly _userRepository: portUserRepository) {}

    public async execute(email: string, passwordInput: string, idActiveProfile: number | null) {
        // 1. Obtener usuario del puerto
        const user = await this._userRepository.findByEmail(email);
        console.log("Usuario encontrado:", user, "ID de perfil activo solicitado:", idActiveProfile);
        // 2. Validación de seguridad: No revelar si el email no existe
        if (!user) throw new Error("INVALID_CREDENTIALS");

        // 3. Verificación de password
        const passwordMatch = await comparePassword(passwordInput, user.getCPassword() || "");
        if (!passwordMatch) {
            // Aquí llamarías a un método para registrar el intento fallido
            // await this._userRepository.updateFailedAttempts(user.getId(), ...);
            throw new Error("INVALID_CREDENTIALS");
        }

        // validacion de idActiveProfile
        if (idActiveProfile != null) {
            const hasActiveProfile = user.verifyProfile(idActiveProfile);
            if (!hasActiveProfile) {
                throw new Error("ACTIVE_PROFILE_NOT_FOUND");
            }
        }

        // 4. Generación de Token
        const token = generateToken({ 
            nId: user.getId(), 
            cEmail: user.getEmail(), 
            idActiveProfile: idActiveProfile
        });
        
        return { 
            token, 
            user: { 
                email: user.getEmail(), 
                nombre: user.getNombre(),
                perfiles: user.getPerfiles(),
                //perfil: user.hasActiveRole(1, "Admin") ? "Admin" : "User" // Ej
            } 
        };
    }
}