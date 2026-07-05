// src/modules/user/infrastructure/http/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { repoUserPrisma } from "../../repositories/repo.User.Prisma";
import { useLogin } from "../../../aplication/useCases/auth/use.Login";
import { useRegister } from "../../../aplication/useCases/auth/use.Register";
import { useAssignRole } from "../../../aplication/useCases/auth/use.AssignRole";
import { AssignRoleDTO } from "../dto/dto.AssignRole";

export class AuthController {
    // Declaramos los casos de uso como propiedades privadas
    private readonly _loginUseCase: useLogin;
    private readonly _registerUseCase: useRegister;
    private readonly _assignRoleUseCase: useAssignRole;

    constructor() {
        // Centralizamos la creación de dependencias aquí
        const userRepo = new repoUserPrisma();
        this._loginUseCase = new useLogin(userRepo);
        this._registerUseCase = new useRegister(userRepo);
        this._assignRoleUseCase = new useAssignRole(userRepo);
    }

    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { cEmail, cPassword, idActiveProfile } = req.body;
            const result = await this._loginUseCase.execute(cEmail, cPassword, idActiveProfile);

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
}