// src/application/useCases/auth/use.Login.ts
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { comparePassword } from "../../../../../shared/services/password.service";
import { generateToken } from "../../../../../shared/services/auth.service";

export class useLogin {
    // Inyectamos el repositorio (el puerto)
    constructor(private readonly _userRepository: portUserRepository) {}

    public async execute(email: string, passwordInput: string) {
        // 1. Obtener usuario del puerto
        const user = await this._userRepository.findByEmail(email);
        console.log("Usuario encontrado:", user);
        // 2. Validación de seguridad: No revelar si el email no existe
        if (!user) throw new Error("INVALID_CREDENTIALS");

        // 3. Verificación de password
        const passwordMatch = await comparePassword(passwordInput, user.getCPassword() || "");
        if (!passwordMatch) {
            // Aquí llamarías a un método para registrar el intento fallido
            // await this._userRepository.updateFailedAttempts(user.getId(), ...);
            throw new Error("INVALID_CREDENTIALS");
        }

        // 4. Generación de Token
        const token = generateToken({ 
            nId: user.getId(), 
            cEmail: user.getEmail() 
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