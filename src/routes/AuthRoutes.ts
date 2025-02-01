import express from 'express'
import { login, register } from '../controllers/authController';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/register', register);
router.post('/login',   login);

export default router;