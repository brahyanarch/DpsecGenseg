import { Request, Response } from "express";
import { PrismaClient, Type } from "@prisma/client";
import {HoraLima} from "../../services/horaLima.service"
//import {  } from "../../models/interface/user.interface";
const prisma = new PrismaClient();


export const createForm = async (req: Request, res: Response): Promise<void> => {
    const { name, preguntas } = req.body;
    const date = HoraLima();
    //console.log("preguntas, ", preguntas);
      try {
        const newForm = await prisma.plantillaDoc.create({
          data: {
            idsubuni: Number(req.usuario?.idsubunidad),
            nombre:name,
            abre: name.substring(0, 3) + date.getFullYear() +'-'+ req.usuario?.idsubunidad,
            updatedAt: date,
            createdAt: date,
          },
        });
        if (!newForm) {
          res.status(400).json({ error: "Error al crear formulario." });
          return;
        }
        const idPdoc = Number(newForm.idPdoc);
        // crear las preguntas para ese formulario que biene de questions son de varios tipos dependiendo del tipo se guarda en una base de datps diferente
        for (const pregunta of preguntas) {
            const { type, text, options } = pregunta;
            // Identificar el tipo de pregunta y guardarla en la tabla correspondiente
            if (type === Type.TEXT) {
                // Insertar pregunta de texto
                await prisma.campos.create({
                    data: {
                        idPdoc: idPdoc,
                        nmCampo: text,
                        type: type,
                    },
                });
            } else if (type === Type.MULTIPLECHOICE) {
                // Insertar pregunta de opción múltiple
                const newQuestion = await prisma.campos.create({
                    data: {
                        idPdoc: idPdoc,
                        nmCampo: text,
                        type: type,
                    },
                });

                // Insertar las opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opc.createMany({
                        data: options.map((opcion: string) => ({
                            idp: newQuestion.idPdoc,
                            txtOpc: opcion,
                        })),
                    });
                }
            }else if (type === Type.SINGLECHOICE) {
                // Insertar pregunta de opción single -> simple
                const newQuestion = await prisma.campos.create({
                    data: {
                        idPdoc: idPdoc,
                        nmCampo: text,
                        type: type,
                    },
                });

                // Insertar las opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opc.createMany({
                        data: options.map((opcion: string) => ({
                            idp: newQuestion.idPdoc,
                            txtOpc: opcion,
                        })),
                    });
                }
            }else if (type === Type.DROPDOWN) {
                // Insertar pregunta de opción dropdown -> desplegable
                const newQuestion = await prisma.campos.create({
                    data: {
                        idPdoc: idPdoc,
                        nmCampo: text,
                        type: type,
                    },
                });

                // Insertar las opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opc.createMany({
                        data: options.map((opcion: string) => ({
                            idp: newQuestion.idPdoc,
                            txtOpc: opcion,
                        })),
                    });
                }
            }else if (type === Type.DATE) {
                // Insertar pregunta de tipo date
                await prisma.campos.create({
                    data: {
                        idPdoc: idPdoc,
                        nmCampo: text,
                        type: type,
                    },
                });

            }else if (type === Type.FILE) {
                // Insertar pregunta de tipo archive
                await prisma.campos.create({
                    data: {
                        idPdoc: idPdoc,
                        nmCampo: text,
                        type: type,
                    },
                });
            }else if (type === Type.NUMBER) {
                // Insertar pregunta de tipo archive
                await prisma.campos.create({
                    data: {
                        idPdoc: idPdoc,
                        nmCampo: text,
                        type: type,
                    },
                });
            } else {
                // Manejo para otros tipos de preguntas si es necesario
                res.status(400).json({ message: `Tipo de pregunta no soportado: ${type}` });
                return;
            }
        }
        res.status(201).json(newForm);
        //return;
      } catch (error) {
        console.error("Error creando formulario:", error);
        res.status(500).json({ error: "Error interno del servidor." });
        return;
      }
};

export const copyForm = async (req: Request, res: Response): Promise<void> => {
    const originalIdPlantillaDoc = Number(req.params.id);
    const { newName } = req.body; // Nombre nuevo opcional
    const date = HoraLima();
    
    try {
        // 1. Obtener el formulario original con sus preguntas y opciones
        const originalPD = await prisma.plantillaDoc.findUnique({
            where: { idPdoc: originalIdPlantillaDoc },
            include: {
                campos: {
                    include: {
                        opcs: true
                    }
                }
            }
        });

        if (!originalPD) {
            res.status(404).json({ error: "Formulario original no encontrado" });
            return;
        }
        // 2. Crear el nuevo formulario
        const copiedPD = await prisma.plantillaDoc.create({
            data: {
                idsubuni: originalPD.idsubuni,
                nombre: newName || `Copia de ${originalPD.nombre}`,
                abre: (newName?.substring(0, 3) || originalPD.nombre.substring(0, 3) + date.getFullYear() + '-' + originalPD.idsubuni),
                updatedAt: date,
                createdAt: date,
            },
        });

        // 3. Copiar todas las preguntas y opciones
        for (const originalQuestion of originalPD.campos) {
            // Crear nueva pregunta
            const newQuestion = await prisma.campos.create({
                data: {
                    idPdoc: copiedPD.idPdoc,
                    nmCampo: originalQuestion.nmCampo,
                    type: originalQuestion.type,
                }
            });

            // Copiar opciones si las tiene
            if (originalQuestion.opcs.length > 0) {
                await prisma.opc.createMany({
                    data: originalQuestion.opcs.map(opcion => ({
                        idCam: newQuestion.idPdoc,
                        txtOpc: opcion.txtOpc
                    }))
                });
            }
        }

        res.status(201).json(copiedPD);

    } catch (error) {
        console.error("Error copiando formulario:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

export const getAllForms = async (req: Request, res: Response): Promise<void> => {
    try{
            // Consultamos todas los formularios en la base de datos
            const forms = await prisma.plantillaDoc.findMany();

            // Si no hay subunidades, devolvemos un mensaje
            if (!forms || forms.length === 0) {
                res.status(404).json({
                    message: 'No se encontraron formularios',
                });
                return;
            }
    
            // Enviamos las subunidades encontradas
            res.status(200).json(forms);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                message: 'Hubo un error al obtener las subunidades',
                error: error.message,
            });
            return;
        }

}

export const getAllFormsBySubUnidad = async (req: Request, res: Response): Promise<void> => {
    
    try{
        console.log("paso aqui");
        // Consultamos todas las subunidades en la base de datos
        const forms = await prisma.plantillaDoc.findMany(
            {
                where: {
                    idsubuni: Number(req.usuario?.idsubunidad),
                },
                select: {
                    idPdoc: true,
                    nombre: true,
                    abre: true,
                    estado: true,
                    createdAt: true,
                    updatedAt: true,
                    idsubuni: false,
                },
                orderBy: {idPdoc: 'desc'},
            }
        );
            // Enviamos las subunidades encontradas
            console.log(forms, "forms", req.usuario, "usuario");
            res.status(200).json({forms: forms});
            return;
        } catch (error: any) {
            console.error(error);
            res.status(500).json({
                message: 'Hubo un error al obtener las subunidades',
                error: error.message,
            });
            return;
        }

}

export const deleteForm = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const idPdoc = Number(id);

    try {
        if (!idPdoc) {
            res.status(400).json({ message: 'ID requerido' }); // Agregar return
            return;
        }

        // Verificar existencia
        const existingForm = await prisma.plantillaDoc.findUnique({
            where: { idPdoc: idPdoc },
            include: { campos: true } // Incluir relaciones
        }); 

        if (!existingForm) {
            res.status(404).json({ message: 'Formulario no encontrado' }); // Agregar return
            return;
        }
        
        // Eliminar en cascada
        /*await prisma.$transaction([
            prisma.res.deleteMany({ where: { idf } }),
            prisma.prg.deleteMany({ where: { idf } }),
            prisma.form.delete({ where: { idf } })
        ]);*/   

        res.status(200).json({ message: 'Formulario eliminado correctamente' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Error al eliminar formulario',
            error: error.message
        });
    }
};

export const updateForm = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Asumimos que el ID viene en los parámetros de la ruta
    const { name , abrev} = req.body; //

    try {
        // Validar que se proporciona el ID
        if (!id) {
            res.status(400).json({ message: 'El ID del formulario es obligatorio' });
        }

        // Validar que se proporciona al menos un campo para actualizar
        if (!name && !abrev) {
            res.status(400).json({ message: 'Debe proporcionar al menos un campo para actualizar' });
        }

        // Convertir el ID a número (si es necesario)
        const idPdoc = Number(id);

        // Verificar que el registro existe
        const existingForm = await prisma.plantillaDoc.findUnique({
            where: { idPdoc: idPdoc },
        });

        if (!existingForm) {
            res.status(404).json({ message: 'Formulario no encontrado' });
        }
        const date = HoraLima();
        // Actualizar la subunidad
        const updatedSubUnidad = await prisma.plantillaDoc.update({
            where: { idPdoc: idPdoc },
            data: {
                nombre: name,
                abre: abrev,
                updatedAt: date,
            },
        });

        // Enviar respuesta exitosa
        res.status(200).json({ subUnidad: updatedSubUnidad });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Hubo un error al actualizar la subunidad',
            error: error.message,
        });
    }

}

export const updateEstado = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // ID del formulario desde la URL
    const { estado } = req.body; // 👈 Recibimos el estado desde el cuerpo de la solicitud

    try {
        //if (id) throw new Error('Error de prueba');
        const idPdoc = Number(id);
        
        // Validar si el estado es un booleano
        if (typeof estado !== "boolean") {
            res.status(400).json({ message: "El campo 'estado' debe ser true o false" });
            return;
        }
        //throw new Error('Error de prueba');
        // Si el nuevo estado es "true", desactivar otros formularios activos
        if (estado === true) {
            const formOld = await prisma.plantillaDoc.findFirst({
                where: { estado: true, idsubuni: Number(req.usuario?.idsubunidad) },
            });

            if (formOld) {
                await prisma.plantillaDoc.update({
                    where: { idPdoc: formOld?.idPdoc },
                    data: { estado: false },
                });
            }
        }

        // Actualizar el estado del formulario especificado
        await prisma.plantillaDoc.update({
            where: { idPdoc: idPdoc },
            data: { estado: estado }, // 👈 Usamos el valor recibido
        });

        res.status(200).json({ message: 'Estado actualizado correctamente' });

    } catch (error: any) {
        //console.error(error);
        res.status(500).json({
            message: 'Error al actualizar el formulario',
            error: error.message,
        });
        return;
    }
};

export const getQuestionsByForm = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const form = await prisma.plantillaDoc.findUnique({
            where: { idPdoc: Number(id) },
        });
        if (!form) {
            res.status(404).json({ message: 'Formulario no encontrado' });
            return;
        }
        const questions = await prisma.campos.findMany({
            where: { idPdoc: form.idPdoc },
            select: {
                idPdoc:false,
                idca:true,
                nmCampo: true,
                type:true,
                required: false,
                PlantillaDoc:false,
                opcs: {
                    select: {
                        idOpc: true,
                        txtOpc: true,
                        
                    }
                },
                createdAt: false,
                updatedAt: false,
            },
            orderBy: {
                idca: 'asc' // Ordenar por ID de pregunta
            }
        });
        console.log(questions);
        // Transformar las preguntas en un formato unificado
        const formattedQuestions = questions.map((question) => {
            const { idca, type, nmCampo, opcs } = question;
            
            // Crear el objeto de opciones según el tipo de pregunta
            const options = {
                opciones: opcs.map(opc => ({
                    id: opc.idOpc,
                    text: opc.txtOpc
                }))
            };

            return {
                id: idca,
                type: type as Type, // Usar el enum Type
                questionText: nmCampo,
                options: options
            };
        });

        res.status(200).json({preguntas:questions, name: form.nombre});
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ 
            message: "Error al obtener las preguntas", 
            error: error.message 
        });
    }
};


export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { preguntas, name } = req.body;
    //console.log("id, ", req.body);
    //console.log("preguntas, ", req.body.preguntas);

    try {
        const form = await prisma.plantillaDoc.findUnique({
            where: { idPdoc: Number(id)}
        });
        if(!form){
            res.status(400).json({ message: 'formulario no encontrado' });
            return;
        }
        if(form.nombre !== name){
            await prisma.plantillaDoc.update({
                where: {idPdoc: Number(id)},
                data:{
                    nombre: name,
                }
            })
        }
        const existingQuestions = await prisma.campos.findMany({
            where:{idPdoc: Number(id)}
        })
        if(!existingQuestions){
            res.status(400).json({ message: 'No hay preguntas' });
            return;
        }

         // Procesar cada pregunta del request
         for (const pregunta of preguntas) {
            // Validar tipo de pregunta
            if (!Object.values(Type).includes(pregunta.type)) {
                res.status(400).json({ message: `Tipo de pregunta inválido: ${pregunta.type}` });
                return;
            }

            // Determinar si es pregunta nueva o existente
            const isNewQuestion = !pregunta.idp || typeof pregunta.idp === 'string';

            if (isNewQuestion) {
                // Crear nueva pregunta
                await prisma.campos.create({
                    data: {
                        idPdoc: Number(id),
                        nmCampo: pregunta.nmPrg,
                        type: pregunta.type,
                        opcs: {
                            create: pregunta.opcs.map((opc: any) => ({

                                txtOpc: opc.txtOpc
                            }))
                        }
                    }
                });
            } else {
                // Actualizar pregunta existente
                await prisma.campos.update({
                    where: { idca: Number(pregunta.idp) },
                    data: {
                        nmCampo: pregunta.nmPrg,
                        type: pregunta.type,
                        // Actualizar opciones existentes o crear nuevas
                        opcs: {
                            deleteMany: {}, // Eliminar todas las opciones existentes
                            create: pregunta.opcs.map((opc: any) => ({
                                txtOpc: opc.txtOpc
                            }))
                        }
                    }
                });
            }
        }

        // Eliminar preguntas que ya no están en el request
        const questionIdsInRequest = preguntas
            .filter((p: any) => typeof p.idp === 'number')
            .map((p: any) => Number(p.idp));

        const questionsToDelete = existingQuestions
            .filter(q => !questionIdsInRequest.includes(q.idca));

        for (const question of questionsToDelete) {
            await prisma.campos.delete({
                where: { idca: question.idca }
            });
        }

        console.log(existingQuestions, "preguntas");
        res.status(200).json({ message: 'Pregunta actualizada correctamente' });
        
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ 
            message: "Error al actualizar la pregunta", 
            error: error.message 
        });
    }
};