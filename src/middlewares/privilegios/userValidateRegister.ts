import { Request, Response, NextFunction } from 'express';
import { generarContrasenia } from '../../services/generate.service';

// VALIDACIONES PARA EL USUARIO 
// Función para validar el formato del email
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Función para validar la longitud de la contraseña
const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
};

// Función para validar la longitud del DNI
const isValidDni = (dni: string): boolean => {
    return dni.length === 8;
};

// Middleware de validación
export const ValidateRegisterInputUsuario = (req: Request, res: Response, next: NextFunction) => {
    const { dni, email, nombre, aPaterno, aMaterno, password, idpe } = req.body;

    if (!dni) {
        res.status(400).json({ message: 'DNI es obligatorio' });
        return;
    }
    if (!isValidDni(dni)) {
        res.status(400).json({ message: 'El DNI debe tener 8 caracteres' });
        return;
    }

    if (!email) {
        res.status(400).json({ message: 'Email es obligatorio' });
        return;
    }
    if (!isValidEmail(email)) {
        res.status(400).json({ message: 'El email no tiene un formato válido' });
        return;
    }

    if (!nombre) {
        res.status(400).json({ message: 'Nombre es obligatorio' });
        return;
    }

    if (!aPaterno) {
        res.status(400).json({ message: 'Apellido paterno es obligatorio' });
        return;
    }

    if (!aMaterno) {
        res.status(400).json({ message: 'Apellido materno es obligatorio' });
        return;
    }

    if (!req.body.password) {
        req.body.password = generarContrasenia(7);
        req.body.generated = true; // Indica que la contraseña fue generada automáticamente
    }
    if (!isValidPassword(req.body.password)) {
        res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        return 
    }

    // Si todo está bien, pasa al siguiente middleware
    next();
};

export const ValidateAsignateRolSubunidad = (req:Request, res:Response, next: NextFunction) => {
    const {idrol, idsubunidad, iddatausuario} = req.body;
    if(!idrol){
        res.status(400).json({ message: 'El rol es obligatorio' });
        return;
    }
    if(!idsubunidad){
        res.status(400).json({ message: 'La sub unidad es obligatorio'});
        return;
    }
    if(!iddatausuario){
        res.status(400).json({ message: 'El usuario es obligatorio'});
        return;
    }
    next();
}

export const ValidateLoginInput = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email) {
        res.status(400).json({ message: 'Usuario es obligatorio' });
        return 
    }

    if (!password) {
        res.status(400).json({ message: 'Contraseña es obligatoria' });
        return 
    }

    next();
};

export const ValidateLoginUniqueInput = (req: Request, res: Response, next: NextFunction) => {
    const { iddatausuario, idrol, idsubunidad } = req.body;

    if (!iddatausuario) {
        res.status(400).json({ message: 'Usuario es obligatorio' });
        return 
    }

    if (!idrol) {
        res.status(400).json({ message: 'El rol es obligatoria' });
        return 
    }

    if (!idsubunidad) {
        res.status(400).json({ message: 'La sub unidad es obligatoria' });
        return 
    }

    next();
};

