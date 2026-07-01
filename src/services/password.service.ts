// src/services/password.service.ts
import { config } from '../config/env';
import bcrypt from 'bcrypt';

/**
 * Encripta la contraseña antes de guardarla en la base de datos
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, config.bcrypt.saltRounds);
};

/**
 * Compara una contraseña en texto plano con un hash almacenado
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};