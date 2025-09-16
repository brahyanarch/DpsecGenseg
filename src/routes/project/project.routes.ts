import express from 'express'
<<<<<<<< HEAD:src/routes/project/project1.ts
import {getProjectStatesAll,  getActivitiesAll,  upload, deleteProject, updateProject, getQuestionsByFormActive, createProject, getActivitysByProject, getProjectBySubUnidad, getProjectStates,  getActivitiesAllBySubunidad, getProjectByUserSubUnidad, getProjectAllBySubunidad} from '../../controllers/project/project_antes';
========
import ControllerProject from '../../controllers/project/project.controller';
import upload from '../../services/uploads.service';
// import {Authenticate} from "../../controllers/auth.controller";
import AuthController from '../../controllers/privilegios/usuarios.controller';
import {ValidatePlanPDF} from '../../middlewares/project/project.middleware';
>>>>>>>> 0c91bd385c7b85e84376d7439330e75870f99d44:src/routes/project/project.routes.ts

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/project', AuthController.AuthenticateUsuario, ValidatePlanPDF,upload.single('plan'), ControllerProject.createProject);
router.get('/project/form', AuthController.AuthenticateUsuario, ControllerProject.getQuestionsByFormActive);
router.get('/project/usuario', AuthController.AuthenticateUsuario, ControllerProject.getProjectByUsuario);
/*
router.get('/project/form/:id', getQuestionsByFormActive);
router.get('/project/graficos/', getActivitiesAll);
router.get('/project/graficos/:id', getActivitiesAllBySubunidad);
router.get('/project/dona/:id', getProjectStates);
router.get('/project/dona/', getProjectStatesAll);
router.put('/project/:id',upload.single('file'), updateProject);
router.delete('/project/:id',deleteProject);
//router.get('/project/graficos/:id', getProjectAllBySubunidad);
router.get('/project/:id', getActivitysByProject);
router.get('/project/subunidad/:id', getProjectBySubUnidad);
router.get('/project/user/:dni/:idsub', getProjectByUserSubUnidad);
*/
export default router;