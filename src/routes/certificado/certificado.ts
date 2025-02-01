import express from 'express'
import { createCertificadoAlumno, getAllCertificados } from '../../controllers/certificado/certificado';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/certificado',createCertificadoAlumno);
router.get('/certificado/:dni/', getAllCertificados);
router.put('/certificado/:id', );
router.delete('/certificado/:id', );

export default router;