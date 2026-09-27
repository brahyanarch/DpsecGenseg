import { Request, Response, NextFunction } from "express";
import { SecurityContext } from "../../../../../shared/types/security";
import { appError } from "../../../../user/domain/exceptions/app.Error";
import { useGetOwnOffice } from "../../../aplication/useCases/use.GetOwnOffice";
import { useGetOwnOfficeById } from "../../../aplication/useCases/use.GetOwnOfficeById";
import { useCreateOffice } from "../../../aplication/useCases/use.CreateOffice";
import { useUpdateOwnOffice } from "../../../aplication/useCases/use.UpdateOwnOffice";
import { repoOfficePrisma } from "../../repositories/repo.Office.Prisma";

export class OfficeController {
    private readonly getOwnOffice = new useGetOwnOffice(new repoOfficePrisma());
    private readonly getOwnOfficeById = new useGetOwnOfficeById(new repoOfficePrisma());
    private readonly updateOwnOffice = new useUpdateOwnOffice(new repoOfficePrisma());
    private readonly createOffice = new useCreateOffice(new repoOfficePrisma());

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        
        if (process.env.ENABLE_UNAUTHENTICATED_OFFICE_CREATE !== "true" || process.env.NODE_ENV === "production") {
            res.status(404).json({ nSuccess: false, error: { cMessage: "Not found" } });
            return;
        }

        const body = req.body;
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            res.status(400).json({ nSuccess: false, error: { cMessage: "Request body must be an object" } });
            return;
        }
        if (Object.keys(body).some(key => key !== "cNombreOficina" && key !== "cAbrevOficina")) {
            res.status(400).json({ nSuccess: false, error: { cMessage: "Only office name and abbreviation are allowed" } });
            return;
        }

        const cNombreOficina = typeof body.cNombreOficina === "string" ? body.cNombreOficina.trim() : "";
        const cAbrevOficina = typeof body.cAbrevOficina === "string" ? body.cAbrevOficina.trim() : "";
        if (!cNombreOficina || !cAbrevOficina) {
            res.status(400).json({ nSuccess: false, error: { cMessage: "Office name and abbreviation are required" } });
            return;
        }

        try {
            const data = await this.createOffice.execute({ cNombreOficina, cAbrevOficina });
            res.status(201).json({ nSuccess: true, data });
        } catch (error) {
            if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
                res.status(409).json({ nSuccess: false, error: { cMessage: "Office name already exists" } });
                return;
            }
            next(error);
        }
    };

    private context(req: Request): SecurityContext {
        const context = (req as any).securityContext as SecurityContext | undefined;
        if (!context) throw new appError("50001", "Contexto de seguridad no resuelto", "Security context missing", true);
        return context;
    }

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(200).json({ nSuccess: true, data: await this.getOwnOffice.execute(this.context(req)) });
        } catch (error) { next(error); }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idOficina = this.parseId(req.params.idOficina);
            res.status(200).json({ nSuccess: true, data: await this.getOwnOfficeById.execute(this.context(req), idOficina) });
        } catch (error) { next(error); }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idOficina = this.parseId(req.params.idOficina);
            const body = req.body;
            if (!body || typeof body !== "object" || Array.isArray(body)) {
                throw new appError("40001", "Cuerpo de solicitud no válido", "Request body must be an object", true);
            }
            const keys = Object.keys(body);
            if (keys.some(key => key !== "cNombreOficina" && key !== "cAbrevOficina")) {
                throw new appError("40001", "Solo se permite modificar nombre y abreviatura", "Only office name and abbreviation are editable", true);
            }
            res.status(200).json({ nSuccess: true, data: await this.updateOwnOffice.execute(this.context(req), idOficina, body) });
        } catch (error) { next(error); }
    };

    private parseId(value: string): number {
        const id = Number(value);
        if (!Number.isSafeInteger(id) || id <= 0) {
            throw new appError("40001", "Identificador de oficina no válido", "idOficina must be a positive integer", true);
        }
        return id;
    }
}
