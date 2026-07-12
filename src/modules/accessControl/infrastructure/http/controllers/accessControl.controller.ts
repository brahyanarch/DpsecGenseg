import { Request, Response, NextFunction } from "express";
import { repoAccessControlPrisma } from "../../repositories/repo.AccessControl.Prisma";
import { useCreateRole } from "../../../aplication/useCases/use.CreateRole";
import { useCreatePermission } from "../../../aplication/useCases/use.CreatePermission";

export class AccessControlController {

    private readonly _createRoleUseCase: useCreateRole;
    private readonly _createPermissionUseCase: useCreatePermission;

    constructor() {
        const repo = new repoAccessControlPrisma();
        this._createRoleUseCase = new useCreateRole(repo);
        this._createPermissionUseCase = new useCreatePermission(repo);
    }

    public createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = req.body;
            await this._createRoleUseCase.execute(data);
            res.status(201).json({ nSuccess: true, cMessage: "Rol creado y asociado a todos los permisos vigentes correctamente" });
        } catch (error) {
            next(error);
        }
    };

    public createPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = req.body;
            await this._createPermissionUseCase.execute(data);
            res.status(201).json({ nSuccess: true, cMessage: "Permiso creado y asociado a todos los roles vigentes correctamente" });
        } catch (error) {
            next(error);
        }
    };
}
