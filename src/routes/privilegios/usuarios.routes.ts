import express from 'express'
import AuthController from '../../controllers/privilegios/usuarios.controller';
import { ValidateRegisterInputUsuario, ValidateAsignateRolSubunidad, ValidateLoginInput, ValidateLoginUniqueInput } from '../../middlewares/privilegios/userValidateRegister'
import {sendEmail} from '../../services/email.service'
const   router = express.Router();

/** RUTAS REGISTRO Y LOGIN **/
router.post('/register/datos', ValidateRegisterInputUsuario , AuthController.createUser);  // Registrar usuario
router.post('/asignar/', ValidateAsignateRolSubunidad , AuthController.AsignateRolSubunidad);  // Registrar usuario
router.post('/login/unique',ValidateLoginUniqueInput, AuthController.loginUniqueUser);
router.post('/login', ValidateLoginInput , AuthController.loginUser);  // Iniciar sesión
router.get('/authenticate', AuthController.AuthenticateUsuario, AuthController.getUser);    // Obtener usuario logueado
router.get('/roles', AuthController.AuthenticateUsuario, AuthController.getAllRolesToUser);
router.get('/users', AuthController.AuthenticateUsuario, AuthController.AllUserBySubUnidad);
router.put('/user/:id/status', AuthController.AuthenticateUsuario, );
//router.post('/probar', AuthController.probarEmail); 
/*router.get('/user/:dni',getUserwithDNI);
router.put('/user/:dni', );*/

export default router;