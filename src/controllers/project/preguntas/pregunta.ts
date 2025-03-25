import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getQuestionsByFormUni = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const questions = await prisma.prg.findMany({
            where: { idf: Number(id) },
            include: {
                opcmul: true,
                opcuni: true,
                opcdes: true,
            },
        });
        console.log(questions);
        res.status(200).json({ questions });
    } catch (error:any) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las preguntas', error: error.message });
    }
};

export const handleDynamicQuestions = async (req: Request, res: Response): Promise<void> => {
    const {idf, questions} = req.body; // El array JSON que envía el frontend
    
    try {
        // Iterar sobre cada pregunta en el JSON
        //console.log(questions, "Preguntassdada");
        const form = await prisma.form.findFirst({
        where: {
            idf: Number(idf),
        },
        });
        
        if (!form) {
            res.status(404).json({ message: 'El formulario no existe' });
            return;
        }
        for (const question of questions) {
            const { type, questionText, options } = question;
            console.log(question, "Pregunta");
            // Identificar el tipo de pregunta y guardarla en la tabla correspondiente
            if (type === 'text') {
                // Insertar pregunta de texto
                await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });
            } else if (type === 'multipleChoice') {
                // Insertar pregunta de opción múltiple
                const newQuestion = await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });

                // Insertar las opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opcMul.createMany({
                        data: options.map((option: string) => ({
                            idp: newQuestion.idp,
                            txtOpc: option,
                        })),
                    });
                }
            }else if (type === 'singleChoice') {
                // Insertar pregunta de opción single -> simple
                const newQuestion = await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });

                // Insertar las opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opcUni.createMany({
                        data: options.map((option: string) => ({
                            idp: newQuestion.idp,
                            txtOpc: option,
                        })),
                    });
                }
            }else if (type === 'dropdown') {
                // Insertar pregunta de opción dropdown -> desplegable
                const newQuestion = await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });

                // Insertar las opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opcDes.createMany({
                        data: options.map((option: string) => ({
                            idp: newQuestion.idp,
                            txtOpc: option,
                        })),
                    });
                }
            }else if (type === 'date') {
                // Insertar pregunta de tipo date
                await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });

            }else if (type === 'archive') {
                // Insertar pregunta de tipo archive
                await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });
            } else {
                // Manejo para otros tipos de preguntas si es necesario
                res.status(400).json({ message: `Tipo de pregunta no soportado: ${type}` });
                return;
            }
        }

        res.status(201).json({ message: 'Preguntas guardadas exitosamente' });
    } catch (error:any) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar las preguntas', error: error.message });
    }
};


export const EnviarDynamicQuestions = async (req: Request, res: Response): Promise<void> => {
    const { idf, questions } = req.body; // Recibimos el JSON desde el frontend

    try {
        // Validación básica de entrada
        if (!idf || !questions || !Array.isArray(questions)) {
            res.status(400).json({ message: 'El ID de formulario (idf) y las preguntas son obligatorios.' });
            return;
        }

        // Iterar sobre las preguntas del JSON
        for (const question of questions) {
            const { id, type, text: questionText, options } = question;

            // Validación de campos individuales
            if (!type || !questionText) {
                res.status(400).json({ message: `Faltan campos obligatorios en la pregunta con ID: ${id}` });
                return;
            }

            if (type === 'text') {
                // Guardar pregunta de texto
                await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });
            } else if (type === 'multipleChoice') {
                // Guardar pregunta de opción múltiple
                const newQuestion = await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });

                // Guardar opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opcMul.createMany({
                        data: options.map((option: string) => ({
                            idp: newQuestion.idp,
                            txtOpc: option,
                        })),
                    });
                }
            } else if (type === 'dropdown') {
                // Guardar pregunta de tipo desplegable
                const newQuestion = await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });

                // Guardar opciones asociadas
                if (options && options.length > 0) {
                    await prisma.opcDes.createMany({
                        data: options.map((option: string) => ({
                            idp: newQuestion.idp,
                            txtOpc: option,
                        })),
                    });
                }
            } else if (type === 'date' || type === 'archive') {
                // Guardar pregunta de tipo fecha o archivo
                await prisma.prg.create({
                    data: {
                        idf: Number(idf),
                        nmPrg: questionText,
                        type,
                    },
                });
            } else {
                // Tipo de pregunta no soportado
                res.status(400).json({ message: `Tipo de pregunta no soportado: ${type}` });
                return;
            }
        }

        // Respuesta exitosa si todas las preguntas se procesan correctamente
        res.status(201).json({ message: 'Preguntas guardadas exitosamente' });
    } catch (error: any) {
        // Manejo de errores
        console.error('Error al guardar preguntas:', error);
        res.status(500).json({ message: 'Error al procesar las preguntas', error: error.message });
    }
};

export const getQuestionsByForm = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const questions = await prisma.prg.findMany({
            where: { idf: Number(id) },
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
                    options: opcmul.map((option) => option.txtOpc),
                };
            }

            if (type === "singleChoice") {
                return {
                    id: idp,
                    type,
                    questionText: nmPrg,
                    options: opcuni.map((option) => option.txtOpc),
                };
            }

            if (type === "dropdown") {
                return {
                    id: idp,
                    type,
                    questionText: nmPrg,
                    options: opcdes.map((option) => option.txtOpc),
                };
            }

            return {
                id: idp,
                type,
                questionText: nmPrg,
            };
        });
        res.status(200).json(formattedQuestions);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener las preguntas", error: error.message });
    }
};
export const updateQuestionsByForm = async (req: Request, res: Response) => {
    const { questions } = req.body; // Recibe las preguntas del formulario
    const { id } = req.params;
    const idfor = Number(id);

    if (!idfor || !questions) {
        return res.status(400).json({ error: 'El ID del formulario y las preguntas son requeridos.' });
    }
    console.log(questions, "Pregunta s data");
    try {
        for (const question of questions) {
            const { id: questionId, type, text, options = [] } = question; // Renombrar questionText a text
            console.log(questionId, "ID", type, "Type", text, "Text", options, "Options");
            // Asegúrate de que el ID sea un número o null si no está presente
            const numericId = questionId ? Number(questionId) : undefined;

            // Actualizar o crear la pregunta
            const updatedQuestion = await prisma.prg.upsert({
                where: { idp: numericId || 0 }, // Si no hay ID, se crea una nueva pregunta
                update: {
                    type: type,
                    nmPrg: text, // Cambiar a text
                },
                create: {
                    idf: idfor,
                    type: type,
                    nmPrg: text, // Cambiar a text
                },
            });

            

            // Eliminar opciones antiguas dependiendo del tipo
            if (type === 'multipleChoice') {
                await prisma.opcMul.deleteMany({ where: { idp: updatedQuestion.idp } });
            } else if (type === 'singleChoice') {
                await prisma.opcUni.deleteMany({ where: { idp: updatedQuestion.idp } });
            } else if (type === 'dropdown') {
                await prisma.opcDes.deleteMany({ where: { idp: updatedQuestion.idp } });
            }

            // Crear nuevas opciones (si el tipo las requiere)
            if (options && Array.isArray(options) && options.length > 0) {
                const optionsData = options.map((option: string) => ({
                    idp: updatedQuestion.idp,
                    txtOpc: option,
                }));

                if (type === 'multipleChoice') {
                    await prisma.opcMul.createMany({ data: optionsData });
                } else if (type === 'singleChoice') {
                    await prisma.opcUni.createMany({ data: optionsData });
                } else if (type === 'dropdown') {
                    await prisma.opcDes.createMany({ data: optionsData });
                }
            }
        }

        res.status(200).json({ message: 'Preguntas actualizadas correctamente.' });
    } catch (error) {
        console.error('Error al manejar las preguntas dinámicas:', error);
        res.status(500).json({ error: 'Ocurrió un error al actualizar las preguntas.' });
    }
};

