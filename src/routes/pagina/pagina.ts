import express from 'express'
import { ActivitiCompletToAlumno, Inscripcion,  AllActivitiesPublic, upload, getEstudiante, createCarouselConfig, getCarouselConfig } from '../../controllers/pagina/pagina';


const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/carrusel',upload.array('files'), createCarouselConfig);
router.get('/carrusel', getCarouselConfig);
router.get('/estudiante/:codigo/:dni/', getEstudiante);
router.get('/actividades/pagina/', AllActivitiesPublic);
router.post('/inscripcion/', Inscripcion);

router.get('/completados/actividades/:dni/:id',ActivitiCompletToAlumno );

export default router;