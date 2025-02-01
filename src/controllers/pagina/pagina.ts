import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';

const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/carousel");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
});

export const upload = multer({ storage });

export const createCarouselConfig = async (req: Request, res: Response) => {
    const { title1, desc1, title2, desc2, title3, desc3, title4, desc4 } = req.body;
    const files = req.files as Express.Multer.File[];
    
    console.log(files, "files recibidos");
    console.log("title1", title1, "desc1", desc1, "title2", title2, "desc2", desc2, "title3", title3, "desc3", desc3, "title4", title4, "desc4", desc4);  
    if (!title1 || !desc1 || !title2 || !desc2 || !title3 || !desc3 || !title4 || !desc4 || files.length !== 4) {
        return res.status(400).json({ error: "All titles, descriptions, and 4 images are required." });
    }
    try {

        const carouselData = [
            {idcarrusel: 1, titulo: title1, subtitulo: desc1, img: files[0].path },
            {idcarrusel: 2, titulo: title2, subtitulo: desc2, img: files[1].path },
            {idcarrusel: 3, titulo: title3, subtitulo: desc3, img: files[2].path },
            {idcarrusel: 4, titulo: title4, subtitulo: desc4, img: files[3].path },
        ];


        const isCarrusel = await prisma.carrusel.findMany({});
        if (isCarrusel.length === 0) {
            const carousel = await prisma.carrusel.createMany({
                data: carouselData,
            });
            if (!carousel) {
                res.status(404).json({ error: "Carousel configuration not found." });
                return;
            }
            res.status(201).json({ message: "Carousel configuration saved successfully.", carousel });
            return;
        }
        else{
            // Actualizar múltiples registros usando Promise.all
            const updatePromises = carouselData.map((data) => 
                prisma.carrusel.update({
                    where: { idcarrusel: data.idcarrusel },
                    data: {
                        titulo: data.titulo,
                        subtitulo: data.subtitulo,
                        img: data.img,
                    },
                })
            
            );
            const updatedCarousels = await Promise.all(updatePromises);
            res.status(201).json({ message: "Carousel configuration updated successfully.", updatedCarousels });
            return;
        }
        
    } catch (error) {
        console.error("Error saving carousel configuration:", error);
        res.status(500).json({ error: "Internal server error." });
        return;
    }
};

export const getCarouselConfig = async (req: Request, res: Response) => {
    try {
        const carousel = await prisma.carrusel.findMany({});
        
        if (!carousel) {
            return res.status(404).json({ error: "Carousel configuration not found." });
        }
        
        res.status(200).json(carousel);
    } catch (error) {
        console.error("Error fetching carousel configuration:", error);
        res.status(500).json({ error: "Internal server error." });
        return;
    }
};      
                
export const getEstudiante = async (req: Request, res: Response) => {
    const { codigo, dni } = req.params;

    if (!codigo || !dni) {
    res.status(400).json({ error: 'Codigo y DNI son obligatorios' });
    return;
}

    try {
    const estudiante = await prisma.estudiante.findUnique({
        where: {
            codigo: String(codigo),
            dni: String(dni),
        },
        include : {
        prgest: true,
        }
    });

    if (!estudiante) {
        res.status(404).json({ error: 'Estudiante no encontrado' });
        return;
    }

    res.json({estudiante});
    } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    return;
    }
};

export const AllActivitiesPublic = async (req: Request, res: Response) => {
    try {
        const activities = await prisma.actividad.findMany({
            where: {
                public: true
            },
            include: {
                project: {
                    include: {
                        usuario: true
                }
                }
            }

        });


        if (!activities || activities.length === 0) {
            res.status(404).json({ error: "No activities found." });
            return;
        }

        res.status(200).json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export const Inscripcion = async (req: Request, res: Response) => {
    const { idactividad, idestudiante } = req.body;

    if (!idactividad || !idestudiante) {
        res.status(400).json({ error: "Activity ID and student ID are required." });
        return;
    }

    try {

        const isRegistered = await prisma.alumnoActividad.findFirst({
            where: {
                actividadId: Number(idactividad),
                alumnoId: Number(idestudiante),
            },
        });
        if (isRegistered) {
            res.status(404).json({ message: "El usuario ya esta registrado" });
            return;
        }

        const inscripcion = await prisma.alumnoActividad.create({
            data: {
                actividadId: Number(idactividad),
                alumnoId: Number(idestudiante),
                estado: "INSCRITO",
            },
        });
        if (!inscripcion) {
            res.status(404).json({ message: "El usuario ya esta registrado" });
            return;
        }

        res.status(201).json({ message: "Inscripción realizada correctamente.", inscripcion });
    } catch (error) {
        console.error("Error creating inscription:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}



export const ActivitiCompletToAlumno = async (req: Request, res: Response) => {
    const { dni, id } = req.params;
    if (!dni || !id) {
        res.status(400).json({ error: "id subunidad " });
        return;
    }
    const idsubunidad = Number(id);
    try {
        const actividadesAsistidas = await prisma.alumnoActividad.findMany({
            where: {
              alumno: {
                dni: dni, // DNI del estudiante
              },
              actividad: {
                project: {
                  subunidad_id_subuni: idsubunidad, // ID de la subunidad
                },
              },
            },
            include: {
              actividad: {
                select: {
                  name: true, // Nombre de la actividad
                  fInit: true, // Fecha de inicio
                  fFin: true, // Fecha de finalización
                  estado: true, // Estado de la actividad
                  public: true, // Indicador si es pública
                },
              },
              alumno: {
                select: {
                    dni: true, // DNI del estudiante
                    codigo: true, // Código del estudiante
                    aMaterno: true, // Apellido materno
                    aPaterno: true, // Apellido paterno
                    nombre: true, // Nombres
                    prgest: {
                        select: {
                            nmPE: true, // Programa de estudio
                            },
                        },
                    },
                },
            },
        });
        // Contar el número de actividades asistidas
    const numeroActividadesAsistidas = await prisma.alumnoActividad.count({
        where: {
            alumno: {
                dni: dni,
            },
            actividad: {
                project: {
                    subunidad_id_subuni: idsubunidad,
                },
            },
            asistio: true,
        },
    });

    if (!actividadesAsistidas) {
        res.status(404).json({ error: 'Actividades no encontradas' });
        return;
    }
    if (numeroActividadesAsistidas >= 3) {
        res.status(201).json({ message: "Solicitar certificado esta disponible.",  actividadesAsistidas , solicitar:true});
        return;
    }
    else {
        res.status(201).json({ message: "Solicitar certificado no disponible.",  actividadesAsistidas, solicitar:false });
        return;
    }
    } catch (error) {
        console.error("Error creating inscription:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}