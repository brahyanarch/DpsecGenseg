import express from 'express'
import PlantillaDocController from '../../controllers/plantillaDoc/plantillaDoc.controller';
import upload from '../../services/uploads.service';
// import {Authenticate} from "../../controllers/auth.controller";
import AuthController from '../../controllers/privilegios/usuarios.controller';
import {ValidatePlanPDF} from '../../middlewares/project/project.middleware';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/template/doc', AuthController.AuthenticateUsuario, PlantillaDocController.createPlantillaDoc);
// devuelve las plantillas documentarias activas de un sub uinidad 
router.get('/template/doc', AuthController.AuthenticateUsuario, PlantillaDocController.getPlantillasBySubUnidad);
router.get('/template/doc/body/:id', AuthController.AuthenticateUsuario, PlantillaDocController.getBodyDocumentById);
router.put('/template/toggle/:id', AuthController.AuthenticateUsuario, PlantillaDocController.toggleEstadoPlantillaDoc);
router.get('/template/doc/actives', AuthController.AuthenticateUsuario, PlantillaDocController.getAllActivePlantillas);
export default router;