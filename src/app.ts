/* IMPORTAMOS DE DOTENV */
import dotenv from 'dotenv';
dotenv.config()
import path from 'path';

/** IMPORTAMOS DE LIBRERIAS  */
import express from 'express';
const cors = require('cors')

/** IMPORTAMOS RUTAS DE ARCHIVOS */
import authRoutes from './routes/AuthRoutes.routes'
import Usuarios from './routes/privilegios/usuarios.route'
import Roles from './routes/privilegios/roles'
//import subUnidad from './routes/privilegios/subUnidad'
import Permisos from './routes/privilegios/permisos'
import Task from './routes/task/task.routes'
import Form from './routes/project/form.route'
import Project from './routes/project/project.route'
import TemplateDoc from './routes/plantillaDoc/plantillaDoc.routes'
/*
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
app.use('/api', Permisos);
app.use('/api', Form);
app.use('/api', Project);
app.use('/api', TemplateDoc);
app.use('/api', Task);



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;