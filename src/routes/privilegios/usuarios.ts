import express from 'express'
import { AsignateRolSubunidad, createUser,loginUser, AllUser, getUserwithDNI, toggleUserState, getUser,loginUniqueUser } from '../../controllers/privilegios/usuarios';
import { verifyToken } from "../../services/auth.service";
import { ValidateRegisterInputUsuario, ValidateAsignateRolSubunidad } from '../../middlewares/privilegios/userValidateRegister'
const   router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/register/data', ValidateRegisterInputUsuario , createUser);  // Registrar usuario
router.post('/register/asignar', ValidateAsignateRolSubunidad , AsignateRolSubunidad);  // Registrar usuario
router.post('/login/unique', loginUniqueUser);
router.post('/login', loginUser);  // Iniciar sesión
/*router.get('/user/me', verifyToken, getUser);    // Obtener usuario logueado
router.get('/user', AllUser);
router.get('/user/:dni',getUserwithDNI);
router.put('/user/toggle', toggleUserState);
router.put('/user/:dni', );*/

export default router;