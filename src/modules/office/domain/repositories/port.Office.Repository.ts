import { SecurityContext } from "../../../../shared/types/security";
import { CreateOfficeData, Office, UpdateOfficeData } from "../entities/ent.Office";

export interface portOfficeRepository {
    createOffice(data: CreateOfficeData): Promise<Office>;
    findOwnOffice(context: SecurityContext): Promise<Office | null>;
    findOwnOfficeById(context: SecurityContext, idOficina: number): Promise<Office | null>;
    updateOwnOffice(context: SecurityContext, idOficina: number, data: UpdateOfficeData): Promise<Office | null>;
}
