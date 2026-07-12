import { portAccessControlRepository } from "../../domain/repositories/port.AccessControl.Repository";
import { entPermiso } from "../../domain/entities/ent.Permiso";

export class useCreatePermission {
    constructor(private readonly _repo: portAccessControlRepository) {}

    public async execute(data: Partial<entPermiso>): Promise<void> {
        const permiso = new entPermiso(
            null, 
            data.cNombrePermiso!, 
            data.cAbrevPermiso || null, 
            data.lActivo ?? true, 
            data.lVigente ?? true
        );

        await this._repo.createPermission(permiso);
    }
}
