import { Request, Response, NextFunction } from 'express';
// VALIDACIONES PARA EL ADMINISTRADOR GENERAL
export const ValidateRegisterInput = (req: Request, res: Response, next: NextFunction) => {
    const { usuario, password } = req.body;
    
    if (!usuario) {
        res.status(401).json({ message: 'Usuario es obligatorio' });
        return;
    }
    
    if (!password) {
        res.status(402).json({ message: 'Contraseña es obligatorio' });
        return;
    }
    
    if (password.length < 6) {
        res.status(403).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
        return;
    }
    
    next(); // Si todo está bien, pasa al siguiente middleware o controlador
};

export const ValidateLoginInput = (req: Request, res: Response, next: NextFunction) => {
    const { usuario, password } = req.body;

    if (!usuario) {
        res.status(401).json({ message: 'Usuario es obligatorio' });
        return;
    }

    if (!password) {
        res.status(402).json({ message: 'Contraseña es obligatorio' });
        return;
    }

    next(); // Si todo está bien, pasa al siguiente middleware o controlador
};

