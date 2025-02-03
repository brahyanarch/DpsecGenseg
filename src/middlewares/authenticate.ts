import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { PrismaClient} from '@prisma/client';
import { User } from "../models/interface/user.interface"
const prisma = new PrismaClient();

export const Authenticate = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Acceso no autorizado' });
        return;
    }

    try {
        const decoded:Omit<User, "password"> = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: {
                usuario: decoded.usuario
            }
        });

        req.user = user as User; // Adjunta el usuario decodificado a la solicitud

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};