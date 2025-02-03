import express from 'express'
import { login, register, Me } from '../controllers/authController';
import { ValidateRegisterInput, ValidateLoginInput } from '../middlewares/authValidateInput'
import { Authenticate } from '../middlewares/authenticate'
import rateLimit from 'express-rate-limit';

// Configura el límite de intentos de login
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Límite de 5 intentos por IP
    message: 'Demasiados intentos de login. Inténtalo de nuevo más tarde.',
});

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/register', ValidateRegisterInput, register);
router.post('/login', ValidateLoginInput, login);
router.get('/me', Authenticate, Me);

export default router;