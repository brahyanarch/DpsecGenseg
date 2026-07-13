import { Request, Response, NextFunction } from "express";
import { repoAccessControlPrisma } from "../../repositories/repo.AccessControl.Prisma";
import { useCreateRole } from "../../../aplication/useCases/use.CreateRole";
import { useCreatePermission } from "../../../aplication/useCases/use.CreatePermission";
import { useGetRoles } from "../../../aplication/useCases/use.GetRoles";
import { appError } from "../../../../user/domain/exceptions/app.Error";

export class AccessControlController {
    private readonly _createRoleUseCase: useCreateRole;
    private readonly _createPermissionUseCase: useCreatePermission;
    private readonly _getRolesUseCase: useGetRoles;

    constructor() {
        const repo = new repoAccessControlPrisma();
        this._createRoleUseCase = new useCreateRole(repo);
        this._createPermissionUseCase = new useCreatePermission(repo);
        this._getRolesUseCase = new useGetRoles(repo);
    }

    public getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const securityContext = (req as any).securityContext;

            if (!securityContext) {
                throw new appError("50001", "Contexto de seguridad no resuelto", "Security context missing", true);
            }

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await this._getRolesUseCase.execute(securityContext, page, limit);

            res.status(200).json({ 
                nSuccess: true, 
                data: {
                    roles: result.roles,
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

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
