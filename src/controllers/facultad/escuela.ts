import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createEscuela = async (req: Request, res: Response): Promise<void> => {
    const { nombre, idfacu } = req.body;
    try {
        if (!nombre || !idfacu) {
            res.status(400).json({ message: 'Todos los campos son obligatorios' });
            return;
        }
        const newEscuela = await prisma.escuela.create({
            data: {
                nmEsc: nombre,
                idfacu: Number(idfacu),
            },
        });
        res.status(201).json(newEscuela);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear la escuela' });
    } 
};

export const getEscuelas = async (req: Request, res: Response): Promise<void> => {
    try {
        const escuelas = await prisma.escuela.findMany();
        res.status(200).json(escuelas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las escuelas' });
    } 
};

export const updateEscuela = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nombre, idfacu } = req.body;
    try {
        if (!nombre || !idfacu) {
            res.status(400).json({ message: 'Todos los campos son obligatorios' });
            return;
        }
        const updatedEscuela = await prisma.escuela.update({
            where: { idesc: Number(id) },
            data: {
                nmEsc: nombre,
                idfacu: Number(idfacu),
            },
        });
        res.status(200).json(updatedEscuela);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar la escuela' });
    } 
};

export const deleteEscuela = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.escuela.delete({
            where: { idesc: Number(id) },
        });
        res.status(200).json({ message: 'Escuela eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar la escuela' });
    } 
};
