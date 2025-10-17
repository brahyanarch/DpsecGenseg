import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { HoraLima } from "@/../../src/services/horaLima.service";

class PlantillaDocController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /* REGISTRO DE LA PLANTILLA DOCUMENTARIA */
  public createPlantillaDoc = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    //console.log("Creando plantilla documentaria...", req.body);
    try {
      const { nombre, descripcion, documentBody } = req.body;
      const idsubunidad = Number(req.usuario?.idsubunidad);

      // Validación básica
      if (!nombre || !documentBody || !Array.isArray(documentBody)) {
        res
          .status(400)
          .json({ error: "Datos incompletos o formato incorrecto" });
        return;
      }

      // Crear plantilla principal con cuerpo anidado
      const newPlantilla = await this.prisma.plantillaDocumento.create({
        data: {
          nombre,
          descripcion,
          idsubunidad,
          cuerpo: {
            create: documentBody.map((item: any, index: number) => ({
              type: item.type,
              contenido: item.contenido ?? null,
              items: item.items ?? null,
              iseditable: item.iseditable ?? false,
              orden: index + 1, // mantener orden
            })),
          },
        },
        include: {
          cuerpo: true,
        },
      });

      res.status(201).json(newPlantilla);
    } catch (error) {
      console.error("Error al crear plantilla documentaria:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  public getPlantillasBySubUnidad = async (
    req: Request<
      {},
      {},
      {},
      {
        page?: string;
        limit?: string;
        sort?: string;
        search?: string;
        estado?: string;
      }
    >,
    res: Response
  ): Promise<void> => {
    try {
      const idsubunidad = Number(req.usuario?.idsubunidad);

      // Parámetros con valores por defecto
      const { page = "1", limit = "10", sort, search, estado } = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Construir condiciones dinámicas
      const where: any = {
        idsubunidad,
        sofdelete: false,
      };

      if (estado !== undefined) {
        where.estado = estado === "true"; // ya que tu campo es Boolean
      }

      if (search) {
        where.OR = [
          { nombre: { contains: search, mode: "insensitive" } },
          { descripcion: { contains: search, mode: "insensitive" } },
        ];
      }

      // Ordenamiento dinámico
      const orderBy: Record<string, "asc" | "desc"> = {};
      if (sort) {
        const [field, order] = sort.split(":");
        if (order === "asc" || order === "desc") {
          orderBy[field] = order;
        }
      }

      // Ejecutar consulta en paralelo (más eficiente)
      const [plantillas, totalCount] = await Promise.all([
        this.prisma.plantillaDocumento.findMany({
          skip,
          take: limitNum,
          where,
          select: {
            idplantilladoc: true,
            nombre: true,
            descripcion: true,
            estado: true,
            createdAt: true,
            updatedAt: true,
            // no incluimos cuerpo para hacerlo más liviano
          },
          orderBy:
            Object.keys(orderBy).length > 0 ? orderBy : { createdAt: "desc" },
        }),
        this.prisma.plantillaDocumento.count({ where }),
      ]);

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNext = pageNum < totalPages;
      const hasPrev = pageNum > 1;

      // Respuesta final
      res.status(200).json({
        success: true,
        data: plantillas,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNext,
          hasPrev,
          limit: limitNum,
        },
      });
    } catch (error) {
      console.error("Error fetching plantilla documentaria:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  };

  public getNamePlantillaDocById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const idPlantilla = Number(req.params.id);
      const plantilla = await this.prisma.plantillaDocumento.findUnique({
        where: {
          idplantilladoc: idPlantilla,
          sofdelete: false,
        },
        select: {
          idplantilladoc: true,
          nombre: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!plantilla) {
        res.status(404).json({ error: "Plantilla not found" });
        return;
      }
      res.status(200).json({ plantilla: plantilla });
    } catch (error) {
      console.error("Error fetching plantilla name:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  public getBodyDocumentById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const idPlantilla = Number(req.params.id);
      const bodyPlantilla = await this.prisma.plantillaDocumento.findUnique({
        where: {
          idplantilladoc: idPlantilla,
        },
        select: {
          cuerpo: {
            select: {
              idcuerpo: true,
              type: true,
              contenido: true,
              items: true,
              iseditable: true,
              orden: true,
            },
            orderBy: { orden: "asc" },
          },
        },
      });
      if (!bodyPlantilla) {
        res.status(404).json({ error: "Plantilla not found" });
        return;
      }
      res.status(200).json({ bodyPlantilla: bodyPlantilla });
    } catch (error) {
      console.error("Error fetching plantilla documentaria:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  // Toggle estado plantilla documentaria
  public toggleEstadoPlantillaDoc = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const idPlantilla = Number(req.params.id);
      const plantilla = await this.prisma.plantillaDocumento.findUnique({
        where: { idplantilladoc: idPlantilla },
      });
      if (!plantilla) {
        res.status(404).json({ error: "Plantilla not found" });
        return;
      }
      const updatedPlantilla = await this.prisma.plantillaDocumento.update({
        where: { idplantilladoc: idPlantilla },
        data: { estado: !plantilla.estado },
      });
      res.status(200).json({ plantilla: updatedPlantilla });
    } catch (error) {
      console.error("Error toggling plantilla estado:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

  // Listar todos las plantillas documentarias en estado true
  public getAllActivePlantillas = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const idsubuni = Number(req.usuario?.idsubunidad);
      
      const plantillas = await this.prisma.plantillaDocumento.findMany({
        where: { estado: true, sofdelete: false, idsubunidad: idsubuni },
        select: {
          idplantilladoc: true,
          nombre: true,
          descripcion: true,
          estado: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json({ plantillas });
    } catch (error) {
      console.error("Error fetching active plantillas:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
}

export default new PlantillaDocController();
