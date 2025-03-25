import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createFacultad = async (req: Request, res: Response): Promise<void> => {
    const { nombre } = req.body;
    try {
        if (!nombre) {
            res.status(400).json({ message: 'El nombre es obligatorio' });
            return;
        }
        const newFacultad = await prisma.facu.create({
            data: {
                nmFacu: nombre,
            },
        });
        res.status(201).json(newFacultad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la facultad' });
    } 
};

export const getFacultades = async (req: Request, res: Response): Promise<void> => {
    try {
        const facultades = await prisma.facu.findMany();
        res.status(200).json(facultades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las facultades' });
    } 
};

export const updateFacultad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        if (!nombre) {
            res.status(400).json({ message: 'El nombre es obligatorio' });
            return;
        }
        const updatedFacultad = await prisma.facu.update({
            where: { idfacu: Number(id) },
            data: {
                nmFacu: nombre,
            },
        });
        res.status(200).json(updatedFacultad);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la facultad' });
    } 
};

export const deleteFacultad = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.facu.delete({
            where: { idfacu: Number(id) },
        });
        res.status(200).json({ message: 'Facultad eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la facultad' });
    } 
};
