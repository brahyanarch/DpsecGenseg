import express from 'express'
import PlantillaDocController from '../../controllers/plantillaDoc/plantillaDoc.controller';
import upload from '../../services/uploads.service';
// import {Authenticate} from "../../controllers/auth.controller";
import AuthController from '../../controllers/privilegios/usuarios.controller';
import {ValidatePlanPDF} from '../../middlewares/project/project.middleware';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/template', AuthController.AuthenticateUsuario, PlantillaDocController.createPlantillaDoc);
// devuelve las plantillas documentarias activas de un sub uinidad 
router.get('/template', AuthController.AuthenticateUsuario, PlantillaDocController.getPlantillaDocBySubUnidad);
router.get('/template/name/:id', AuthController.AuthenticateUsuario, PlantillaDocController.getNamePlantillaDocById);

export default router;