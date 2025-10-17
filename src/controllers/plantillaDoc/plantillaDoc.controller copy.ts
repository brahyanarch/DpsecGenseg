import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import {HoraLima} from '@/../../src/services/horaLima.service';

class PlantillaDocController {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    
    /* REGISTRO DE LA PLANTILLA DOCUMENTARIA */
    public createPlantillaDoc = async (req: Request, res: Response): Promise<void> => {
        console.log("Creating plantilla documentaria...", req.body.nombre);
        try {
            const { nombre } = req.body;
            const idsubunidad = Number(req.usuario?.idsubunidad);
            const newPlantilla = await this.prisma.plantillaDoc.create({
                data: {
                    nombre: nombre,
                    idsubuni: idsubunidad,

                    createdAt: HoraLima(),
                    updatedAt: HoraLima(),
                },
            });
            res.status(201).json(newPlantilla);
        } catch (error) {
            console.error("Plantilla documentaria error:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
    public getPlantillaDocBySubUnidad = async (req: Request, res: Response): Promise<void> => {
        try {
            const idsubunidad = Number(req.usuario?.idsubunidad);
            const plantillas = await this.prisma.plantillaDoc.findMany({
                where: {
                    idsubuni: idsubunidad,
                    softDeleted: false
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.status(200).json({plantillas});
        } catch (error) {
            console.error("Error fetching plantilla documentaria:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
    public getNamePlantillaDocById = async (req: Request, res: Response): Promise<void> => {
        try {
            const idPlantilla = Number(req.params.id);
            const plantilla = await this.prisma.plantillaDoc.findUnique({
                where: {
                    idPdoc: idPlantilla,
                    softDeleted: false
                },
                select: {
                    nombre: true
                }
            });
            if (!plantilla) {
                res.status(404).json({ error: "Plantilla not found" });
                return;
            }
            res.status(200).json({nombre: plantilla.nombre});
        } catch (error) {
            console.error("Error fetching plantilla name:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
}

export default new PlantillaDocController();
