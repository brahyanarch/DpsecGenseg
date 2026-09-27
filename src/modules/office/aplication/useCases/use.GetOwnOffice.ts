import { appError } from "../../../user/domain/exceptions/app.Error";
import { SecurityContext } from "../../../../shared/types/security";
import { portOfficeRepository } from "../../domain/repositories/port.Office.Repository";

export class useGetOwnOffice {
    constructor(private readonly repo: portOfficeRepository) {}

    async execute(context: SecurityContext) {
        this.ensureUniversityContext(context);
        const office = await this.repo.findOwnOffice(context);
        if (!office) {
            throw new appError("40401", "Oficina no encontrada", "Active profile office not found", true);
        }
        return office;
    }

    private ensureUniversityContext(context: SecurityContext): void {
        if (context.cTipoRol !== "UNIVERSIDAD" || context.scope !== "LOCAL" || !context.idOficina) {
            throw new appError("40301", "Esta operación requiere un perfil universitario", "University profile context required", true);
        }
    }
}
