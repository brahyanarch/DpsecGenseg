import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { HoraLima } from "../../services/horaLima.service";
import fs from "fs";
import path from "path";
import { GetTasksQueryParams, SortOptions, Estado } from "./type";

class AskController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  public createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, estado } = req.body;

      // Validación de título
      if (!title) {
        res.status(400).json({ error: "Datos incompletos" });
        return; // 🔥 IMPORTANTE: return aquí
      }

      // Validación de estado
      if (estado && !Object.values(Estado).includes(estado)) {
        res.status(400).json({ error: "Estado inválido" });
        return;
      }

      // Crear la tarea
      const newTask = await this.prisma.task.create({
        data: {
          title,
          description,
          createdAt: HoraLima(),
          updatedAt: HoraLima(),
          estado: estado || Estado.PENDIENTE,
        },
      });

      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error al crear tarea:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  public getTasks = async (
    req: Request<{}, {}, {}, GetTasksQueryParams>,
    res: Response
  ) => {
    try {
      const { page = "1", limit = "10", sort, search, estado } = req.query;

      // Calculate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build the `where` object for filtering:cite[2]
      const where: any = {};
      if (estado) {
        where.estado = estado;
      }
      if (search) {
        where.title = {
          contains: search,
          // mode: 'insensitive' // Uncomment if your database supports it:cite[2]
        };
      }

      // Parse sorting parameter:cite[1]
      const orderBy: SortOptions = {};
      if (sort) {
        const [field, order] = sort.split(":");
        if (order === "asc" || order === "desc") {
          orderBy[field] = order;
        }
      }

      // Execute query with Prisma:cite[2]:cite[5]
      const [tasks, totalCount] = await Promise.all([
        this.prisma.task.findMany({
          skip,
          take: limitNum,
          where,
          orderBy:
            Object.keys(orderBy).length > 0 ? orderBy : { createdAt: "desc" },
        }),
        this.prisma.task.count({ where }),
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limitNum);
      const hasNext = pageNum < totalPages;
      const hasPrev = pageNum > 1;

      // Send response
      res.json({
        success: true,
        data: tasks,
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
      console.error("Error fetching tasks:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
}

export default new AskController();
