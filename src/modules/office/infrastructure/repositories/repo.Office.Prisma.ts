import { prisma } from "../../../../shared/database/prisma.client";
import { SecurityContext } from "../../../../shared/types/security";
import { CreateOfficeData, Office, UpdateOfficeData } from "../../domain/entities/ent.Office";
import { portOfficeRepository } from "../../domain/repositories/port.Office.Repository";

export class repoOfficePrisma implements portOfficeRepository {
    async createOffice(data: CreateOfficeData): Promise<Office> {
        return prisma.oficina.create({
            data: { ...data, lActivo: true, lVigente: true }
        });
    }

    async findOwnOffice(context: SecurityContext): Promise<Office | null> {
        return prisma.oficina.findFirst({
            where: { idOficina: context.idOficina!, lActivo: true, lVigente: true }
        });
    }

    async findOwnOfficeById(context: SecurityContext, idOficina: number): Promise<Office | null> {
        return prisma.oficina.findFirst({
            where: { idOficina, AND: { idOficina: context.idOficina! }, lActivo: true, lVigente: true }
        });
    }

    async updateOwnOffice(context: SecurityContext, idOficina: number, data: UpdateOfficeData): Promise<Office | null> {
        const result = await prisma.oficina.updateMany({
            where: { idOficina, AND: { idOficina: context.idOficina! }, lActivo: true, lVigente: true },
            data
        });
        if (!result.count) return null;
        return this.findOwnOfficeById(context, idOficina);
    }
}
