import express from 'express'
import { createAnnouncement, getAnnouncements } from '../../controllers/pagina/anuncio';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/anuncio', createAnnouncement);
router.get('/anuncio', getAnnouncements);
router.get('/anuncio/:id', );
router.put('/anuncio/:id', );
router.delete('/anuncio/:id', );

export default router;