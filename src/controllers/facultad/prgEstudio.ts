import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createPrgEstudio = async (req: Request, res: Response): Promise<void> => {
    const { nombre, idesc } = req.body;
    try {
        if (!nombre || !idesc) {
            res.status(400).json({ message: 'Todos los campos son obligatorios' });
            return;
        }
        const newPrgEstudio = await prisma.prgEstudio.create({
            data: {
                nmPE: nombre,
                idesc: Number(idesc),
            },
        });
        res.status(201).json(newPrgEstudio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear el programa de estudios' });
    } finally {
        await prisma.$disconnect();
    }
};

export const getPrgEstudios = async (req: Request, res: Response): Promise<void> => {
    try {
        const prgEstudios = await prisma.prgEstudio.findMany();
        res.status(200).json(prgEstudios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los programas de estudios' });
    } finally {
        await prisma.$disconnect();
    }
};

export const updatePrgEstudio = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { nombre, idesc } = req.body;
    try {
        if (!nombre || !idesc) {
            res.status(400).json({ message: 'Todos los campos son obligatorios' });
            return;
        }
        const updatedPrgEstudio = await prisma.prgEstudio.update({
            where: { idpe: Number(id) },
            data: {
                nmPE: nombre,
                idesc: Number(idesc),
            },
        });
        res.status(200).json(updatedPrgEstudio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el programa de estudios' });
    } finally {
        await prisma.$disconnect();
    }
};

export const deletePrgEstudio = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.prgEstudio.delete({
            where: { idpe: Number(id) },
        });
        res.status(200).json({ message: 'Programa de estudios eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el programa de estudios' });
    } finally {
        await prisma.$disconnect();
    }
};
