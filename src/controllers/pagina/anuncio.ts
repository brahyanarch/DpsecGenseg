import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createAnnouncement = async (req: Request, res: Response) => {
    const { title, description, endDate } = req.body;

    console.log(title, "title", description, "descripcion", endDate, "fecha fin");   
    if (!title || !description || !endDate) {
        return res.status(400).json({ error: "Title, description, and end date are required." });
    }
    try {
        if (new Date(endDate) < new Date()) {
            return res.status(400).json({ error: "End date must be in the future." });
        }

        const isAnuncio = await prisma.anuncio.findMany({});

        if (isAnuncio.length === 0) {
            const announcement = await prisma.anuncio.create({
                data: {
                    idanuncio: 1,
                    titulo: title,
                    descripcion:description,
                    fInicio: new Date(),
                    fFin: new Date(endDate),
                },
            });
            res.status(201).json({ error: "There is already an announcement.", announcement });
            return;
        }
        else
        {
            const announcement = await prisma.anuncio.update({
                where: { idanuncio: 1 },
                data: {
                    titulo: title,
                    descripcion:description,
                    fInicio: new Date(),
                    fFin: new Date(endDate),
                },
            });
            res.status(201).json({ message: "Announcement created successfully.", announcement });
            return;
        }

    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ error: "Internal server error." });
        return;
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.anuncio.findMany();

        if (!announcements || announcements.length === 0) {
            return res.status(404).json({ error: "No announcements found." });
        }

        res.status(200).json(...announcements);
    } catch (error) {
        console.error("Error fetching announcements:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
