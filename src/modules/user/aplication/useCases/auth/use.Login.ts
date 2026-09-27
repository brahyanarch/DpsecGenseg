// src/application/useCases/auth/use.Login.ts
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { comparePassword } from "../../../../../shared/services/password.service";
import { generateToken } from "../../../../../shared/services/auth.service";
import { appError } from "../../../domain/exceptions/app.Error";

export class useLogin {
    // Inyectamos el repositorio (el puerto)
    constructor(private readonly _userRepository: portUserRepository) {}

    public async execute(email: string, passwordInput: string, idActiveProfile?: number | null, idActiveSystemAssignment?: number | null) {
        // 1. Obtener usuario del puerto
        const user = await this._userRepository.findByEmail(email);
        // 2. Validación de seguridad: No revelar si el email no existe
        if (!user) throw new appError("54003", "INVALID_CREDENTIALS", "Invalid credentials", false);
        if ( user.isVigente() === false || user.isActivo() === false) {
            throw new appError( "54004","USER_INACTIVE", "User inactive", false);
        }

        // 3. Verificación de password
        const passwordMatch = await comparePassword(passwordInput, user.getCPassword() || "");
        if (!passwordMatch) {
            // Aquí llamarías a un método para registrar el intento fallido
            // await this._userRepository.updateFailedAttempts(user.getId(), ...);
            throw new appError("54003", "INVALID_CREDENTIALS", "Invalid credentials", false);
        }

        if (idActiveProfile != null && idActiveSystemAssignment != null) {
            throw new appError("40001", "Seleccione un solo contexto", "Select exactly one active context", false);
        }
        if (idActiveProfile != null && !user.verifyProfile(idActiveProfile)) throw new appError("54005", "ACTIVE_PROFILE_NOT_FOUND", "Active profile not found", false);
        if (idActiveSystemAssignment != null && !user.verifySystemAssignment(idActiveSystemAssignment)) throw new appError("54005", "ACTIVE_SYSTEM_ASSIGNMENT_NOT_FOUND", "Active system assignment not found", false);

        // 4. Generación de Token
        const token = generateToken({ 
            nId: user.getId(), 
            cEmail: user.getEmail(), 
            idActiveProfile: idActiveProfile ?? null,
            idActiveSystemAssignment: idActiveSystemAssignment ?? null
        });
        
        return { 
            token, 
            user: { 
                email: user.getEmail(), 
                nombre: user.getNombre(),
                perfiles: user.getPerfiles(),
                asignacionesSistema: user.getAsignacionesSistema(),
                //perfil: user.hasActiveRole(1, "Admin") ? "Admin" : "User" // Ej
            } 
        };
    }
}
