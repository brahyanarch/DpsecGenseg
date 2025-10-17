import express from 'express'
import TaskController from '../../controllers/task/task.controller'
const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/task', TaskController.createTask);
router.get("/task", TaskController.getTasks);
export default router;