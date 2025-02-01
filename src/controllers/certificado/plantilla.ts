import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const uploadFolder = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
    
    destination: (req, file, cb) => {
        cb(null, 'uploads/certificado/plantilla');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({ storage });
// Create a new Plantilla

export const createPlantilla = async (req: Request, res: Response) => {
  const { nombre, idsubunidad, tipo, titulo, cuerpo, QR, pie } = req.body;

  console.log(nombre, "nombre", idsubunidad, "idsubunidad", req.file);
  try {
    if(!req.file || !nombre || !idsubunidad ){
        res.status(400).json({ error: 'nombre, idsubunidad, tipo, titulo, cuerpo, QR, pie are required' });
        return;
    }
    const urlimg = req.file.path;
    const newPlantilla = await prisma.plantilla.create({
      data: {
        nombre,
        idsubunidad: Number(idsubunidad),
        urlimg: urlimg,
        tipo: tipo ? tipo: "PARTICIPANTE",
      },
    });

    
    res.status(201).json(newPlantilla);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all Plantillas
export const getPlantillasBySubunidad = async (req: Request, res: Response) => {
    const { id } = req.params;
  try {
    if(!id){
        res.status(400).json({ error: 'idsubunidad is required' });
        return;
    }
    const subunidad = Number(id);
    const plantillas = await prisma.plantilla.findMany({
        where: {
            idsubunidad: subunidad
        }
    });
    res.json(plantillas);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single Plantilla by ID
export const getPlantilla = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const plantilla = await prisma.plantilla.findUnique({
      where: { idplantilla: Number(id) },
    });

    if (!plantilla) {
      return res.status(404).json({ error: 'Plantilla not found' });
    }

    res.json(plantilla);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a Plantilla by ID
export const updatePlantilla = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre, idsubunidad, urlimg, tipo, titulo, cuerpo, QR, pie } = req.body;

  try {
    const updatedPlantilla = await prisma.plantilla.update({
      where: { idplantilla: Number(id) },
      data: {
        nombre,
        idsubunidad,
        urlimg,
        tipo,
      },
    });

    res.json(updatedPlantilla);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a Plantilla by ID
export const deletePlantilla = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.plantilla.delete({
      where: { idplantilla: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
