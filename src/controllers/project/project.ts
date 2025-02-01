import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Asegúrate de que exista la carpeta de destino
const uploadFolder = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
    
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({ storage });


export const createProject = async (req: Request, res: Response) => {
    const { dni, id_rol, subunidad, tipo } = req.body;

    //console.log(req.file, "file");
    if (!req.file || !dni || !id_rol || !subunidad) {
        res.status(400).json({ error: 'Todos los campos son requeridos.' });
        return;
    }
    // Obtener la ruta del archivo
    const planPath = req.file.path;
    const fileUrl = `https://2nlfx0w1-3000.brs.devtunnels.ms/uploads/${req.file.filename}`; // Construir la URL pública
    
    const date = new Date();
    date.setHours(date.getHours() - 5);

    try {
        // Crear proyecto
        
        const newProject = await prisma.project.create({
            data: {
                plan: planPath,
                dni: dni,
                id_rol: Number(id_rol),
                subunidad_id_subuni: Number(subunidad),
                estado: "Pendiente",// actualizar este estado posteriormente
                tipo: tipo ? tipo:"PROGRAMAESTUDIO", // Add the appropriate value for 'tipo'
            },
        });

        const sub = await prisma.sub_unidad.findUnique({
            where: { id_subuni : Number(subunidad) }
        });
        if(!sub){
            res.status(400).json({ error: 'No existe la subunidad.' });
            return;
        }
        const usuario = await prisma.usuario.findFirst({
            where: { dni : newProject.dni }
        });
        
        if(!usuario){
            res.status(400).json({ error: 'No existe el usuario.' });
            return;
        }
        if (usuario.idpe === null) {
            await prisma.project.update({
                where:{
                    idproj: newProject.idproj,
                },
                data:{
                    idString: generarIdProyecto("PSUB", sub.abreviatura, newProject.idproj),
                    tipo: "SUBUNIDAD"
                }
            })
            console.log(newProject, "Proyecto creado exitosamente");
            res.status(201).json({ message: 'Proyecto creado exitosamente.', project: newProject, idproj: newProject.idproj, url:fileUrl });
            return;
        }
        const prgEstudio = await prisma.prgEstudio.findUnique({
            where: { idpe: usuario.idpe }
        });
        if (!prgEstudio) {
            res.status(400).json({ error: 'No existe el prgEstudio.' });
            return;
        }

        await prisma.project.update({
            where:{
                idproj: newProject.idproj,
            },
            data:{
                idString: generarIdProyecto(prgEstudio.abrev || "NAN", sub.abreviatura, newProject.idproj),
            }
        })
        console.log(newProject, "Proyecto creado exitosamente");
        res.status(201).json({ message: 'Proyecto creado exitosamente.', project: newProject, idproj: newProject.idproj, url:fileUrl });
    } catch (error) {
        console.error('Error al crear el proyecto:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Ocurrió un error al crear el proyecto.' });
    }
};

function generarIdProyecto(
    abreviaturaPrograma: string,
    abreviaturaSubunidad: string,
    id: number
  ): string {
    
    const idConFormato = id.toString().padStart(3, "0"); // Asegura 3 dígitos
  
    return `${abreviaturaPrograma}-${abreviaturaSubunidad}-${idConFormato}`;
  }

export const updateProject = async (req: Request, res: Response) => {
    const { id }=req.params;
    // Verificar que se haya enviado el ID del proyecto
    if (!id) {
        res.status(400).json({ error: 'El ID del proyecto es requerido.' });
        return;
    }

    try {
        const planPath = req.file?.path;
        // Buscar el proyecto por ID para verificar si existe
        const existingProject = await prisma.project.findUnique({
            where: { idproj: Number(id) },
        });

        if (!existingProject) {
            res.status(404).json({ error: 'El proyecto especificado no existe.' });
            return;
        }

        // Actualizar el proyecto con los datos proporcionados
        const updatedProject = await prisma.project.update({
            where: { idproj: Number(id) },
            data: {
                plan: planPath,
            },
        });

        res.status(200).json({ message: 'Proyecto actualizado exitosamente.', project: updatedProject });
        return;
    } catch (error) {
        console.error('Error al actualizar el proyecto:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Ocurrió un error al actualizar el proyecto.' });
        return;
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;

    // Verificar que se haya enviado el ID del proyecto
    if (!id) {
        res.status(400).json({ error: 'El ID del proyecto es requerido.' });
        return;
    }

    try {
        // Verificar si el proyecto existe
        const existingProject = await prisma.project.findUnique({
            where: { idproj: Number(id) },
        });

        if (!existingProject) {
            res.status(404).json({ error: 'El proyecto especificado no existe.' });
            return;
        }

        // Eliminar el proyecto
        await prisma.project.delete({
            where: { idproj: Number(id) },
        });

        res.status(200).json({ message: 'Proyecto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar el proyecto:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Ocurrió un error al eliminar el proyecto.' });
    }
};

export const getQuestionsByFormActive = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const form = await prisma.form.findFirst({ where: {estado: true, idsubuni: Number(id)} });
        if(!form){
            res.status(404).json({ message: "No existe un formulario activo" });
            return;
        }
        const questions = await prisma.prg.findMany({
            where: { idf: Number(form?.idf) },
            include: {
                opcmul: true, // Incluye opciones de preguntas de tipo 'multipleChoice'
                opcuni: true, // Incluye opciones de preguntas de tipo 'singleChoice'
                opcdes: true, // Incluye opciones de preguntas de tipo 'dropdown'
            },
        });

        // Transformar las preguntas en un formato legible
        const formattedQuestions = questions.map((question) => {
            const { idp, type, nmPrg, opcmul, opcuni, opcdes } = question;

            if (type === "multipleChoice") {
                return {
                    id: idp,
                    type,
                    questionText: nmPrg,
                    options: opcmul.map((option) => ({idop: option.idomul, optionTxt: option.txtOpc})),
                };
            }

            if (type === "singleChoice") {
                return {
                    id: idp,
                    type,
                    questionText: nmPrg,
                    options: opcuni.map((option) => ({idop: option.idoUni, optionTxt: option.txtOpc})),
                };
            }

            if (type === "dropdown") {
                return {
                    id: idp,
                    type,
                    questionText: nmPrg,
                    options: opcdes.map((option) => ({idop: option.idodes, optionTxt: option.txtOpc})),
                };
            }

            return {
                id: idp,
                type,
                questionText: nmPrg,
            };
        });
        res.status(200).json(formattedQuestions);
        return;
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las preguntas", error: error.message });
        return;
    }
};

export const getProjectBySubUnidad = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    try {
        // Obtener los proyectos de una subunidad 
        const projectSubUnidad = await prisma.project.findMany({
            where:{
                subunidad_id_subuni: Number(id)
            },
            orderBy: {
                idproj: 'asc', // Ordenar de forma ascendente; usa 'desc' si necesitas descendente
            }
        })
        if(!projectSubUnidad){
            return res.status(400).json({ message: "Nigun proyecto con el id de sub unidad proporcionado" });
        }
        res.status(201).json({ message: 'Obtenido los proyectos de la sub unidad', projects: projectSubUnidad });
    } catch (error) {
        console.error('Error al crear el proyecto:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Ocurrió un error al obtener los proyectos.' });
    }
};


export const getActivitysByProject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Asumimos que el ID viene en los parámetros de la ruta
    try {
        // Validar que se proporciona el ID
        if (!id) {
            res.status(400).json({ message: 'El ID es obligatorio' });
            return;
        }
        
        // Convertir el ID a número (si es necesario)
        const projId = Number(id);

        // Verificar que el registro existe
        const ActivitysByProject = await prisma.actividad.findMany({
            where: { idproj: projId },
        });

        // Manejo si `existingSubUnidad` es null
        if (!ActivitysByProject) {
            res.status(404).json({ message: 'No existe actividades de este proyecto' });
            return;
        }
        // Datos del projecto
        const datasProject = await prisma.project.findFirst({
            where:{
                idproj: projId
            },
        })
        // Manejo si existe o es null
        if (!datasProject) {
            res.status(404).json({ message: 'No existe datos del proyecto' });
            return;
        }
        const user = await prisma.usuario.findFirst({
            where:{
                dni: datasProject.dni
            }
        })
        if(!user){
            res.status(404).json({ message: 'No existe usuario' });
            return;
        }
        if (user.idpe === null) {
            res.status(202).json({ message: 'Actividades del proyecto', actividades: ActivitysByProject, datasProject, prgest: {nmPE: "NAN"}});
            return;
        }
        const prgest = await prisma.prgEstudio.findFirst({  
            where: { idpe: user.idpe },
        });
        if(!prgest){
            res.status(404).json({ message: 'No existe prgestudio' });
            return;
        }


        

        // Enviar respuesta exitosa
        res.status(200).json({ message: 'Actividades del proyecto', actividades: ActivitysByProject, datasProject, prgest});
        return;
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Hubo un error al eliminar el formulario',
            error: error.message,
        });
        return;
    }

}


export const getProjectByUserSubUnidad = async (req: Request, res: Response): Promise<void> => {
    const {  dni, idsub } = req.params; // Asumimos que el ID viene en los parámetros de la ruta
    try {
        // Validar que se proporciona el ID
        if (!idsub || !dni) {
            res.status(400).json({ message: 'Los datos son requeridos' });
        }
        // Convertir el ID a número (si es necesario)
        const idSub = parseInt(idsub);

        // Verificar que el registro existe
        const projectsByUserSubUnidad = await prisma.project.findMany({
            where: { 
                subunidad_id_subuni: idSub, 
                dni: dni
            },
            select:{
                idproj:true,
                estado: true,
                idString: true,
                fFin: true,
                fInit: true
                
            },
            orderBy: {
                idproj: 'asc', // Ordenar de forma ascendente; usa 'desc' si necesitas descendente
            }
        });

        // Manejo si es null
        if (!projectsByUserSubUnidad) {
            res.status(404).json({ message: 'No existe proyectos' });
        }

        // Enviar respuesta exitosa
        res.status(200).json({ message: 'Actividades del proyecto',  projectSubUnidad:projectsByUserSubUnidad});
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Hubo un error al eliminar el formulario',
            error: error.message,
        });
    }

}


export const getProjectAllBySubunidad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        if (!id) {
            res.status(400).json({ message: "El ID de la subunidad es requerido" });
            return;
        }

        const projects = await prisma.project.findMany({
            where: {
                subunidad_id_subuni: Number(id),
            },
            select: {
                estado: true,
                fInit: true,
            },
        });

        if (!projects || projects.length === 0) {
            res.status(404).json({ message: "No se encontraron proyectos" });
            return;
        }

        // Transformar y agrupar por mes
        const monthlyAccumulation: Record<string, { date: string; completado: number; pendiente: number; archivado: number; curso: number }> = {};

        projects.forEach((project) => {
            if (project.fInit) {
                const date = new Date(project.fInit);
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // Formato "YYYY-MM"

                if (!monthlyAccumulation[yearMonth]) {
                    monthlyAccumulation[yearMonth] = {
                        date: yearMonth + "-05", // Fecha formateada como "YYYY-MM-05" (día fijo)
                        completado: 0,
                        pendiente: 0,
                        archivado: 0,
                        curso: 0,
                    };
                }

                // Acumular datos según estado del proyecto
                if (project.estado === "Completado") monthlyAccumulation[yearMonth].completado++;
                if (project.estado === "Pendiente") monthlyAccumulation[yearMonth].pendiente++;
                if (project.estado === "Archivado") monthlyAccumulation[yearMonth].archivado++;
                if (project.estado === "Curso") monthlyAccumulation[yearMonth].curso++;
            }
        });

        // Convertir el objeto acumulado a un array
        const transformedProjects = Object.values(monthlyAccumulation);

        res.status(200).json(transformedProjects);
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getActivitiesAllBySubunidad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        if (!id) {
            res.status(400).json({ message: "El ID de la subunidad es requerido" });
            return;
        }

        // Obtener todas las actividades de los proyectos relacionados con la subunidad
        const activities = await prisma.actividad.findMany({
            where: {
                project: {
                    subunidad_id_subuni: Number(id), // Relación con proyectos de la subunidad
                },
            },
            select: {
                estado: true,
                fInit: true,
            },
        });

        if (!activities || activities.length === 0) {
            res.status(404).json({ message: "No se encontraron actividades" });
            return;
        }

        // Transformar y agrupar actividades por mes
        const monthlyAccumulation: Record<string, { date: string; completado: number; pendiente: number; archivado: number; curso: number }> = {};

        activities.forEach((activity) => {
            if (activity.fInit) {
                const date = new Date(activity.fInit);
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // Formato "YYYY-MM"

                if (!monthlyAccumulation[yearMonth]) {
                    monthlyAccumulation[yearMonth] = {
                        date: yearMonth + "-05", // Fecha formateada como "YYYY-MM-05" (día fijo)
                        completado: 0,
                        pendiente: 0,
                        archivado: 0,
                        curso: 0,
                    };
                }

                // Acumular datos según estado de la actividad
                if (activity.estado === "Completado") monthlyAccumulation[yearMonth].completado++;
                if (activity.estado === "Pendiente") monthlyAccumulation[yearMonth].pendiente++;
                if (activity.estado === "Archivado") monthlyAccumulation[yearMonth].archivado++;
                if (activity.estado === "Curso") monthlyAccumulation[yearMonth].curso++;
            }
        });

        // Convertir el objeto acumulado a un array
        const transformedActivities = Object.values(monthlyAccumulation);

        // Ordenar las actividades por fecha ascendente
        transformedActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        res.status(200).json(transformedActivities);
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


export const getProjectStates = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        if (!id) {
            res.status(400).json({ message: "El ID de la subunidad es requerido" });
            return;
        }

        // Obtener todos los proyectos relacionados con la subunidad
        const projects = await prisma.project.findMany({
            where: {
                subunidad_id_subuni: Number(id), // Relación con la subunidad
            },
            select: {
                estado: true, // Selecciona el campo "estado"
            },
        });

        if (!projects || projects.length === 0) {
            res.status(404).json({ message: "No se encontraron proyectos" });
            return;
        }

        // Contar los estados
        const stateCounts = projects.reduce(
            (acc, project) => {
                acc[project.estado] = (acc[project.estado] || 0) + 1;
                return acc;
            },
            { Completado: 0, Pendiente: 0, Archivado: 0, Curso: 0 } as Record<string, number>
        );
        const total = projects.length;
        res.status(200).json({...stateCounts, total});
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


export const getProjectStatesAll = async (req: Request, res: Response): Promise<void> => {

    try {

        // Obtener todos los proyectos relacionados con la subunidad
        const projects = await prisma.project.findMany({
            select: {
                estado: true, // Selecciona el campo "estado"
            },
        });

        if (!projects || projects.length === 0) {
            res.status(404).json({ message: "No se encontraron proyectos" });
            return;
        }

        // Contar los estados
        const stateCounts = projects.reduce(
            (acc, project) => {
                acc[project.estado] = (acc[project.estado] || 0) + 1;
                return acc;
            },
            { Completado: 0, Pendiente: 0, Archivado: 0, Curso: 0 } as Record<string, number>
        );
        const total = projects.length;
        res.status(200).json({...stateCounts, total});
    } catch (error) {
        console.error("Error al obtener proyectos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


export const getActivitiesAll = async (req: Request, res: Response): Promise<void> => {


    try {

        // Obtener todas las actividades de los proyectos relacionados con la subunidad
        const activities = await prisma.actividad.findMany({
            where: {
            },
            select: {
                estado: true,
                fInit: true,
            },
        });

        if (!activities || activities.length === 0) {
            res.status(404).json({ message: "No se encontraron actividades" });
            return;
        }

        // Transformar y agrupar actividades por mes
        const monthlyAccumulation: Record<string, { date: string; completado: number; pendiente: number; archivado: number; curso: number }> = {};

        activities.forEach((activity) => {
            if (activity.fInit) {
                const date = new Date(activity.fInit);
                const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // Formato "YYYY-MM"

                if (!monthlyAccumulation[yearMonth]) {
                    monthlyAccumulation[yearMonth] = {
                        date: yearMonth + "-05", // Fecha formateada como "YYYY-MM-05" (día fijo)
                        completado: 0,
                        pendiente: 0,
                        archivado: 0,
                        curso: 0,
                    };
                }

                // Acumular datos según estado de la actividad
                if (activity.estado === "Completado") monthlyAccumulation[yearMonth].completado++;
                if (activity.estado === "Pendiente") monthlyAccumulation[yearMonth].pendiente++;
                if (activity.estado === "Archivado") monthlyAccumulation[yearMonth].archivado++;
                if (activity.estado === "Curso") monthlyAccumulation[yearMonth].curso++;
            }
        });

        // Convertir el objeto acumulado a un array
        const transformedActivities = Object.values(monthlyAccumulation);

        // Ordenar las actividades por fecha ascendente
        transformedActivities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        res.status(200).json(transformedActivities);
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};