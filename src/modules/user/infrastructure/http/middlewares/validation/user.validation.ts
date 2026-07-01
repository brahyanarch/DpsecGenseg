// src/modules/user/infrastructure/http/middlewares/validation/user.validation.ts
import { appError } from "../../../../domain/exceptions/app.Error";
interface UserRegisterData {
    cEmail: string;
    cPassword: string;
    cNombre: string;
    cDni?: string; // Opcional
}
export class UserValidator {
    public static validateRegister(data: UserRegisterData) {
        if (!data.cEmail || !data.cEmail.includes('@') || !data.cEmail.includes('.')) {
            throw new appError("","INVALID_FIELD", "cEmail", true);
        }
        if (!data.cPassword || data.cPassword.length < 5) {
            throw new appError("","INVALID_FIELD", "cPassword", true);
        }
        if (data.cDni && data.cDni.length !== 8) {
            throw new appError("","INVALID_LENGTH", "cDni", true);
        }
        return true; // Todo bien
    }
}