import express from 'express'
import ProjectController from '../../controllers/project/project.controller'
import {AuthenticateUsuario} from '../../controllers/privilegios/usuarios';
import {upload} from '../../utils/upload'
const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/project', AuthenticateUsuario, upload.single('file'), ProjectController.createProject);
router.get("/project", AuthenticateUsuario, ProjectController.getProjects);
export default router;