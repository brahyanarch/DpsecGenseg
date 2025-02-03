import { Request, Response, NextFunction } from 'express';
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
        return res.status(400).json({ message: 'DNI es obligatorio' });
    }
    if (!isValidDni(dni)) {
        return res.status(400).json({ message: 'El DNI debe tener 8 caracteres' });
    }

    if (!email) {
        return res.status(400).json({ message: 'Email es obligatorio' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'El email no tiene un formato válido' });
    }

    if (!nombre) {
        return res.status(400).json({ message: 'Nombre es obligatorio' });
    }

    if (!aPaterno) {
        return res.status(400).json({ message: 'Apellido paterno es obligatorio' });
    }

    if (!aMaterno) {
        return res.status(400).json({ message: 'Apellido materno es obligatorio' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Password es obligatorio' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
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
        res.status(400).json({message: 'El usuario es obligatorio'});
        return;
    }
    next();
}