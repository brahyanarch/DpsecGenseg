import express from 'express'
import { createFacultad,deleteFacultad,getFacultades,updateFacultad } from '../../controllers/facultad/facultad';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/facultad', createFacultad);
router.get('/facultad', getFacultades);
router.put('/facultad/:id', updateFacultad);
router.delete('/facultad/:id', deleteFacultad);

export default router;