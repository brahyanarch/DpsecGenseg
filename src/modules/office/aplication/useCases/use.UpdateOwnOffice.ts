import { appError } from "../../../user/domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";
import { UpdateOfficeData } from "../../domain/entities/ent.Office";
import { portOfficeRepository } from "../../domain/repositories/port.Office.Repository";

export class useUpdateOwnOffice {
    constructor(private readonly repo: portOfficeRepository) {}

    async execute(context: SecurityContext, idOficina: number, data: UpdateOfficeData) {
        if (context.cTipoRol !== "UNIVERSIDAD" || context.scope !== "LOCAL" || !context.idOficina || context.idOficina !== idOficina) {
            throw new appError("40301", "No puedes modificar esta oficina", "Office is outside the university profile scope", true);
        }
        const changes: UpdateOfficeData = {};
        if (data.cNombreOficina !== undefined) {
            if (typeof data.cNombreOficina !== "string" || !data.cNombreOficina.trim()) {
                throw new appError("40001", "El nombre de oficina no es válido", "cNombreOficina must be a non-empty string", true);
            }
            changes.cNombreOficina = data.cNombreOficina.trim();
        }
        if (data.cAbrevOficina !== undefined) {
            if (typeof data.cAbrevOficina !== "string" || !data.cAbrevOficina.trim()) {
                throw new appError("40001", "La abreviatura de oficina no es válida", "cAbrevOficina must be a non-empty string", true);
            }
            changes.cAbrevOficina = data.cAbrevOficina.trim();
        }
        if (Object.keys(changes).length === 0) {
            throw new appError("40001", "Debes indicar nombre o abreviatura", "At least one editable office field is required", true);
        }
        const office = await this.repo.updateOwnOffice(context, idOficina, changes);
        if (!office) {
            throw new appError("40401", "Oficina no encontrada", "Active profile office not found", true);
        }
        return office;
    }
}
