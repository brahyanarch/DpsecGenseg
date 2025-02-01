import express from 'express'
import { newSubUnidad, getAllSubUnidades, updateSubUnidad, deleteSubUnidad } from '../../controllers/privilegios/subUnidad';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/subunidad', newSubUnidad);
router.get('/subunidad', getAllSubUnidades);
router.put('/subunidad/:id', updateSubUnidad);
router.delete('/subunidad/:id', deleteSubUnidad);

export default router;