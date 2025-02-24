import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { sub } from "date-fns";

const prisma = new PrismaClient();

export const createForm = async (req: Request, res: Response): Promise<void> => {
    const { name, abrev, idsubunidad } = req.body;
    if (!name || !idsubunidad) {
        res.status(400).json({ error: "El nombre del formulario es obligatorio." });
        return;
      }
        const date = new Date();
        date.setHours(date.getHours() - 5);
      try {
        const newForm = await prisma.form.create({
          data: {
            idsubuni: Number(idsubunidad),
            nmForm:name,
            abre: abrev,
            createdAt: date,
          },
        });
        res.status(201).json(newForm);
        return;
      } catch (error) {
        console.error("Error creando formulario:", error);
        res.status(500).json({ error: "Error interno del servidor." });
        return;
      } 
      finally {
        await prisma.$disconnect(); 
      }
};

export const getAllForms = async (req: Request, res: Response): Promise<void> => {
    try{
            // Consultamos todas los formularios en la base de datos
            const forms = await prisma.form.findMany();

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
        finally {
            await prisma.$disconnect();
        }

}

export const getAllFormsBySubUnidad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Asumimos que el ID viene en los parámetros de la ruta

    try{
        if (!id) {
            res.status(400).json({ message: 'El ID de la subunidad es obligatorio' });
            return;
        }
            // Consultamos todas las subunidades en la base de datos
            const forms = await prisma.form.findMany(
                {
                    where: {
                        idsubuni: Number(id)
                    },
                }
            );

            // Si no hay subunidades, devolvemos un mensaje
            if (!forms || forms.length === 0) {
                res.status(404).json({
                    message: 'No se encontraron formularios',
                    forms
                });
                return;
            }
    
            // Enviamos las subunidades encontradas
            res.status(200).json(forms);
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
    const { id } = req.params; // Asumimos que el ID viene en los parámetros de la ruta
    console.log(id);
    try {
        // Validar que se proporciona el ID
        if (!id) {
            res.status(400).json({ message: 'El ID del Formulario es obligatorio' });
        }
        // Convertir el ID a número (si es necesario)
        const formId = parseInt(id);

        // Verificar que el registro existe
        const existingForm = await prisma.form.findUnique({
            where: { idf: formId },
        });

        // Manejo si `existingSubUnidad` es null
        if (!existingForm) {
            res.status(404).json({ message: 'Formulario no encontrada' });
        }

        // Eliminar la subunidad
        await prisma.form.delete({
            where: { idf: formId },
        });

        // Enviar respuesta exitosa
        res.status(200).json({ message: 'Formulario eliminada con éxito' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Hubo un error al eliminar el formulario',
            error: error.message,
        });
    }

}

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
        const formId = parseInt(id, 10);

        // Verificar que el registro existe
        const existingForm = await prisma.form.findUnique({
            where: { idf: formId },
        });

        if (!existingForm) {
            res.status(404).json({ message: 'Formulario no encontrado' });
        }
        const date = new Date();
        date.setHours(date.getHours() - 5);
        // Actualizar la subunidad
        const updatedSubUnidad = await prisma.form.update({
            where: { idf: formId },
            data: {
                nmForm: name,
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
    const { idf, idsubuni } = req.body; // Asumimos que el ID viene en los parámetros de la ruta
    console.log(idf, "ID sda");

    try {
        // Validar que se proporciona el ID
        if (!idf || !idsubuni) {
            res.status(400).json({ message: 'El ID del formulario es obligatorio' });
        }
        console.log(idf), "ID";

        // Convertir el ID a número (si es necesario)
        const formId = Number(idf);

        const formOld = await prisma.form.findFirst({
            where: {
                estado: true,
                idsubuni: Number(idsubuni),
            }
        });

        if (formOld) {
            await prisma.form.update({
                where: { idf: formOld.idf },
                data: {
                    estado: false,
                },
            });

            const date = new Date();
            date.setHours(date.getHours() - 5);
            // Actualizar la subunidad
            const updatedSubUnidad = await prisma.form.update({
                where: { idf: formId },
                data: {
                    updatedAt: date,
                    estado: true,
                },
            });

            const allform = await prisma.form.findMany({ where: { idsubuni: Number(idsubuni) } });

            res.status(200).json({ allform });
            return;
        }
        else {

            const date = new Date();
            date.setHours(date.getHours() - 5);
            // Actualizar la subunidad
            const updatedSubUnidad = await prisma.form.update({
                where: { idf: formId },
                data: {
                    updatedAt: date,
                    estado: true,
                },
            });
            
            // Enviar respuesta exitosa
            const allform = await prisma.form.findMany({ where: { idsubuni: Number(idsubuni) } });
            res.status(200).json({ allform });
            return;
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Hubo un error al actualizar la subunidad',
            error: error.message,
        });
    }

}

