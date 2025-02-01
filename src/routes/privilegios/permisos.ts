import express from 'express'
import { createPermisoWithDePermisos,deletePermisoWithDePermisos,updatePermisoWithDePermisos,createPermiso,getAllPermisos,deletePermiso,updatePermiso } from '../../controllers/privilegios/permisos';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/permisos', createPermisoWithDePermisos);
router.get('/permisos', getAllPermisos);
router.put('/permisos/:id', updatePermisoWithDePermisos);
router.delete('/permisos/:id', deletePermisoWithDePermisos);

export default router;