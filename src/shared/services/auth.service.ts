// src/shared/services/auth.service.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
    nId: number;
    cEmail: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        // Al castear, nos aseguramos de respetar el contrato con el estándar
        return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
        throw new Error('TOKEN_INVALIDO');
    }
};