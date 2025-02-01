import { Request, Response } from "express";
import prisma from '../../models/privilegios/subUnidad';

/*---------- CREAR UNA NUEVA SUB UNIDAD ----------*/
export const newSubUnidad = async (req: Request, res: Response): Promise<void> => {
    const {nombre, abreviatura} = req.body;
    try {
        // VALIDAMOS EL PASSWORD Y USUARIO
        if(!nombre){
            res.status(400).json({message: 'El nombre es obligatorio'});
            return;
        }
        //if(!usuario) throw new Error('El usuario es obligatorio');
        const subUnidad = await prisma.create(
            {
                data: {
                    n_subuni: nombre,
                    abreviatura: abreviatura,
                }
            }
        )
        if(!subUnidad)
        {
            res.status(400).json({message: 'No se pudo crear la subunidad'});
            return;
        }
        res.status(201).json({subUnidad});
        return;
        
    } catch (error: any) {
        // TODO para manejar los errores

        // VALIDAR EL USUARIO
        if(!nombre){
            res.status(400).json({
                message: 'Problemas con el nombre'
            })
        }
        

        // VALIDAR DUPLICIDAD
        if(error?.code === 'P2002' && error?.meta?.target?.includes('nombre')){
            res.status(500).json({
                message: 'El nombre ya existe'
            })
        }

        //Mejorar los errores 
        console.log(error);
        res.status(500).json({
            error: 'Hubo un error en el registro'
        })
    }
}


/*---------- OBTENER LAS SUB UNIDADES ----------*/
export const getAllSubUnidades = async (req: Request, res: Response): Promise<void> => {
    try {
        // Consultamos todas las subunidades en la base de datos
        const subUnidades = await prisma.findMany();

        // Si no hay subunidades, devolvemos un mensaje
        if (!subUnidades || subUnidades.length === 0) {
            res.status(404).json({
                message: 'No se encontraron subunidades',
            });
        }

        // Enviamos las subunidades encontradas
        res.status(200).json(subUnidades);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Hubo un error al obtener las subunidades',
            error: error.message,
        });
    }
};

/*---------- ACTULIZAR UNA SUB UNIDAD ----------*/
export const updateSubUnidad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Asumimos que el ID viene en los parámetros de la ruta
    const { nombre, abreviatura } = req.body;

    try {
        // Validar que se proporciona el ID
        if (!id) {
            res.status(400).json({ message: 'El ID de la subunidad es obligatorio' });
        }

        // Validar que se proporciona al menos un campo para actualizar
        if (!nombre && !abreviatura) {
            res.status(400).json({ message: 'Debe proporcionar al menos un campo para actualizar' });
        }

        // Convertir el ID a número (si es necesario)
        const subUnidadId = parseInt(id, 10);

        // Verificar que el registro existe
        const existingSubUnidad = await prisma.findUnique({
            where: { id_subuni: subUnidadId },
        });

        if (!existingSubUnidad) {
            res.status(404).json({ message: 'Subunidad no encontrada' });
        }

        // Actualizar la subunidad
        const updatedSubUnidad = await prisma.update({
            where: { id_subuni: subUnidadId },
            data: {
                n_subuni: nombre || existingSubUnidad?.n_subuni,
                abreviatura: abreviatura || existingSubUnidad?.abreviatura,
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
};


/*---------- ELIMINAR UNA SUBUNIDAD ----------*/
export const deleteSubUnidad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Asumimos que el ID viene en los parámetros de la ruta
    console.log(id);
    try {
        // Validar que se proporciona el ID
        if (!id) {
            res.status(400).json({ message: 'El ID de la subunidad es obligatorio' });
        }

        // Convertir el ID a número (si es necesario)
        const subUnidadId = parseInt(id);

        // Verificar que el registro existe
        const existingSubUnidad = await prisma.findUnique({
            where: { id_subuni: subUnidadId },
        });

        // Manejo si `existingSubUnidad` es null
        if (!existingSubUnidad) {
            res.status(404).json({ message: 'Subunidad no encontrada' });
        }

        // Eliminar la subunidad
        await prisma.delete({
            where: { id_subuni: subUnidadId },
        });

        // Enviar respuesta exitosa
        res.status(200).json({ message: 'Subunidad eliminada con éxito' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            message: 'Hubo un error al eliminar la subunidad',
            error: error.message,
        });
    }
};