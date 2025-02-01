import express from 'express'
import { upload, createPlantilla,getPlantillasBySubunidad } from '../../controllers/certificado/plantilla';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/plantilla',upload.single('file'),  createPlantilla);
router.get('/plantilla/:id/', getPlantillasBySubunidad);
router.put('/plantilla/:id', );
router.delete('/plantilla/:id', );

export default router;