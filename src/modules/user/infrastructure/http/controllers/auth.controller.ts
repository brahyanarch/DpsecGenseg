// src/modules/user/infrastructure/http/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { repoUserPrisma } from "../../repositories/repo.User.Prisma";
import { useLogin } from "../../../aplication/useCases/auth/use.Login";
import { useRegister } from "../../../aplication/useCases/auth/use.Register";
import { useAssignRole } from "../../../aplication/useCases/auth/use.AssignRole";
import { useUpdateUserStatus } from "../../../aplication/useCases/auth/use.UpdateUserStatus";
import { useUpdateProfileStatus } from "../../../aplication/useCases/auth/use.UpdateProfileStatus";
import { useSoftDeleteUser } from "../../../aplication/useCases/auth/use.SoftDeleteUser";
import { useSoftDeleteProfile } from "../../../aplication/useCases/auth/use.SoftDeleteProfile";
import { useGetMe } from "../../../aplication/useCases/auth/use.GetMe";
import { useSwitchProfile } from "../../../aplication/useCases/auth/use.SwitchProfile";
import { useGetUsers } from "../../../aplication/useCases/use.GetUsers";
import { UserMapper } from "../../mappers/User.Mapper";
import { UserFilter } from "../../../../../shared/types/user-filter";
import { AssignRoleDTO } from "../dto/dto.AssignRole";

import { appError } from "../../../domain/exceptions/app.Error";

export class AuthController {
    // Declaramos los casos de uso como propiedades privadas
    private readonly _loginUseCase: useLogin;
    private readonly _registerUseCase: useRegister;
    private readonly _assignRoleUseCase: useAssignRole;
    private readonly _updateUserStatusUseCase: useUpdateUserStatus;
    private readonly _updateProfileStatusUseCase: useUpdateProfileStatus;
    private readonly _softDeleteUserUseCase: useSoftDeleteUser;
    private readonly _softDeleteProfileUseCase: useSoftDeleteProfile;
    private readonly _getMeUseCase: useGetMe;
    private readonly _switchProfileUseCase: useSwitchProfile;
    private readonly _getUsersUseCase: useGetUsers;

    constructor() {
        // Centralizamos la creación de dependencias aquí
        const userRepo = new repoUserPrisma();
        this._loginUseCase = new useLogin(userRepo);
        this._registerUseCase = new useRegister(userRepo);
        this._assignRoleUseCase = new useAssignRole(userRepo);
        this._updateUserStatusUseCase = new useUpdateUserStatus(userRepo);
        this._updateProfileStatusUseCase = new useUpdateProfileStatus(userRepo);
        this._softDeleteUserUseCase = new useSoftDeleteUser(userRepo);
        this._softDeleteProfileUseCase = new useSoftDeleteProfile(userRepo);
        this._getMeUseCase = new useGetMe(userRepo);
        this._switchProfileUseCase = new useSwitchProfile(userRepo);
        this._getUsersUseCase = new useGetUsers(userRepo);
    }

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { cEmail, cPassword, idActiveProfile } = req.body;
            const result = await this._loginUseCase.execute(cEmail, cPassword, idActiveProfile);

            console.log("Resultado del login:", result);
            res.status(200).json({ nSuccess: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { cEmail, cPassword, cNombre } = req.body;
            console.log("Datos recibidos para registro:", { cEmail, cPassword, cNombre });
            const result = await this._registerUseCase.execute(cEmail, cPassword, cNombre);

            res.status(201).json({ nSuccess: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    public assignRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: AssignRoleDTO = req.body;
            await this._assignRoleUseCase.execute(data);

            res.status(201).json({ nSuccess: true, cMessage: "Rol asignado correctamente" });
        } catch (error) {
            next(error);
        }
    };

    public updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idUser = Number(req.params.idUser);
            const { lActivo } = req.body;

            await this._updateUserStatusUseCase.execute(idUser, lActivo);

            res.status(200).json({ nSuccess: true, cMessage: "Estado del usuario actualizado correctamente" });
        } catch (error) {
            next(error);
        }
    };

    public updateProfileStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idUsuarioUni = Number(req.params.idUsuarioUni);
            const { lActivo } = req.body;
            
            console.log(`[DEBUG] updateProfileStatus - Request: idUsuarioUni=${idUsuarioUni}, lActivo=${lActivo}`);

            await this._updateProfileStatusUseCase.execute(idUsuarioUni, lActivo);

            console.log(`[DEBUG] updateProfileStatus - Success: profile ${idUsuarioUni} set to lActivo=${lActivo}`);
            res.status(200).json({ nSuccess: true, cMessage: "Estado del perfil actualizado correctamente" });
        } catch (error) {
            console.error(`[DEBUG] updateProfileStatus - Error:`, error);
            next(error);
        }
    };

    public softDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idUser = Number(req.params.idUser);

            await this._softDeleteUserUseCase.execute(idUser);

            res.status(200).json({ nSuccess: true, cMessage: "Usuario eliminado correctamente" });
        } catch (error) {
            next(error);
        }
    };

    public softDeleteProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idUsuarioUni = Number(req.params.idUsuarioUni);

            await this._softDeleteProfileUseCase.execute(idUsuarioUni);

            res.status(200).json({ nSuccess: true, cMessage: "Perfil eliminado correctamente" });
        } catch (error) {
            next(error);
        }
    };

    public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idUser = Number(req.user?.nId);

            if (!idUser) {
                throw new appError("40101", "Usuario no autenticado", "User not authenticated", true);
            }

            const result = await this._getMeUseCase.execute(idUser);

            res.status(200).json({ nSuccess: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    public getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const securityContext = (req as any).securityContext;

            if (!securityContext) {
                throw new appError("50001", "Contexto de seguridad no resuelto", "Security context missing", true);
            }

            // Parámetros de filtros y paginación desde el query string
            const filter: UserFilter = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                search: req.query.search as string,
                lActivo: req.query.lActivo ? req.query.lActivo === 'true' : undefined,
                sortBy: req.query.sortBy as string,
                sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
            };

            const result = await this._getUsersUseCase.execute(securityContext, filter);
            
            // Mapeamos la lista de usuarios para enviar la respuesta limpia
            const usersResponse = result.users.map(user => UserMapper.toResponse(user));

            res.status(200).json({ 
                nSuccess: true, 
                data: {
                    users: usersResponse,
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };


    public switchProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idUser = Number(req.user?.nId);
            const { idActiveProfile } = req.body;

            if (!idUser) {
                throw new appError("40101", "Usuario no autenticado", "User not authenticated", true);
            }

            if (!idActiveProfile) {
                throw new appError("40001", "El idActiveProfile es requerido", "idActiveProfile is required", true);
            }

            const result = await this._switchProfileUseCase.execute(idUser, Number(idActiveProfile));

            res.status(200).json({ nSuccess: true, data: result });
        } catch (error) {
            next(error);
        }
    };
}
