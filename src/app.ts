// src/app.ts
import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import { errorHandler } from './infrastructure/http/middlewares/error.middleware';
import userRoutes from './infrastructure/http/routes/user.routes';

dotenv.config()
const cors = require('cors')
const app = express()
const swaggerDocument = yaml.load('./swagger.yaml');


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(errorHandler);
app.use('/v1_001/auth', userRoutes);
app.use(errorHandler);

export default app;