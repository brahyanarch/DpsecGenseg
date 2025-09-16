import express from 'express'
import { AsignateRolSubunidad, createUser, AllUserBySubUnidad,loginUser, loginUniqueUser, getUser, AuthenticateUsuario, getAllRolesToUser, getAllRolesToUserTemporal } from '../../controllers/privilegios/usuarios';
import { ValidateRegisterInputUsuario, ValidateAsignateRolSubunidad, ValidateLoginInput, ValidateLoginUniqueInput } from '../../middlewares/privilegios/userValidateRegister'
const   router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/register/datos', ValidateRegisterInputUsuario , createUser);  // Registrar usuario
router.post('/asignar', ValidateAsignateRolSubunidad , AsignateRolSubunidad);  // Registrar usuario
router.post('/login/unique',ValidateLoginUniqueInput, loginUniqueUser);
router.post('/login', ValidateLoginInput , loginUser);  // Iniciar sesión
router.get('/authenticate', AuthenticateUsuario, getUser);    // Obtener usuario logueado
router.get('/roles', AuthenticateUsuario, getAllRolesToUser);
router.get("/roles/temporal", AuthenticateUsuario, getAllRolesToUserTemporal);
router.get('/users', AuthenticateUsuario, AllUserBySubUnidad);
//router.put('/user/:id/status', toggleUserState);
/*router.get('/user/:dni',getUserwithDNI);
router.put('/user/:dni', );*/

export default router;