import express from 'express'
import {updateEstado, createForm, getAllFormsBySubUnidad, getQuestionsByForm, updateQuestion, deleteForm, getAllForms, updateForm } from '../../controllers/project/formulario';
import {AuthenticateUsuario} from '../../controllers/privilegios/usuarios';
import { ValidateInputForm, ValidateToggleForm, ValidateQuestionsForm} from '../../middlewares/project/validateInputForm';
const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/form', AuthenticateUsuario, ValidateInputForm, ValidateQuestionsForm, createForm);
//router.get('/form', getAllForms);
router.get('/form', AuthenticateUsuario, getAllFormsBySubUnidad);
router.get('/form/preguntas/:id', AuthenticateUsuario, getQuestionsByForm);
router.put('/form/preguntas/:id', AuthenticateUsuario, updateQuestion);
router.put('/form/toggle/:id', AuthenticateUsuario, ValidateToggleForm, updateEstado);
//router.put('/form/:id', updateForm);
router.delete('/form/:id', deleteForm);

export default router;