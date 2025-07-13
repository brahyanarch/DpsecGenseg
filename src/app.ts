/* IMPORTAMOS DE DOTENV */
import dotenv from 'dotenv';
dotenv.config()
import path from 'path';

/** IMPORTAMOS DE LIBRERIAS  */
import express from 'express';
const cors = require('cors')

/** IMPORTAMOS RUTAS DE ARCHIVOS */
import authRoutes from './routes/AuthRoutes.routes'
import Usuarios from './routes/privilegios/usuarios.routes'
import Roles from './routes/privilegios/roles'
//import subUnidad from './routes/privilegios/subUnidad'
//import Permisos from './routes/privilegios/permisos'
//import De_permisos from './routes/privilegios/de_permisos'
import Form from './routes/project/form'
//import Preguntas from './routes/project/preguntas/pregunta'
//import Project from './routes/project/project.routes'
import PlantillaDoc from './routes/plantillaDoc/plantillaDoc.routes';
//import Actividad from './routes/project/actividades'
import Facultad from './routes/facultad/facultad'
import Escuela from './routes/facultad/escuela'
import PrgEstudio from './routes/facultad/prgEstudio'
/*import Pagina from './routes/pagina/pagina'
import Anuncio from './routes/pagina/anuncio'
import Plantilla from './routes/certificado/plantilla'
import Certificado from './routes/certificado/certificado'*/
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
//--------------
// APP CON EXPRESS
const app = express()
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Parsear archivos YAML
const swaggerDocument = yaml.load('./swagger.yaml');

app.use(express.json());

// CORS para el control del acceso a esta api
app.use(cors());

// RUTAS
// Ruta para servir la documentación
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/auth', authRoutes);
app.use('/api/auth', Usuarios);
app.use('/api', Roles);
//app.use('/api', subUnidad);
//app.use('/api', Permisos);
//app.use('/api', De_permisos);
//app.use('/api', Form);
app.use('/api', PlantillaDoc);
//app.use('/api/form', Preguntas);
//app.use('/api', Project);
//app.use('/api', Actividad);
app.use('/api', Facultad);
app.use('/api', Escuela);
app.use('/api', PrgEstudio);
/*app.use('/api', Pagina);
app.use('/api', Anuncio);
app.use('/api', Plantilla);
app.use('/api', Certificado);*/


export default app;