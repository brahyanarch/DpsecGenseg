import { appError } from "../../../user/domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";
import { portOfficeRepository } from "../../domain/repositories/port.Office.Repository";

export class useGetOwnOfficeById {
    constructor(private readonly repo: portOfficeRepository) {}

    async execute(context: SecurityContext, idOficina: number) {
        this.ensureOwnership(context, idOficina);
        const office = await this.repo.findOwnOfficeById(context, idOficina);
        if (!office) {
            throw new appError("40401", "Oficina no encontrada", "Active profile office not found", true);
        }
        return office;
    }

    private ensureOwnership(context: SecurityContext, idOficina: number): void {
        if (context.cTipoRol !== "UNIVERSIDAD" || context.scope !== "LOCAL" || !context.idOficina || context.idOficina !== idOficina) {
            throw new appError("40301", "No puedes acceder a esta oficina", "Office is outside the university profile scope", true);
        }
    }
}
