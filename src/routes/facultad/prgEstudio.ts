import express from 'express'
import { createPrgEstudio,deletePrgEstudio,getPrgEstudios,updatePrgEstudio } from '../../controllers/facultad/prgEstudio';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/programaestudio', createPrgEstudio);
router.get('/programaestudio', getPrgEstudios);
router.put('/programaestudio/:id', updatePrgEstudio);
router.delete('/programaestudio/:id', deletePrgEstudio);

export default router;