// src/application/useCases/auth/use.Register.ts
import { portUserRepository } from "../../../domain/repositories/port.User.Repository";
import { hashPassword } from "../../../../../shared/services/password.service";
import { entUser } from "../../../domain/entities/ent.User";
import { appError } from "../../../domain/exceptions/app.Error";
import { errorCatalog } from "../../../domain/exceptions/error.Catalog";

export class useRegister {
    constructor(private readonly _userRepository: portUserRepository) {}

    public async execute(cEmail: string, cPassword: string, cNombre: string) {
        // 1. Validar si el usuario ya existe
        const existingUser = await this._userRepository.findByEmail(cEmail);
        console.log("Usuario existente:", existingUser);
        if (existingUser) {
            throw new appError("54003", "El correo ya está registrado", "Email already in use", false);
        }

        // 2. Encriptar contraseña
        const hashedPwd = await hashPassword(cPassword);

        // 3. Crear entidad y guardar
        // Asumiendo que el ID es generado por la BD, pasamos 0 o null
        const newUser = new entUser(0, cEmail, hashedPwd, cNombre, [], []);
        await this._userRepository.save(newUser);

        return { message: "Usuario registrado exitosamente" };
    }
}