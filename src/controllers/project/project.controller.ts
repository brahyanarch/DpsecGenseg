import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

class ProjectController {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    
    /* REGISTRO DEl SISTEMA */
    public createProject = async (req: Request, res: Response): Promise<void> => {
        try {
            const { actividades } = req.body;
            const file = req.file as Express.Multer.File; // Cambio clave aquí
            
            if (!file ) {
                res.status(400).json({ error: "Missing required plan" });
                return;
            }
            if (!actividades ) {
                res.status(400).json({ error: "Missing required actividades" });
                return;
            }
            if ( !file) {
                res.status(400).json({ error: "Missing required file" });
                return;
            }

            // Lógica para guardar el proyecto...
            console.log("Creating project with plan:", file);
            console.log("Activities:", actividades);
            console.log("Uploaded file:", file.originalname);
            res.status(201).json({ message: "Project created" });
        } catch (error) {
            console.error("Project creation error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
    public getQuestionsByFormActive = async (req: Request, res: Response): Promise<void> => {
        try {
            const idSubUnidad = Number(req.usuario?.idsubunidad);
            const ActiveForm = await this.prisma.form.findFirst({
                where: {
                    idsubuni: idSubUnidad,
                    estado: true
                }
            });
            if (!ActiveForm) {
                res.status(404).json({ error: "No active form found for this subunit" });
                return;
            }
            const questions = await this.prisma.prg.findMany({
                where: {
                    idf: ActiveForm.idf
                },
                select: {
                    idp: true,
                    opcs: true,
                    nmPrg: true,
                    type: true
                }
            });
            res.status(200).json(questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
    public getProjectByUsuario = async (req: Request, res: Response): Promise<void> => {
        try {
            const idUsuario = Number(req.usuario?.iduser);
            const projects = this.prisma.project.findMany({
                where: {
                    iduser: idUsuario
                },
                select:{
                    fInit: true,
                    fFin: true,
                    estado: true,
                    idString: true,
                    plan: true,
                    tipo: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })
            res.status(200).json(projects);
        } catch (error: any) {
            
        }
    }
}

export default new ProjectController();

/*
[
    {
        "id": 1,
        "nombre": "Actividad Principal",
        "fechaInicio": "2025-06-07T05:00:00.000Z",
        "fechaFin": "2025-06-12T05:00:00.000Z",
        "preguntas": [
            {
                "id": "1",
                "tipo": "texto",
                "enunciado": "Descripción detallada de la actividad"
            },
            {
                "id": "2",
                "tipo": "opcion_unica",
                "enunciado": "Tipo de actividad",
                "opciones": [
                    "Desarrollo",
                    "Investigación",
                    "Pruebas",
                    "Documentación"
                ]
            },
            {
                "id": "3",
                "tipo": "multiple",
                "enunciado": "Recursos requeridos",
                "opciones": [
                    "Personal",
                    "Equipos",
                    "Materiales",
                    "Financiamiento"
                ]
            },
            {
                "id": "4",
                "tipo": "fecha",
                "enunciado": "Fecha crítica de revisión"
            },
            {
                "id": "5",
                "tipo": "archivo",
                "enunciado": "Documentación adicional (opcional)"
            }
        ],
        "respuestas": {
            "1": "Descripcion de la actividad",
            "2": "Desarrollo",
            "3": [
                "Personal",
                "Materiales",
                "Personal",
                "Equipos"
            ],
            "4": "2025-06-12",
            "5": {}
        },
        "archivo": {}
    },
    {
        "id": 2,
        "nombre": "Actividad 2",
        "fechaInicio": "2025-06-19T05:00:00.000Z",
        "fechaFin": "2025-06-27T05:00:00.000Z",
        "preguntas": [
            {
                "id": "1",
                "tipo": "texto",
                "enunciado": "Descripción detallada de la actividad"
            },
            {
                "id": "2",
                "tipo": "opcion_unica",
                "enunciado": "Tipo de actividad",
                "opciones": [
                    "Desarrollo",
                    "Investigación",
                    "Pruebas",
                    "Documentación"
                ]
            },
            {
                "id": "3",
                "tipo": "multiple",
                "enunciado": "Recursos requeridos",
                "opciones": [
                    "Personal",
                    "Equipos",
                    "Materiales",
                    "Financiamiento"
                ]
            },
            {
                "id": "4",
                "tipo": "fecha",
                "enunciado": "Fecha crítica de revisión"
            },
            {
                "id": "5",
                "tipo": "archivo",
                "enunciado": "Documentación adicional (opcional)"
            }
        ],
        "respuestas": {
            "1": "Actividad al detalle, ",
            "2": "Investigación",
            "3": [
                "Materiales",
                "Financiamiento"
            ],
            "4": "2025-07-18",
            "5": {}
        },
        "archivo": {}
    }
]
*/