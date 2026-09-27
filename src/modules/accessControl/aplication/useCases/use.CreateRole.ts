import { portAccessControlRepository } from "../../domain/repositories/port.AccessControl.Repository";
import { entRol } from "../../domain/entities/ent.Rol";
import { appError } from "../../../user/domain/exceptions/app.Error";

export class useCreateRole {
    constructor(private readonly _repo: portAccessControlRepository) {}

    public async execute(data: Pick<entRol, "cNombreRol"> & Partial<entRol>): Promise<void> {
        const cTipoRol = data.cTipoRol ?? "UNIVERSIDAD";
        if (cTipoRol !== "UNIVERSIDAD" && cTipoRol !== "SISTEMA") {
            throw new appError("Tipo de rol inválido", "INVALID_FIELD", "cTipoRol must be UNIVERSIDAD or SISTEMA", true);
        }

        const rol = new entRol(
            null, 
            data.cNombreRol!, 
            cTipoRol,
            data.cAbrevRol || null, 
            data.lActivo ?? true, 
            data.lVigente ?? true
        );

        await this._repo.createRole(rol);
    }
}
