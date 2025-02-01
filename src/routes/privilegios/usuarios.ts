import express from 'express'
import { createUser,loginUser, AllUser, getUserwithDNI, toggleUserState, getUser,loginUniqueUser } from '../../controllers/privilegios/usuarios';
import { verifyToken } from "../../services/auth.service";
const   router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/register', createUser);  // Registrar usuario
router.post('/login/unique', loginUniqueUser);
router.post('/login', loginUser);  // Iniciar sesión
router.get('/user/me', verifyToken, getUser);    // Obtener usuario logueado
router.get('/user', AllUser);
router.get('/user/:dni',getUserwithDNI);
router.put('/user/toggle', toggleUserState);
router.put('/user/:dni', );

export default router;