import express from 'express'
import {updateEstado, createForm, getAllFormsBySubUnidad, getQuestionsByForm, updateQuestion, deleteForm, copyForm, updateForm } from '../../controllers/project/formulario';
import AuthController from '../../controllers/privilegios/usuarios.controller';
import { ValidateInputForm, ValidateToggleForm, ValidateQuestionsForm} from '../../middlewares/project/project.middleware';
const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/form', AuthController.AuthenticateUsuario, ValidateInputForm, ValidateQuestionsForm, createForm);
router.get('/form', AuthController.AuthenticateUsuario, getAllFormsBySubUnidad);
router.post('/form/:id/copy', AuthController.AuthenticateUsuario, copyForm);
router.get('/form/preguntas/:id', AuthController.AuthenticateUsuario, getQuestionsByForm);
router.put('/form/preguntas/:id', AuthController.AuthenticateUsuario, updateQuestion);
router.put('/form/toggle/:id', AuthController.AuthenticateUsuario, ValidateToggleForm, updateEstado);
//router.put('/form/:id', updateForm);
router.delete('/form/:id', AuthController.AuthenticateUsuario, deleteForm);

export default router;