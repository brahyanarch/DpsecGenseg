import { User } from "../models/interface/user.interface"
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Usuario} from '@prisma/client';
import { access } from "fs";

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const prisma = new PrismaClient();

export const generateToken = (user: User): string => {
    return jwt.sign({ id: user.id, usuario: user.usuario }, JWT_SECRET, { expiresIn: '2h' })
}

interface UsuarioPayload {
    dni: string;
    n_usu:string;
    subunidad_id_subuni: number;
    rol_id: number;
    // Add other fields as needed
  }

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["token"] as string;
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET) as UsuarioPayload;
        
        const user = await prisma.usuario.findFirst({where: {dni: payload.dni, email: payload.n_usu, rol_id: payload.rol_id, subunidad_id_subuni: payload.subunidad_id_subuni, estado:true}});

        if (!user) {
            return res.status(404).json({ message: 'User not found', access: false });
        }
        
        req.user = user as any;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

