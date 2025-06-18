import { Request, Response, NextFunction } from "express";
import {comparePassword, hashPassword} from '../services/password.service' 
import { PrismaClient } from "@prisma/client";
import { generateToken, verifyToken} from "../services/auth.service";
import {User} from "../models/interface/user.interface"

const prisma = new PrismaClient();

/* REGISTRO DEl SISTEMA */
export const register = async (req: Request, res: Response): Promise<void> => {
    const {usuario, password} = req.body;
    try {
        const existuser = await prisma.user.findUnique({
            where: {
                usuario: usuario
            }
        });

        if(existuser)
        {
            res.status(409).json({message:"el usuario ya existe"});
            return;
        }
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create(
            {
                data: {
                    usuario,
                    password: hashedPassword
                }
            }
        )

        // Generarmos el token
        //const token = generateToken(user)
        res.status(201).json({message:"Usuario registrado correctamente"});
        return;
    } catch (error: any) {
        // TODO para manejar los errores

        // VALIDAR EL USUARIO
        if(!usuario){
            res.status(400).json({
                message: 'El uusario es obligatorio'
            })
            return;
        }
        
        //VALIDAR EL PASSWORD
        if(!password){
            res.status(400).json({
                message: 'La contrasenia es obligaroria'
            })
            return;
        }

        // VALIDAR DUPLICIDAD
        if(error?.code === 'P2002' && error?.meta?.target?.includes('usuario')){
            res.status(500).json({
                message: 'El usuario ya existe'
            })
            return;
        }

        //Mejorar los errores 
        console.log(error);
        res.status(500).json({
            error: 'Hubo un error en el registro'
        })
        return;
    }
}



/* LOGIN DEl SISTEMA */
export const login = async(req: Request, res: Response): Promise<void> => {
    const {email, password} = req.body;
    
    try {

        const user = await prisma.user.findUnique({where: {usuario:email}})
        
        // Comprobamos si el usuario existe
        if(!user){
            res.status(404).json({error: 'Usuario incorrecto'});
            return;
        }
        // Verificar si el usuario está bloqueado temporalmente
        const blockDuration = 15 * 60 * 1000; // 15 minutos
        if (user.failedAttempts >= 5 && user.lastFailedAttempt && 
            (Date.now() - new Date(user.lastFailedAttempt).getTime()) < blockDuration) {
            res.status(429).json({ message: 'Cuenta bloqueada temporalmente. Inténtalo de nuevo más tarde.' });
            return;
        }
        // Comparamos las password
        const passwordMatch = await comparePassword(password, user.password);
        if(!passwordMatch){
            // Incrementar el contador de intentos fallidos
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: user.failedAttempts + 1,
                    lastFailedAttempt: new Date(),
                },
            });

            res.status(401).json({ message: 'Contraseña incorrecta' });
            return;
        }
        // Restablecer el contador de intentos fallidos
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                lastFailedAttempt: null,
            },
        });

        const token = generateToken(user)
        res.status(201).json({message: 'Usuario logeado exitosamente.',admin: true, token})
        return;
        
    } catch (error: any) {
        console.log('Error: ' + error)
    }
}

export const Authenticate = async(req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Acceso no autorizado' });
        return;
    }

    try {
        const decoded:Omit<User, "password"> = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: {
                usuario: decoded.usuario
            }
        });

        req.user = user as User; // Adjunta el usuario decodificado a la solicitud

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};


export const Me = async(req: Request, res: Response): Promise<void> => {

    try {

        // VALIDAR EL USUARIO
        if(!req.user){
            res.status(400).json({
                message: 'El uusario es obligatorio'
            })
            return;
        }
        
        const user = await prisma.user.findUnique({where: {usuario: req.user.usuario}, select : {usuario: true, id: true}});
        
        // Comprobamos si el usuario existe
        if(!user){
            res.status(404).json({error: 'Usuario no encontrado'});
            return;
        }

        res.status(201).json(user);
        return;
    } catch (error: any) {
        console.log('Error: ' + error)
        return;
    }
}

