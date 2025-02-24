import { User, Usuario} from "../models/interface/user.interface"
import jwt, {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken';
import { PrismaClient} from '@prisma/client';


const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const prisma = new PrismaClient();
export type UserPayload = Omit<User, "password">;

export const generateToken = (user: User): string => {
    return jwt.sign({ id: user.id, usuario: user.usuario }, JWT_SECRET, { expiresIn: '2h' })
}

export const generateTokenUsuario = (user: Usuario): string => {
    return jwt.sign({ iduser: user.iduser, estado: user.estado }, JWT_SECRET, { expiresIn: '2h' })
}

export const verifyToken = (token: string): UserPayload => {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: number; usuario: string };

        if (!payload.id || !payload.usuario) {
            throw new Error('Invalid token payload');
        }

        return payload as UserPayload;
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            throw new Error('Token expired');
        }
        if (error instanceof JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

export const verifyTokenUsuario = (token: string): Omit<Usuario, "iddatauser" | "idrol" | "idsubunidad"> => {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { iduser: number; estado: boolean };

        if (!payload.iduser || payload.estado === undefined) {
            throw new Error('Invalid token payload');
        }
        if (!payload.estado){
            throw new Error('Usuario desactivado');
        }

        return payload as Omit<Usuario, "iddatauser" | "idrol" | "idsubunidad">;
    } catch (error:any) {
        if (error instanceof TokenExpiredError) {
            throw new Error('Token expiredo');
        }
        if (error instanceof JsonWebTokenError) {
            throw new Error('token invalido');
        }
        if (error.message === 'Usuario desactivado'){
            throw new Error('Usuario desactivado');
        }
        throw error;
    }
}
