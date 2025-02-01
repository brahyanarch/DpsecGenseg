import express from 'express'
import {getProjectStatesAll,  getActivitiesAll,  upload, deleteProject, updateProject, getQuestionsByFormActive, createProject, getActivitysByProject, getProjectBySubUnidad, getProjectStates,  getActivitiesAllBySubunidad, getProjectByUserSubUnidad, getProjectAllBySubunidad} from '../../controllers/project/project';

const router = express.Router();

/** RUTAS REGISTRO Y LOGIN */
router.post('/project', upload.single('file'), createProject);
router.get('/project/form/:id', getQuestionsByFormActive);
router.get('/project/graficos/', getActivitiesAll);
router.get('/project/graficos/:id', getActivitiesAllBySubunidad);
router.get('/project/dona/:id', getProjectStates);
router.get('/project/dona/', getProjectStatesAll);
router.put('/project/:id',upload.single('file'), updateProject);
router.delete('/project/:id',deleteProject);
//router.get('/project/graficos/:id', getProjectAllBySubunidad);
router.get('/project/:id', getActivitysByProject);
router.get('/project/subunidad/:id', getProjectBySubUnidad);
router.get('/project/user/:dni/:idsub', getProjectByUserSubUnidad);

export default router;