import { User } from "../models/interface/user.interface"
import jwt, {JsonWebTokenError, TokenExpiredError} from 'jsonwebtoken';
import { PrismaClient} from '@prisma/client';


const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const prisma = new PrismaClient();
export type UserPayload = Omit<User, "password">;

export const generateToken = (user: User): string => {
    return jwt.sign({ id: user.id, usuario: user.usuario }, JWT_SECRET, { expiresIn: '2h' })
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

