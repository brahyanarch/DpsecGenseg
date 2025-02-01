import express from 'express'
import { ToggleDetallePermiso, createDePermiso,deleteDePermiso,getAllDePermisos,updateDePermiso,getAllPermisosToUser } from '../../controllers/privilegios/de_permisos';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/de_permisos', createDePermiso);
router.get('/de_permisos', getAllDePermisos);
router.get('/de_permisos/:id', getAllPermisosToUser);
router.put('/de_permisos/:id', updateDePermiso);
router.delete('/de_permisos/:id', deleteDePermiso);
router.put('/de_permisos/toggle/:id/', ToggleDetallePermiso);
export default router;