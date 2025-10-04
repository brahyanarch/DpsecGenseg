import { Request, Response } from "express";
//import prismaAux from '../../models/privilegios/permisos';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


/*---------- CREAR PERMISOS DE PERMISOS ----------*/
// Crear un nuevo permiso y automáticamente crear en detalles de permisos para cada rol existente
export const createPermisoWithDePermisos = async (req: Request, res: Response): Promise<void> => {
    const { n_per, abrev } = req.body;

    try {
        // Paso 1: Crear el nuevo permiso
        const newPermiso = await prisma.permiso.create({
            data: {
                n_per: n_per,
                abreviatura: abrev,
            },
        });

        // Paso 2: Obtener todos los roles existentes
        const allRoles = await prisma.rol.findMany();

        // Paso 3: Crear automáticamente detalles de permiso (De_permiso) para cada rol
        const dePermisos = await prisma.detallePermiso.createMany({
            data: allRoles.map(role => ({
                id_rol: role.id_rol,
                id_per: newPermiso.id_per,
                estado: true,  // O puedes ajustar el estado según lo que necesites
            })),
        });

        res.status(201).json({
            message: 'Permiso creado y detalles de permisos generados para todos los roles',
            newPermiso,
            dePermisos,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al crear el permiso y los detalles de permisos',
        });
    }
};


/*---------- ACTUALIZAR LOS PERSMINOS -----------*/
export const updatePermisoWithDePermisos = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // id del permiso a actualizar
    const { n_per, abrev } = req.body;

    try {
        // Paso 1: Actualizar el permiso
        const updatedPermiso = await prisma.permiso.update({
            where: {
                id_per: parseInt(id),
            },
            data: {
                n_per: n_per,
                abreviatura: abrev,
            },
        });

        res.status(200).json({
            message: 'Permiso actualizado correctamente',
            updatedPermiso,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al actualizar el permiso',
        });
    }
};

/*---------- ELIMINAR LAS SUB UNIDADES ----------*/
export const deletePermisoWithDePermisos = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // id del permiso a eliminar

    try {
        // Paso 1: Eliminar todos los detalles de permiso relacionados con este permiso
        await prisma.detallePermiso.deleteMany({
            where: {
                id_per: parseInt(id),
            },
        });

        // Paso 2: Eliminar el permiso
        const deletedPermiso = await prisma.permiso.delete({
            where: {
                id_per: parseInt(id),
            },
        });

        res.status(200).json({
            message: 'Permiso y detalles de permiso eliminados correctamente',
            deletedPermiso,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error al eliminar el permiso',
        });
    }
};


/*---------- CREAR PERMISOS ----------*/
export const createPermiso = async (req: Request, res: Response): Promise<void> => {
    const { n_per, abrev } = req.body;
    try {
        const newPermiso = await prisma.permiso.create({
            data: {
                n_per: n_per,
                abreviatura: abrev,
            },
        });
        res.status(201).json(newPermiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el permiso' });
    }
};

/*---------- OBTENER TOODOS LOS PERMISOS ----------*/
export const getAllPermisos = async (req: Request, res: Response): Promise<void> => {
    
    try {
        const permisos = await prisma.permiso.findMany();
        res.status(200).json(permisos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los permisos' });
    }
};

/*---------- ACTUALIZAR LOS PERMISOS ----------*/
export const updatePermiso = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { n_per, abrev } = req.body;
    try {
        const existingPermiso = await prisma.permiso.findUnique({
            where: { id_per: parseInt(id) },
        });

        if (!existingPermiso) {
            res.status(404).json({ message: 'Permiso no encontrado' });
        }

        const updatedPermiso = await prisma.permiso.update({
            where: { id_per: parseInt(id) },
            data: {
                n_per: n_per,
                abreviatura: abrev,
            },
        });

        res.status(200).json(updatedPermiso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el permiso' });
    }
};

/*---------- ELIMINAR PERMISOS POR SU ID ----------*/
export const deletePermiso = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const existingPermiso = await prisma.permiso.findUnique({
            where: { id_per: parseInt(id) },
        });

        if (!existingPermiso) {
            res.status(404).json({ message: 'Permiso no encontrado' });
        }

        await prisma.permiso.delete({
            where: { id_per: parseInt(id) },
        });

        res.status(200).json({ message: 'Permiso eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el permiso' });
    }
};