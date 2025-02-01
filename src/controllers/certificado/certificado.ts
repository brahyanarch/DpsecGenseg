import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Ruta base para almacenar PDFs generados
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);


// Create a new Certificado
export const createCertificadoAlumno = async (req: Request, res: Response) => {
  const { codigo, dni, tipo, idplantilla, actividad_ids } = req.body;

  try {
    console.log(req.body);
    if (!codigo || !dni || !idplantilla) {
      res.status(400).json({ error: 'Codigo, DNI, idplantilla, and actividad_ids are required' });
      return;
    }
    if (!Array.isArray(actividad_ids) || actividad_ids.length === 0) {
      res.status(400).json({ error: "actividad_ids must be a non-empty array" });
      return;
    }

    const estudiante = await prisma.estudiante.findFirst({
      where: { dni, codigo },
    });

    console.log(estudiante, "estudiante");
    if (!estudiante) {
      res.status(404).json({ error: 'Estudiante not found' });
      return;
    }

    const receptor = await prisma.receptor.findFirst({
      where: { id_estudiante: estudiante.idest,
        id_externo: null,

      },         
    });
    console.log(receptor, "receptor");
    if (!receptor?.id_estudiante) {

      console.log(receptor?.id_estudiante, "Estamos dentro del if  =========================");
      const newReceptor = await prisma.receptor.create({
        data: {
          id_estudiante: estudiante.idest,
          tipo:tipo ? tipo : 'ESTUDIANTE', 
          id_externo: null, 
        },
      });
      const idcertificado = newReceptor?.id_receptor || 0;
      const pdfPath = path.join(uploadDir, `file-${idcertificado}-${Date.now()}.pdf`);
      const pdfUrl = `http://localhost:3000/uploads/${path.basename(pdfPath)}`;

      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
      });


      // Escribir el PDF en un archivo
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      const imgPlantilla = await prisma.plantilla.findUnique({
        where: { idplantilla: Number(idplantilla) },
      });
      console.log(imgPlantilla, "imgPlantilla");
      // Cargar la imagen de la plantilla
      if (imgPlantilla?.urlimg) {
        console.log(imgPlantilla.urlimg, "imgPlantilla.urlimg");
        doc.image(imgPlantilla.urlimg, 0, 0, { width: 595, height: 842 }); // Imagen en tamaño A4 (595x842 pt)
      } else {
        throw new Error('Image URL is undefined');
      }

      // Posicionar el texto en coordenadas específicas
      doc.fontSize(24).fillColor('black').text(estudiante.nombre + " "+ estudiante.aPaterno + " "+ estudiante.aMaterno, 150, 400);
      // Generar QR que apunte al PDF
      const qrCode = await QRCode.toDataURL(pdfUrl);
      const qrImage = qrCode.split(',')[1]; // Extraer datos base64
      const qrBuffer = Buffer.from(qrImage, 'base64');

      // Posicionar el QR en coordenadas específicas
      doc.image(qrBuffer, 400, 600, { width: 100, height: 100 });
      doc.end();

      const codigo = `CERT-${receptor?.id_receptor || newReceptor.id_receptor}-${Date.now()}`;
      const newCertificado = await prisma.certificado.create({
        data: {
          idreceptor: Number(newReceptor.id_receptor),
          codigo: codigo,
          nombre:"",
          tipo:"PARTICIPANTE",
          idplantilla: Number(idplantilla),
          actividad_ids: actividad_ids,
          urlpdf: pdfUrl,
        },
      });
      res.status(201).json(newCertificado);
      return;
    }
    else{
      
      console.log(receptor.id_receptor, "receptor.id_receptor");
      
      const idcertificado = receptor.id_receptor || 0;
      const pdfPath = path.join(uploadDir, `file-${idcertificado}-${Date.now()}.pdf`);
      const pdfUrl = `http://localhost:3000/uploads/${path.basename(pdfPath)}`;

      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
      });


      // Escribir el PDF en un archivo
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      const imgPlantilla = await prisma.plantilla.findUnique({
        where: { idplantilla: Number(idplantilla) },
      });
      console.log(imgPlantilla, "imgPlantilla");
      // Cargar la imagen de la plantilla
      if (imgPlantilla?.urlimg) {
        console.log(imgPlantilla.urlimg, "imgPlantilla.urlimg");
        doc.image(imgPlantilla.urlimg, 0, 0, { width: 595, height: 842 }); // Imagen en tamaño A4 (595x842 pt)
      } else {
        throw new Error('Image URL is undefined');
      }

      // Posicionar el texto en coordenadas específicas
      doc.fontSize(24).fillColor('black').text(estudiante.nombre + " "+ estudiante.aPaterno + " "+ estudiante.aMaterno, 150, 400);
      // Generar QR que apunte al PDF
      const qrCode = await QRCode.toDataURL(pdfUrl);
      const qrImage = qrCode.split(',')[1]; // Extraer datos base64
      const qrBuffer = Buffer.from(qrImage, 'base64');

      // Posicionar el QR en coordenadas específicas
      doc.image(qrBuffer, 400, 600, { width: 100, height: 100 });
      doc.end();

      const codigo = `CERT-${receptor?.id_receptor}-${Date.now()}`;
      const newCertificado = await prisma.certificado.create({
        data: {
          idreceptor: Number(receptor.id_receptor),
          codigo: codigo,
          nombre:"",
          tipo:"PARTICIPANTE",
          idplantilla: Number(idplantilla),
          actividad_ids: actividad_ids,
          urlpdf: pdfUrl,
        },
      });
      res.status(201).json(newCertificado);
      return;
    }
    } catch (error) {
    res.status(500).json({ error: 'Internal server error', detalles: error });
    return;
  }
};

// Get all Certificados
export const getAllCertificados = async (req: Request, res: Response) => {
  const {dni} = req.params;
  try {
    const certificados = await prisma.certificado.findMany({
      where: {
        receptor: {
          estudiante: {
            dni: dni,
          },
        },
      },
    });
    //const certificados = await prisma.certificado.findMany();
    res.status(201).json(certificados);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get a single Certificado by ID
export const getCertificadoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const certificado = await prisma.certificado.findUnique({
      where: { idcertificado: Number(id) },
    });

    if (!certificado) {
      return res.status(404).json({ error: 'Certificado not found' });
    }

    res.json(certificado);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

/*
// Update a Certificado by ID
export const updateCertificado = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { idreceptor, codigo, nombre, tipo, idplantilla, actividad_ids } = req.body;

  try {
    const updatedCertificado = await prisma.certificado.update({
      where: { idcertificado: Number(id) },
      data: {
        idreceptor,
        codigo,
        nombre,
        tipo,
        idplantilla,
        actividad_ids,
      },
    });

    res.json(updatedCertificado);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a Certificado by ID
export const deleteCertificado = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.certificado.delete({
      where: { idcertificado: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all activities for a student by dni, codigo, and idsubunidad
export const getStudentActivities = async (req: Request, res: Response) => {
  const { dni, codigo, idsubunidad } = req.query;

  if (!dni || !codigo || !idsubunidad) {
    return res.status(400).json({ error: 'DNI, codigo, and idsubunidad are required' });
  }

  try {
    const estudiante = await prisma.estudiante.findUnique({
      where: {
        codigo_dni_subunidad: {
          dni: String(dni),
          codigo: String(codigo),
          idsubunidad: Number(idsubunidad),
        },
      },
      include: {
        actividades: true,
      },
    });

    if (!estudiante) {
      return res.status(404).json({ error: 'Estudiante not found' });
    }

    res.json(estudiante.actividades);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};*/