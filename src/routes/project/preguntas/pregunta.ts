import express from 'express'
import { getQuestionsByForm, EnviarDynamicQuestions, handleDynamicQuestions,updateQuestionsByForm } from '../../../controllers/project/preguntas/pregunta';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
//router.post('/preguntas', handleDynamicQuestions);
router.post('/preguntas/probar', EnviarDynamicQuestions);
router.get('/preguntas/:id', getQuestionsByForm);
router.put('/preguntas/:id', updateQuestionsByForm);
router.delete('/preguntas/:id', );

export default router;