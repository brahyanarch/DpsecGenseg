import express from 'express'
import FormController from '../../controllers/project/formulario.controller';
import {AuthenticateUsuario} from '../../controllers/privilegios/usuarios';
import { ValidateInputForm, ValidateToggleForm, ValidateQuestionsForm} from '../../middlewares/project/project.middleware';
const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/form', AuthenticateUsuario, ValidateInputForm, ValidateQuestionsForm, FormController.createForm);
router.post('/form/:id/copy', AuthenticateUsuario, FormController.duplicateForm);
router.get('/form', AuthenticateUsuario, FormController.getAllFormsBySubUnidad);
router.get('/form/preguntas/:id', AuthenticateUsuario, FormController.getQuestionsByForm);
router.put('/form/preguntas/:id', AuthenticateUsuario, FormController.updateQuestion);
router.put('/form/toggle/:id', AuthenticateUsuario, ValidateToggleForm, FormController.updateEstado);
//router.put('/form/:id', updateForm);
router.delete('/form/:id', FormController.deleteForm);
router.get('/form/preguntas', AuthenticateUsuario, FormController.getAllQuestions);
router.get('/form/actives', AuthenticateUsuario, FormController.getAllActiveForms);
router.get('/form/config/:id', AuthenticateUsuario, FormController.getConfigForm);

export default router;

{}