// src/infrastructure/http/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { repoUserPrisma } from "../../repositories/repo.User.Prisma"; // Adaptador real
import { useLogin } from "../../../aplication/useCases/auth/use.Login"; // Caso de uso
import { useRegister } from "../../../aplication/useCases/auth/use.Register";

const userRepo = new repoUserPrisma();
const loginUseCase = new useLogin(userRepo);
const registerUseCase = new useRegister(userRepo);

/**
 * Controlador para manejar el login de usuarios
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { cEmail, cPassword } = req.body;

        // 1. Llamada al Caso de Uso (La lógica de negocio)
        const result = await loginUseCase.execute(cEmail, cPassword);

        // 2. Respuesta exitosa
        res.status(200).json({
            nSuccess: true,
            data: result
        });
    } catch (error) {
        // Esto captura los 'appError' que lanzamos en el caso de uso o servicios
        next(error);
    }
};


export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {
        const { cEmail, cPassword, cNombre } = req.body;
        console.log("Datos recibidos en el controlador:", { cEmail, cPassword, cNombre });
        const result = await registerUseCase.execute(cEmail, cPassword, cNombre);
        res.status(201).json({ nSuccess: true, data: result });
    } catch (error) {
        next(error);
    }
};