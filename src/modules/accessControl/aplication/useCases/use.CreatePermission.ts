import { portAccessControlRepository } from "../../domain/repositories/port.AccessControl.Repository";
import { entPermiso } from "../../domain/entities/ent.Permiso";
import { appError } from "../../../user/domain/exceptions/app.Error";

export class useCreatePermission {
    constructor(private readonly _repo: portAccessControlRepository) {}

    public async execute(data: Partial<entPermiso>): Promise<void> {
        const cTipoRol = data.cTipoRol ?? "UNIVERSIDAD";
        if (cTipoRol !== "UNIVERSIDAD" && cTipoRol !== "SISTEMA") {
            throw new appError("Tipo de permiso inválido", "INVALID_FIELD", "cTipoRol must be UNIVERSIDAD or SISTEMA", true);
        }

        const permiso = new entPermiso(
            null, 
            data.cNombrePermiso!, 
            data.cAbrevPermiso || null, 
            data.lActivo ?? true, 
            data.lVigente ?? true,
            cTipoRol
        );

        await this._repo.createPermission(permiso);
    }
}
