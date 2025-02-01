import express from 'express'
import { createEscuela,deleteEscuela,getEscuelas,updateEscuela } from '../../controllers/facultad/escuela';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/escuela', createEscuela);
router.get('/escuela', getEscuelas);
router.put('/escuela/:id', updateEscuela);
router.delete('/escuela/:id', deleteEscuela);

export default router;