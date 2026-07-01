// src/shared/config/env.ts
export const config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'super_secreto_para_desarrollo',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
    bcrypt: {
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10)
    }
};