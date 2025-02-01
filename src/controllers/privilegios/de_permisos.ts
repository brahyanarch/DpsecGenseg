import { Request, Response } from "express";
import prisma from '../../models/privilegios/de_permisos';

/*---------- CREAR PERMISO -------*/
export const createDePermiso = async (req: Request, res: Response): Promise<void> => {
    const { id_rol, id_per, estado } = req.body;
    try {
        const newDePermiso = await prisma.create({
            data: {
                id_rol,
                id_per,
                estado,
            },
        });
        res.status(201).json(newDePermiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el detalle del permiso' });
    }
};

/*---------- OBTENER DETALLES PERMISO -------*/
export const getAllDePermisos = async (req: Request, res: Response): Promise<void> => {
    try {
        const dePermisos = await prisma.findMany({
            include: {
                permisos: true,
                roles: true,
            },
        });
        res.status(200).json(dePermisos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los detalles de los permisos' });
    }
};

// Obtener todos los detalles de permiso de un usuario
export const getAllPermisosToUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Obtener el ID que sera un id del rol

    try {
        const dePermisos = await prisma.findMany({
            where: {
                id_rol: Number(id), // Asegúrate de convertir id_per a número si es necesario
            },
            include: {
                permisos: {
                    select: {
                        n_per: true,
                        abreviatura: true,
                    },
                },
                roles: false,
            },
            orderBy: {
                id_dper: 'asc',
            },
        });

        if (dePermisos.length === 0) {
            res.status(404).json({ message: `No se encontraron detalles de permisos para el id_per: ${id}` });
            return;
        }

        res.status(200).json(dePermisos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los detalles de los permisos' });
    }
};

/*---------- ADTULIZAR DETALLE DE PERMISO POR ID ---------*/
export const updateDePermiso = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { id_rol, id_per, estado } = req.body;
    try {
        const existingDePermiso = await prisma.findUnique({
            where: { id_dper: parseInt(id) },
        });

        if (!existingDePermiso) {
            res.status(404).json({ message: 'Detalle de permiso no encontrado' });
        }

        const updatedDePermiso = await prisma.update({
            where: { id_dper: parseInt(id) },
            data: {
                id_rol,
                id_per,
                estado,
            },
        });

        res.status(200).json(updatedDePermiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el detalle del permiso' });
    }
};

/*---------- ELIMINAR DETALLE PERMISO POR ID -------*/
export const deleteDePermiso = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const existingDePermiso = await prisma.findUnique({
            where: { id_dper: parseInt(id) },
        });

        if (!existingDePermiso) {
            res.status(404).json({ message: 'Detalle de permiso no encontrado' });
        }

        await prisma.delete({
            where: { id_dper: parseInt(id) },
        });

        res.status(200).json({ message: 'Detalle de permiso eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el detalle del permiso' });
    }
};

export const ToggleDetallePermiso = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { estado } = req.body;
    console.log(estado,"estado");
    console.log(id,"id");
    try {
        const existingDePermiso = await prisma.findUnique({
            where: { id_dper: Number(id) },
        });

        if (!existingDePermiso) {
            res.status(404).json({ message: 'Detalle de permiso no encontrado' });
        }

        const updatedDePermiso = await prisma.update({
            where: { id_dper: Number(id) },
            data: {
                estado: estado,
            },
        });

        res.status(200).json(updatedDePermiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el detalle del permiso' });
    }
}