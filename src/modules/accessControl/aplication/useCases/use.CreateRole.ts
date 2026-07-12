import { portAccessControlRepository } from "../../domain/repositories/port.AccessControl.Repository";
import { entRol } from "../../domain/entities/ent.Rol";

export class useCreateRole {
    constructor(private readonly _repo: portAccessControlRepository) {}

    public async execute(data: Partial<entRol>): Promise<void> {
        const rol = new entRol(
            null, 
            data.cNombreRol!, 
            data.cAbrevRol || null, 
            data.lActivo ?? true, 
            data.lVigente ?? true
        );

        await this._repo.createRole(rol);
    }
}
