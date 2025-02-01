import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import { connect } from "http2";

const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  export const upload = multer({ storage });

function getDateDifference(date1: Date, date2: Date): { days: number, hours: number, minutes: number, seconds: number } {
    const diffInMs = date2.getTime() - date1.getTime();

    const seconds = Math.floor(diffInMs / 1000) % 60;
    const minutes = Math.floor(diffInMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffInMs / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
}

function addToDate(date: Date, value: number, unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'months' | 'years'): Date {
    const newDate = new Date(date); // Evitar modificar la fecha original
    switch (unit) {
        case 'seconds':
            newDate.setSeconds(newDate.getSeconds() + value);
            break;
        case 'minutes':
            newDate.setMinutes(newDate.getMinutes() + value);
            break;
        case 'hours':
            newDate.setHours(newDate.getHours() + value);
            break;
        case 'days':
            newDate.setDate(newDate.getDate() + value);
            break;
        case 'months':
            newDate.setMonth(newDate.getMonth() + value);
            break;
        case 'years':
            newDate.setFullYear(newDate.getFullYear() + value);
            break;
        default:
            throw new Error("Invalid unit. Use 'seconds', 'minutes', 'hours', 'days', 'months', or 'years'.");
    }
    return newDate;
}

function isValidDate(date: unknown): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
}

export const probar = async (req: Request, res: Response): Promise<void> => {
    const { name, fInit, fFin, idproj, idres } = req.body;
    if (!name || !fInit || !fFin || !idproj || !idres ) {
        res.status(400).json({ error: 'Todos los campos son requeridos.' });
        return;
    }
    if(isValidDate(fInit) && isValidDate(fFin)) {
        res.status(400).json({ error: 'Las fechas no son validas' });
        return;
    }
    
      try {
        
        const date = new Date();
        date.setHours(date.getHours() - 5);

        const project = await prisma.project.findFirst({
            where:{
                idproj:idproj
            }
        })

        const dateIP = project?.fInit;
        if (!dateIP) {
            res.status(400).json({ error: 'La fecha del proyecto indefinido' });
            return;
        }
        
        const dateIA = new Date(fInit);
        console.log(dateIP, "Parsed date1");
        console.log(dateIA, "Parsed date2");
        //const diffInMs = date1.getTime() - date2.getTime();
        const diffInMsI = dateIA.getTime() - dateIP.getTime();
        const diffInDaysI = diffInMsI / (1000 * 60 * 60 * 24); // Convertir ms a días
        console.log(diffInDaysI, "Difference in days");
        if (diffInDaysI<0)
        {
            console.log("Se actualiza la fecha de inicio");
        }

        const dateFP = project?.fFin;
        if (!dateFP) {
            res.status(400).json({ error: 'La fecha del proyecto indefinido' });
            return;
        }
        const dateFA = new Date(fFin);
        console.log(dateFP, "Parsed date1");
        console.log(dateFA, "Parsed date2");
        //const diffInMs = date1.getTime() - date2.getTime();
        const diffInMsF = dateFA.getTime() - dateFP.getTime();
        const diffInDaysF = diffInMsF / (1000 * 60 * 60 * 24); // Convertir ms a días
        console.log(diffInDaysF, "Difference in days");
        if (diffInDaysF>0)
        {
            console.log("Se actualiza la fecha de final");
        }


        /*const newActivity = await prisma.actividad.create({
          data: {
            name,
            fInit,
            fFin,
            estado: "Pendiente",
            idproj,
            idres
          },
        });*/
        res.status(201).json( {message : "Todo correctamente"});
      } catch (error) {
        console.error("Error creando formulario:", error);
        res.status(500).json({ error: "Error interno del servidor." });
      } 
};

export const createAnswersAndInsertActivity = async (req: Request, res: Response) => {
    const { responses, idproj, fInit, fFin, name } = req.body;
    
    if (!responses || !idproj || !fFin || !fInit || !name) {
        return res.status(400).json({ error: 'El ID del formulario, las respuestas y los metadatos son requeridos.' });
    }

    try {
        const existeProject = await prisma.project.findUnique({
            where: { idproj:Number(idproj), },
        });
        if (!existeProject) {
            res.status(404).json({ error: 'El proyecto especificado no existe.' });
            return;
        }

        const form = await prisma.form.findFirst({
            where: {
                estado: true,
                idsubuni: Number(existeProject.subunidad_id_subuni),
            }
        });
        if (!form) {
            return res.status(400).json({ error: 'No hay ningún formulario activo.' });
        }
        const idf = form?.idf;

        const resp = await prisma.res.create({
            data: {
                idf: Number(idf),
                date: new Date()
            }
        });

        // Iterar sobre las respuestas y guardarlas
        await Promise.all(
            Object.entries(responses).map(async ([questionId, answer]) => {
                const questionIdInt = parseInt(questionId); // Convertir la clave a un entero
                const answerString = Array.isArray(answer) ? JSON.stringify(answer) : String(answer); // Manejar arrays
                
                // Obtener tipo de pregunta desde la base de datos
                const question = await prisma.prg.findUnique({
                    where: { idp: questionIdInt },
                });

                if (!question) {
                    console.error(`Pregunta con ID ${questionIdInt} no encontrada.`);
                    return;
                }

                if (question.type === 'text') {
                    // Guardar respuesta de tipo texto
                    await prisma.resTxt.create({
                        data: {
                            idres: resp.idres,
                            idp: question.idp,
                            resTxt: answerString
                        }
                    });
                } else if (question.type === 'multipleChoice') {
                    // Guardar respuesta de tipo opción múltiple
                    if (Array.isArray(answer)) {
                        await Promise.all(
                            answer.map(async (optionId: number) => {
                                await prisma.resOM.create({
                                    data: {
                                        idres: Number(resp.idres),
                                        idp: Number(question.idp),
                                        idomul: Number(optionId)
                                    }
                                });
                            })
                        );
                    }
                } else if (question.type === 'singleChoice') {
                    // Guardar respuesta de tipo opción única
                    if (Array.isArray(answer)) {
                        await Promise.all(
                            answer.map(async (optionId: number) => {
                                await prisma.resOU.create({
                                    data: {
                                        idres: resp.idres,
                                        idp: question.idp,
                                        idou: optionId
                                    }
                                });
                            })
                        );
                    }
                } else if (question.type === 'dropdown') {
                    // Guardar respuesta de tipo lista desplegable
                    if (Array.isArray(answer)) {
                        await Promise.all(
                            answer.map(async (optionId: number) => {
                                await prisma.resOD.create({
                                    data: {
                                        idres: Number(resp.idres),
                                        idp: Number(question.idp),
                                        idodes: Number(optionId)
                                    }
                                });
                            })
                        );
                    }
                } else if (question.type === 'date') {
                    // Guardar respuesta de tipo fecha
                    await prisma.resDate.create({
                        data: {
                            idres: resp.idres,
                            idp: question.idp,
                            resdate: new Date(answerString)
                        }
                    });
                } else if (question.type === 'archive') {
                    // Guardar respuesta de tipo archivo
                    await prisma.resFile.create({
                        data: {
                            idres: resp.idres,
                            idp: question.idp,
                            resFile: answerString // Guardar nombre o URL del archivo
                        }
                    });
                } else {
                    console.error(`Tipo de pregunta desconocido: ${question.type}`);
                }
            })
        );

        // Crear la actividad asociada
        const activity = await prisma.actividad.create({
            data: {
                fFin: new Date(fFin),
                fInit: new Date(fInit),
                estado: "Pendiente",
                name: name,
                idproj: idproj,
                idres: resp.idres
            }
        });

        // cambiar la fecha de inicio del proyecto respecto a las actividades insertadas
        const project = await prisma.project.findUnique({
            where:{
                idproj:Number(idproj)
            }
        })

        // Verifica si el proyecto existe
        if (!existeProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        console.log(existeProject, "Projecto encontrado");
        
        let updatedFInit = existeProject.fInit;
        if (!existeProject.fInit || new Date(fInit) < new Date(existeProject.fInit)) {
            updatedFInit = new Date(fInit);
        }

        // Comprobar y actualizar la fecha final
        let updatedFFin = existeProject.fFin;
        if (!existeProject.fFin || new Date(fFin) > new Date(existeProject.fFin)) {
            updatedFFin = new Date(fFin);
        }

        console.log(updatedFInit, "updatedFInit");
        console.log(updatedFFin, "updatedFFin");
        // Actualizar el proyecto solo si las fechas cambiaron
        if (updatedFInit !== existeProject.fInit || updatedFFin !== existeProject.fFin) {
            await prisma.project.update({
                where: { idproj },
                data: {
                    fInit: updatedFInit,
                    fFin: updatedFFin,
                },
            });
        }

        res.status(201).json({ 
            message: 'Respuestas guardadas exitosamente.', 
            //data: savedResponses, 
            idres: resp.idres, 
            idActivity: activity.idActivi 
        });
        return;
    } catch (error) {
        console.error('Error al guardar las respuestas:', error);
        res.status(500).json({ error: 'Ocurrió un error al guardar las respuestas.' });
    }
};

export const createAnswersAndInsertActivityNewFormData = async (req: Request, res: Response) => {
  const { idproj, name } = req.body; // Parse text fields
  const fInit = new Date(req.body.fInit); // Parse date fields
  const fFin = new Date(req.body.fFin); // Parse date fields
  const responses = JSON.parse(req.body.responses || "{}"); // Parse JSON responses
  const { id } = req.params;
  const idsubunidad = Number(id);
  

  if (!idproj || !responses || !fFin || !fInit || !name || !idsubunidad) {
    return res.status(400).json({ error: "El ID del proyecto, el id Sub unidad y las respuestas son requeridos." });
  }

  try {
    console.log(responses, "responses");
    
    console.log("Archivos recibidos:", req.files);
    console.log("Body recibido:", req.body);
    // Get the active form
    const form = await prisma.form.findFirst({
      where: {
        estado: true,
        idsubuni: Number(idsubunidad),
      },
    });

    if (!form) {
      res.status(400).json({ error: "No hay ningún formulario activo." });
      return;
    }

    const idf = form.idf;

    // Create a response record
    const resp = await prisma.res.create({
      data: {
        idf: Number(idf),
        date: new Date(),
      },
    });
    console.log(resp, "resp");

    // Process responses
    for (const [key, value] of Object.entries(responses)) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        continue; // Skip empty responses
      }
      const question = await prisma.prg.findUnique({
        where: { idp: parseInt(key) },
      });
      console.log("questions", question);
      console.log("clave", key, " value ", value);
      if (!question) {
        console.error(`Pregunta con ID ${key} no encontrada.`);
        continue;
      }

      //if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })[key]) {
      if(value === "file"){
        // Buscar el archivo que tiene un fieldname que coincide con el key
    const file = (req.files as Express.Multer.File[]).find(
        (f) => f.fieldname === key
      );
  
      if (!file) {
        console.error(`Archivo con fieldname ${key} no encontrado.`);
        continue;
      }
      //const file = (req.files as Record<string, Express.Multer.File[]>)[key][0];
        console.log(file.path, "file");
        await prisma.resFile.create({
          data: {
            idres: resp.idres,
            idp: parseInt(key),
            resFile: file.path,
          },
        });
      } else {
        const answer = Array.isArray(value) ? value : [value];

        switch (question.type) {
          case "text":
            await prisma.resTxt.create({
              data: {
                idres: resp.idres,
                idp: parseInt(key),
                resTxt: String(value),
              },
            });
            break;
          case "multipleChoice":
            await Promise.all(
              answer.map(async (optionId) => {
                await prisma.resOM.create({
                  data: {
                    idres: resp.idres,
                    idp: parseInt(key),
                    idomul: parseInt(optionId as string),
                  },
                });
              })
            );
            break;
          case "singleChoice":
              console.log(answer, "answer");
            await Promise.all(
              answer.map(async (optionId) => {
                console.log(optionId as string, "optionId");
                await prisma.resOU.create({
                  data: {
                    idres: Number(resp.idres),
                    idp: Number(key),
                    idou: Number(optionId as string),
                  },
                });
              })
            );
            break;
          case "dropdown":
            await Promise.all(
              answer.map(async (optionId) => {
                await prisma.resOD.create({
                  data: {
                    idres: resp.idres,
                    idp: parseInt(key),
                    idodes: parseInt(optionId as string),
                  },
                });
              })
            );
            break;
          case "date":
            const fecha = new Date(String(value));
            console.log("fecha", question.type , "  " , fecha);
            await prisma.resDate.create({
              data: {
                idres: resp.idres,
                idp: parseInt(key),
                resdate: fecha,
              },
            });
            break;
          default:
            console.warn(`Tipo de pregunta desconocido para la pregunta ${key}.`);
        }
      }
    }

    // Update project dates
    const project = await prisma.project.findUnique({
      where: { idproj: Number(idproj) },
    });
    
    if (!project) {
      res.status(404).json({ error: "Proyecto no encontrado." });
      return;
    }
    // Create associated activity
    const activity = await prisma.actividad.create({
      data: {
        fFin: new Date(fFin),
        fInit: new Date(fInit),
        estado: "Pendiente",
        name: name,
        idproj: project.idproj,
        idres: resp.idres,
      },
    });



    // Verifica si el proyecto existe
    if (!project) {
        return res.status(404).json({ message: "Project not found" });
    }

    console.log(project, "Projecto encontrado");
    
    let updatedFInit = project.fInit;
    if (!project.fInit || new Date(fInit) < new Date(project.fInit)) {
        updatedFInit = new Date(fInit);
    }

    // Comprobar y actualizar la fecha final
    let updatedFFin = project.fFin;
    if (!project.fFin || new Date(fFin) > new Date(project.fFin)) {
        updatedFFin = new Date(fFin);
    }

    console.log(updatedFInit, "updatedFInit");
    console.log(updatedFFin, "updatedFFin");
    // Actualizar el proyecto solo si las fechas cambiaron
    if (updatedFInit !== project.fInit || updatedFFin !== project.fFin) {
        await prisma.project.update({
            where: {idproj: Number(idproj) },
            data: {
                fInit: updatedFInit,
                fFin: updatedFFin,
            },
        });
    }

    res.status(201).json({
      message: "Datos y archivos procesados correctamente.",
      idres: resp.idres,
      idActivity: activity.idActivi,
    });
  } catch (error) {
    console.error("Error al procesar los datos:", error);
    res.status(500).json({ error: "Error interno al procesar los datos." });
    return;
  }
};


export const updateAnswersAndActivityData = async (req: Request, res: Response) => {
    const { idproj, name, idsubunidad } = req.body; // Campos de texto
    const fInit = new Date(req.body.fInit); // Parse date fields
    const fFin = new Date(req.body.fFin); // Parse date fields
    const responses = JSON.parse(req.body.responses || "{}"); // Respuestas en formato JSON
    const { id } = req.params; // ID de la subunidad o actividad
    const idActivity = Number(id);

    
    console.log(req.body, "responses");
    console.log(fInit, "finit");
    
    
    
    if (!idproj || !responses || !fFin || !fInit || !name || !idActivity) {
        res.status(400).json({ error: "Los datos del proyecto, respuestas, fechas y la actividad son requeridos." });
        return;
    }
    
    // cambios put de actividad
    try {
      console.log("Datos recibidos para actualizar:", responses);
  
      // Verificar si la actividad existe
      const activity = await prisma.actividad.findUnique({
        where: { idActivi: idActivity },
      });
  
      if (!activity) {
        res.status(404).json({ error: "Actividad no encontrada." });
        return;
    }
    const newActivity = await prisma.actividad.update({
        where: { idActivi: idActivity },
        data: {
          fInit: new Date(fInit),
          fFin: new Date(fFin),
          name: name,
        },
    });
    if (!newActivity) {
        res.status(404).json({ error: "Actividad no actualizada." });
        return;
    }
    const respuesta = await prisma.res.findUnique({
        where: { idres: activity.idres },
    });
    console.log(activity.idres, "respuesta");
    if (!respuesta) {
        res.status(404).json({ error: "Respuestas no encontradas." });
        return;
    }
      
      // Actualizar las respuestas existentes
      for (const [key, value] of Object.entries(responses)) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          continue; // Skip empty responses
        }
        const question = await prisma.prg.findUnique({
          where: { idp: parseInt(key) },
        });
  
        if (!question) {
          console.error(`Pregunta con ID ${key} no encontrada.`);
          continue;
        }
  
        // Procesar archivos si son parte de las respuestas
        if (value === "file") {
          const file = (req.files as Express.Multer.File[]).find((f) => f.fieldname === key);
          if (!file) {
            console.error(`Archivo con fieldname ${key} no encontrado.`);
            continue;
          }
          const resfile = await prisma.resFile.findFirst({ where: { idres: activity.idres, idp: parseInt(key) } });
            if (!resfile) {
                console.log("Respuesta no valida");
                continue;
            }
          await prisma.resFile.upsert({
            where: { 
                idresfile: resfile.idresfile
            },
            update: { resFile: file.path },
            create: {
              idres: activity.idres,
              idp: parseInt(key),
              resFile: file.path,
            },
          });
        } else {
          const answer = Array.isArray(value) ? value : [value];
  
          switch (question.type) {
            case "text":
                const restext = await prisma.resTxt.findFirst({ where: { idres: activity.idres, idp: parseInt(key) } });
                if (!restext) {
                    console.log("Respuesta no valida");
                    continue;
                }
              await prisma.resTxt.update({
                where: { idrestxt: restext.idrestxt },
                data: { resTxt: String(value) },
              });
              break;
  
            case "multipleChoice":
              await prisma.resOM.deleteMany({ where: { idres: activity.idres, idp: parseInt(key) } });
              await Promise.all(
                answer.map(async (optionId) => {
                  await prisma.resOM.create({
                    data: {
                      idres: activity.idres,
                      idp: parseInt(key),
                      idomul: parseInt(optionId as string),
                    },
                  });
                })
              );
              break;
  
            case "singleChoice":
                const resou = await prisma.resOU.findFirst({ where: { idres: activity.idres, idp: parseInt(key) } });
                if (!resou) {
                    console.log("Respuesta no valida");
                    continue;
                }
                console.log(answer, "answer");
                console.log(parseInt(answer[0] as string), "answer 2");
              await prisma.resOU.update({
                where: { idresou: resou.idresou },
                data: { idou: Number(answer[0] as string) },
              });
              break;
  
            case "dropdown":
              await prisma.resOD.upsert({
                where: { idresod: activity.idres },
                update: { idodes: parseInt(answer[0] as string) },
                create: {
                  idres: activity.idres,
                  idp: parseInt(key),
                  idodes: parseInt(answer[0] as string),
                },
              });
              break;
  
            case "date":
                const fecha = new Date(String(value));
                console.log("fecha", value , " --------------------------- " , fecha);
                if (fecha  ) {
                    const resdate = await prisma.resDate.findFirst({ where: { idres: activity.idres, idp: parseInt(key) } });
                if (!resdate) {
                    console.log("Respuesta no valida");
                    continue;
                }
              await prisma.resDate.update({
                where: { idresdate: resdate.idresdate },
                data:{
                  resdate: fecha,
                },
              });
                console.log("Fecha no valida");
                continue;
              }
              break;
  
            default:
              console.warn(`Tipo de pregunta desconocido para la pregunta ${key}.`);
          }
        }
      }
  
      // Actualizar las fechas de la actividad
      await prisma.actividad.update({
        where: { idActivi: idActivity },
        data: {
          fInit: new Date(fInit),
          fFin: new Date(fFin),
          name: name,
        },
      });
  
      // Actualizar las fechas del proyecto si es necesario
      const project = await prisma.project.findUnique({
        where: { idproj: Number(idproj) },
      });
  
      if (project) {
        let updatedFInit = project.fInit;
        if (!project.fInit || new Date(fInit) < new Date(project.fInit)) {
          updatedFInit = new Date(fInit);
        }
  
        let updatedFFin = project.fFin;
        if (!project.fFin || new Date(fFin) > new Date(project.fFin)) {
          updatedFFin = new Date(fFin);
        }
  
        if (updatedFInit !== project.fInit || updatedFFin !== project.fFin) {
          await prisma.project.update({
            where: { idproj: Number(idproj) },
            data: {
              fInit: updatedFInit,
              fFin: updatedFFin,
            },
          });
        }
      }
  
      res.status(200).json({ message: "Actividad y respuestas actualizadas correctamente." });
      return;
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      res.status(500).json({ error: "Error interno al actualizar los datos." });
      return;
    }
  };

  
export const updateAnswersAndActivity = async (req: Request, res: Response) => {
    const { responses, idproj, fInit, fFin, name, idActivity } = req.body;
    console.log(req.body, "req.body");
    if (!responses || !idproj || !idActivity) {
        return res.status(400).json({ error: 'Las respuestas, ID del proyecto y ID de la actividad son requeridos.' });
    }

    try {
        // Buscar la actividad existente
        const activity = await prisma.actividad.findUnique({
            where: { idActivi: idActivity },
        });

        if (!activity) {
            return res.status(404).json({ error: 'La actividad especificada no existe.' });
        }

        // Actualizar las respuestas asociadas
        const resp = await prisma.res.findUnique({
            where: { idres: activity.idres },
        });

        if (!resp) {
            return res.status(404).json({ error: 'Las respuestas asociadas no fueron encontradas.' });
        }

        await Promise.all(
            Object.entries(responses).map(async ([questionId, answer]) => {
                const questionIdInt = parseInt(questionId); // Convertir la clave a un entero
                const answerString = Array.isArray(answer) ? JSON.stringify(answer) : String(answer);

                // Obtener tipo de pregunta desde la base de datos
                const question = await prisma.prg.findUnique({
                    where: { idp: questionIdInt },
                });

                if (!question) {
                    console.error(`Pregunta con ID ${questionIdInt} no encontrada.`);
                    return;
                }

                // Actualizar respuestas según el tipo de pregunta
                if (question.type === 'text') {
                    await prisma.resTxt.updateMany({
                        where: {
                            idres: resp.idres,
                            idp: question.idp,
                        },
                        data: { resTxt: answerString },
                    });
                } else if (question.type === 'multipleChoice') {
                    if (Array.isArray(answer)) {
                        // Eliminar respuestas antiguas y agregar nuevas
                        await prisma.resOM.deleteMany({
                            where: {
                                idres: resp.idres,
                                idp: question.idp,
                            },
                        });
                        await Promise.all(
                            answer.map(async (optionId: number) => {
                                await prisma.resOM.create({
                                    data: {
                                        idres: resp.idres,
                                        idp: question.idp,
                                        idomul: optionId,
                                    },
                                });
                            })
                        );
                    }
                } else if (question.type === 'singleChoice') {
                    await prisma.resOU.updateMany({
                        where: {
                            idres: resp.idres,
                            idp: question.idp,
                        },
                        data: { idou: Number(answerString) },
                    });
                } else if (question.type === 'dropdown') {
                    await prisma.resOD.updateMany({
                        where: {
                            idres: resp.idres,
                            idp: question.idp,
                        },
                        data: { idodes: Number(answerString) },
                    });
                } else if (question.type === 'date') {
                    await prisma.resDate.updateMany({
                        where: {
                            idres: resp.idres,
                            idp: question.idp,
                        },
                        data: { resdate: new Date(answerString) },
                    });
                } else if (question.type === 'archive') {
                    await prisma.resFile.updateMany({
                        where: {
                            idres: resp.idres,
                            idp: question.idp,
                        },
                        data: { resFile: answerString },
                    });
                } else {
                    console.error(`Tipo de pregunta desconocido: ${question.type}`);
                }
            })
        );

        // Actualizar la actividad asociada
        await prisma.actividad.update({
            where: { idActivi: idActivity },
            data: {
                fFin: new Date(fFin),
                fInit: new Date(fInit),
                estado: "Actualizado",
                name: name,
                idproj: idproj,
            },
        });

        // Actualizar las fechas del proyecto si cambiaron
        const project = await prisma.project.findUnique({
            where: { idproj },
        });

        if (!project) {
            return res.status(404).json({ message: "Proyecto no encontrado." });
        }

        let updatedFInit = project.fInit;
        if (!project.fInit || new Date(fInit) < new Date(project.fInit)) {
            updatedFInit = new Date(fInit);
        }

        let updatedFFin = project.fFin;
        if (!project.fFin || new Date(fFin) > new Date(project.fFin)) {
            updatedFFin = new Date(fFin);
        }

        if (updatedFInit !== project.fInit || updatedFFin !== project.fFin) {
            await prisma.project.update({
                where: { idproj },
                data: {
                    fInit: updatedFInit,
                    fFin: updatedFFin,
                },
            });
        }

        res.status(200).json({ message: 'Respuestas y actividad actualizadas correctamente.' });
    } catch (error) {
        console.error('Error al actualizar las respuestas:', error);
        res.status(500).json({ error: 'Ocurrió un error al actualizar las respuestas.' });
    }
};



export const deleteActivityAndResponses = async (req: Request, res: Response) => {
    const { id } = req.params;

    console.log(id, "id");
    if (!id) {
        return res.status(400).json({ error: 'El ID de la actividad es requerido.' });
    }

    try {
        // Buscar la actividad por ID
        const activity = await prisma.actividad.findUnique({
            where: { idActivi: Number(id) },
        });

        if (!activity) {
            return res.status(404).json({ error: 'La actividad especificada no existe.' });
        }

        // Obtener el ID de las respuestas asociadas
        const idres = activity.idres;

        // Intentar eliminar respuestas en cada tabla
        const deleteTables = [
            prisma.resTxt.deleteMany({ where: { idres } }),
            prisma.resOM.deleteMany({ where: { idres } }),
            prisma.resOU.deleteMany({ where: { idres } }),
            prisma.resOD.deleteMany({ where: { idres } }),
            prisma.resDate.deleteMany({ where: { idres } }),
            prisma.resFile.deleteMany({ where: { idres } }),
        ];

        for (const deleteOperation of deleteTables) {
            try {
                await deleteOperation;
            } catch (error) {
                console.warn('Error al eliminar registros en una tabla específica:', error);
                // Continuar con la siguiente operación
            }
        }

        // Eliminar la respuesta principal
        try {
            await prisma.res.delete({ where: { idres } });
        } catch (error) {
            console.warn('Error al eliminar la respuesta principal:', error);
        }

        // Eliminar la actividad
        await prisma.actividad.delete({ where: { idActivi: Number(id) } });

        // Actualizar las fechas del proyecto
        const project = await prisma.project.findUnique({
            where: { idproj: activity.idproj },
            include: { actividad: true }, // Incluye todas las actividades restantes
        });

        if (!project) {
            return res.status(404).json({ error: 'El proyecto asociado no existe.' });
        }

        // Recalcular las fechas del proyecto basadas en las actividades restantes
        const actividadesRestantes = project.actividad;

        let updatedFInit: Date | null = null;
        let updatedFFin: Date | null = null;

        if (actividadesRestantes.length > 0) {
            updatedFInit = actividadesRestantes.reduce<Date | null>((minDate, act) =>
                !minDate || new Date(act.fInit) < minDate ? new Date(act.fInit) : minDate,
                null
            );
            updatedFFin = actividadesRestantes.reduce<Date | null>((maxDate, act) =>
                !maxDate || new Date(act.fFin) > maxDate ? new Date(act.fFin) : maxDate,
                null
            );
        }

        await prisma.project.update({
            where: { idproj: activity.idproj },
            data: {
                fInit: updatedFInit ? new Date(updatedFInit) : null,
                fFin: updatedFFin ? new Date(updatedFFin) : null,
            },
        });

        const actividades = await prisma.actividad.findMany({
            where:{
                idproj: Number(project.idproj)
            }
        })

        res.status(200).json({ message: 'Actividad y respuestas eliminadas correctamente.', actividades: actividades });
    } catch (error) {
        console.error('Error al eliminar la actividad y respuestas:', error);
        res.status(500).json({ error: 'Ocurrió un error al eliminar la actividad y respuestas.' });
    }
};



export const getNumberEstatesActivities = async (req: Request, res: Response): Promise<void> => {
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
            },
        });

        if (!activities || activities.length === 0) {
            res.status(404).json({ message: "No se encontraron actividades" });
            return;
        }

        // Acumular los estados de las actividades
        const stateCounts = activities.reduce((acc: Record<string, number>, activity) => {
            const state = activity.estado || "Desconocido"; // Manejar estados nulos o no definidos
            acc[state] = (acc[state] || 0) + 1; // Incrementar el contador para el estado actual
            return acc;
        }, {});

        res.status(200).json(stateCounts);
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getDataActivities = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        if (!id) {
            res.status(400).json({ message: "El ID de la actividad es requerido" });
            return;
        }

        // Obtener los datos de la actividad
        const actividad = await prisma.actividad.findFirst({
            where: {
                idActivi: Number(id),
            },
            include: {
                res: true,
            },
        });
        console.log(actividad, "actividad");

        if (!actividad) {
            res.status(404).json({ message: "No se encontró la actividad" });
            return;
        }

        // Obtener las preguntas relacionadas al formulario de la actividad
        const preguntas = await prisma.prg.findMany({
            where: {
                idf: actividad.res.idf,
            },
            include: {
                opcdes: true, // Opciones para dropdown
                opcmul: true, // Opciones para multipleChoice
                opcuni: true, // Opciones para singleChoice
            },
        });
        console.log(preguntas, "preguntas");
        // Formatear las preguntas
        const formattedPreguntas = preguntas.map((pregunta) => {
            const formattedPregunta: any = {
                id: pregunta.idp,
                type: pregunta.type,
                questionText: pregunta.nmPrg,
            };

            // Agregar opciones para los tipos correspondientes
            if (pregunta.type === "dropdown") {
                formattedPregunta.options = pregunta.opcdes.map((opcion) => ({
                    idop: opcion.idodes,
                    optionTxt: opcion.txtOpc,
                }));
            } else if (pregunta.type === "multipleChoice") {
                formattedPregunta.options = pregunta.opcmul.map((opcion) => ({
                    idop: opcion.idomul,
                    optionTxt: opcion.txtOpc,
                }));
            } else if (pregunta.type === "singleChoice") {
                formattedPregunta.options = pregunta.opcuni.map((opcion) => ({
                    idop: opcion.idoUni,
                    optionTxt: opcion.txtOpc,
                }));
            }

            return formattedPregunta;
        });

        // Obtener las respuestas de la actividad
        const respuestas: Record<string, any[]> = {};
        for (const pregunta of preguntas) {
            switch (pregunta.type) {
                case "multipleChoice":
                    respuestas[pregunta.idp] = await prisma.resOM.findMany({
                        where: { idres: actividad.res.idres },
                        include: { opcmul: true },
                    });
                    break;
                case "singleChoice":
                    respuestas[pregunta.idp] = await prisma.resOU.findMany({
                        where: { idres: actividad.res.idres },
                        include: { opcuni: true },
                    });
                    break;
                case "dropdown":
                    respuestas[pregunta.idp] = await prisma.resOD.findMany({
                        where: { idres: actividad.res.idres },
                        include: { opcdes: true },
                    });
                    break;
                case "text":
                    respuestas[pregunta.idp] = await prisma.resTxt.findMany({
                        where: { idres: actividad.res.idres },
                    });
                    break;
                case "archive":
                    respuestas[pregunta.idp] = await prisma.resFile.findMany({
                        where: { idres: actividad.res.idres },
                    });
                    break;
                case "date":
                    respuestas[pregunta.idp] = await prisma.resDate.findMany({
                        where: { idres: actividad.res.idres },
                    });
                    break;
                default:
                    console.warn(`Tipo de pregunta no reconocido: ${pregunta.type}`);
                    respuestas[pregunta.idp] = [];
                    break;
            }
        }

        // Devolver preguntas y respuestas
        res.status(200).json({ preguntas: formattedPreguntas, respuestas, actividad });
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


export const getAllNumberAtcivity = async (req: Request, res: Response): Promise<void> => {

    try {

        // Obtener todas las actividades de los proyectos relacionados con la subunidad
        const activities = await prisma.actividad.findMany({
            select: {
                estado: true,
            },
        });

        if (!activities || activities.length === 0) {
            res.status(404).json({ message: "No se encontraron actividades" });
            return;
        }

        // Acumular los estados de las actividades
        const stateCounts = activities.reduce((acc: Record<string, number>, activity) => {
            const state = activity.estado || "Desconocido"; // Manejar estados nulos o no definidos
            acc[state] = (acc[state] || 0) + 1; // Incrementar el contador para el estado actual
            return acc;
        }, {});

        res.status(200).json(stateCounts);
    } catch (error) {
        console.error("Error al obtener actividades:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};


export const toggleAsistencia = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { participo: isParticipo, idsubunidad, idActivi } = req.body;
    console.log(isParticipo, "isParticipo");
  try {
    if (!id || !idsubunidad || !idActivi) {
      res.status(400).json({ message: "El ID de la actividad es requerido" });
      return;
    }

    const updateAlumnoActividad = await prisma.alumnoActividad.findFirst({
        where: { alumnoId: Number(id), actividadId: Number(idActivi) },
        });
    
    if (!updateAlumnoActividad) {
      res.status(404).json({ message: "No se encontró la actividad" });
      return;
    }
    await prisma.alumnoActividad.update({
        where: { id: updateAlumnoActividad.id },
        data: { asistio: isParticipo,
            estado: isParticipo ? "COMPLETADO" : "INSCRITO"
         },
        });

    
        res.status(200).json({ message: "Asistencia actualizada correctamente" });
        return;
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo actualizar la actividad" });
  }
    };

export const toggleActividadP = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { public: isPublic } = req.body;

  try {
    if (!id) {
      res.status(400).json({ message: "El ID de la actividad es requerido" });
      return;
    }
    const updatedActividad = await prisma.actividad.update({
      where: { idActivi: Number(id) },
      data: { public: isPublic },
    });
    res.status(200).json(updatedActividad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo actualizar la actividad" });
  }
}


export const AlumnosActividad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

  try {
    if (!id) {
      res.status(400).json({ message: "El ID de la actividad es requerido" });
      return;
    }
    const activdadAlumno = await prisma.alumnoActividad.findMany({
        where: {
            actividadId: Number(id),
        },
        select: {
            alumno: true,
            asistio: true,
            estado: true,
        }
        });
    if (!activdadAlumno) {
      res.status(404).json({ message: "No se encontró la actividad" });
      return;
    }
    res.status(200).json(activdadAlumno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo actualizar la actividad" });
  }
}