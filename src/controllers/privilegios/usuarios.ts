import { Request, Response, NextFunction} from "express";
//import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";
import { emit } from "process";
import { hashPassword, comparePassword} from '../../services/password.service';
import { generateTokenUsuario, verifyTokenUsuario} from '../../services/auth.service';
import { enviarCorreo} from '../../services/email.service';
import { HoraLima} from '../../services/horaLima.service';
import { login} from '../authController'
import { Usuario, DataUsuario } from "../../models/interface/user.interface";

const prisma = new PrismaClient();
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'secret';  // Define una secret llave secreta para el token 

/*---------- METODO LOGIN -------*/
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body; // Desestructurar usuario y contraseña

  try {

    // Buscar el usuario por nombre de usuario (n_usu)
    const existingDataUser = await prisma.datosUsuario.findUnique({where: { email: email },});

    
    // si no existe el usuario buscamos en la tabla user que sond de administrador general
    if (!existingDataUser) {
      login(req, res);
    }
    else{
      // Verificar si el usuario está bloqueado temporalmente
      const blockDuration = 15 * 60 * 1000; // 15 minutos
      if (existingDataUser.failedAttempts >= 5 && existingDataUser.lastFailedAttempt && 
          (Date.now() - new Date(existingDataUser.lastFailedAttempt).getTime()) < blockDuration) {
          res.status(429).json({ message: 'Cuenta bloqueada temporalmente. Inténtalo de nuevo más tarde.' });
          return;
      }

      // Comparamos las password
      const isPasswordValid = await comparePassword(password, existingDataUser.password);
      if (!isPasswordValid) {
        // Incrementar el contador de intentos fallidos
        await prisma.datosUsuario.update({
          where: { iddatauser: existingDataUser.iddatauser },
          data: {
              failedAttempts: existingDataUser.failedAttempts + 1,
              lastFailedAttempt: new Date(),
          },
        });
        res.status(401).json({message: "Contraseña incorrectas",});
        return;
      }

      const users = await prisma.usuario.findMany({where: { iddatauser: existingDataUser.iddatauser, estado: true }, 
        select: {
          iddatauser: true,
          roles: {select: {  n_rol: true, id_rol: true}},
          subunidad: {select: { n_subuni: true, id_subuni: true}},
        }
      });
      // Restablecer el contador de intentos fallidos
      await prisma.datosUsuario.update({
        where: { iddatauser: existingDataUser.iddatauser },
        data: {
            failedAttempts: 0,
            lastFailedAttempt: null,
        },
      });
      
      // Generar un token
      if (!users) {
        res.status(404).json({message: "No se asigno nigun rol en niguna sub unidad."});return;
      }

      res.status(200).json({message: "Escoga el rol y sub unidad asignados.", admin: false, users});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};

export const loginUniqueUser = async (req: Request, res: Response): Promise<void> => {
  const {iddatausuario, idrol, idsubunidad} = req.body;
  try {

    // Buscar el usuario por nombre de usuario (n_usu)
    const existingUser = await prisma.usuario.findFirst({where: { iddatauser: Number(iddatausuario), idrol: Number(idrol), idsubunidad: Number(idsubunidad), estado:true },});

    if(!existingUser){
      res.status(404).json({error: 'Usuario no encontrado'});
      return;
    }

    const token = generateTokenUsuario(existingUser);
    res.status(200).json({message: "user",admin: false, token});
    return;
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};




/*---------- CREAR USUARIO -------*/
export const createUser = async (req: Request, res: Response): Promise<void> => {
    const { dni, email, nombre, aPaterno, aMaterno, idpe } = req.body;
  
  try {
    let programa = null;
    if (idpe) {
      const programaEst = await prisma.prgEstudio.findUnique({ where: { idpe } });
      if (!programaEst) {
          res.status(400).json({ message: "El programa de estudio no existe." });
          return;
      }
      programa = idpe;
    }
    // Verificar si el usuario ya existe (por dni o email)
    const existingUser = await prisma.datosUsuario.findFirst({
      where: {
          OR: [
              { dni },
              { email }
          ]
      }
  });
    
    if (existingUser) {
      res.status(400).json({ message: "El usuario ya existe " });
      return;
    }
    
    const hashedPassword = await hashPassword(req.body.password);

    const newDataUser = await prisma.datosUsuario.create({
      data: {
        dni: dni,
        email: email,
        nombre: nombre,
        APaterno: aPaterno,
        AMaterno: aMaterno,
        password: hashedPassword,
        idpe: programa, 
        createdAt: HoraLima(),
        updatedAt: HoraLima()
      }
    });
    // Excluir la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = newDataUser;
    enviarCorreo(email, req.body.password);
    // Respuesta exitosa
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ message: "Error al crear el usuario.", error });
    return;
  } 
};

export const AsignateRolSubunidad = async (req: Request, res:Response): Promise<void> => {
    const {idrol, idsubunidad, iddatausuario} = req.body;
    req.body.iddatausuario = Number(iddatausuario);
    try {
      const rol = await prisma.rol.findUnique({where:{id_rol: Number(idrol)}});
      if(!rol){
        res.status(401).json({message: 'El rol no existe'});
        return;
      }
      const subunidad = await prisma.sub_unidad.findUnique({where:{id_subuni: idsubunidad}});
      if(!subunidad){
        res.status(401).json({message: 'La sub unidad no existe'});
        return;
      }
      const dataUser = await prisma.datosUsuario.findUnique({where:{iddatauser:iddatausuario}});
      if(!dataUser){
        res.status(401).json({message: 'El usuario no existe'});
        return;
      }
      
      const newUserAsigned = await prisma.usuario.create({
        data: {
          iddatauser: Number(iddatausuario),
          idrol: Number(idrol),
          idsubunidad: Number(idsubunidad),
          createdAt: HoraLima(),
          updatedAt: HoraLima()
        }
      })
      
      res.status(200).json({message: 'usuario asignado correctamente', newUserAsigned});
    } catch (error:any) {
      
      if (error?.code === 'P2002' && error?.meta?.target?.includes('Usuario_iddatauser_idrol_idsubunidad_key')) {
        res.status(400).json({ message: 'El usuario ya tiene asignado este rol en la misma subunidad' });
        return;
      }
      res.status(500).json({message: 'Error al asignar el usuario', error});
      return;
    }
} 


export const AuthenticateUsuario = async(req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
      res.status(401).json({ message: 'Acceso no autorizado' });
      return;
  }

  try {
      const decoded:Omit<Usuario, "iddatauser" | "idrol" | "idsubunidad"> = verifyTokenUsuario(token);
      const usuario = await prisma.usuario.findUnique({
          where: {
              iduser: Number(decoded.iduser),
              estado: true
          },
          include: {
            subunidad: {select: { id_subuni: true, n_subuni: true}},
            roles: {select: { id_rol:true, n_rol: true}}
          }
      });
      
      if (!usuario) {
          res.status(401).json({ message: 'Usuario no encontrado' });
          return;
      }
      req.usuario = usuario as Usuario; // Adjunta el usuario decodificado a la solicitud

      next();
  } catch (error) {
      res.status(401).json({ message: 'Token inválido o expirado' });
      return;
  }
};

/*---------- OBTENER ROLES -------*/
/*
export const AllUser = async (req: Request, res: Response): Promise<void> => {

  try {
    // Usamos Prisma para obtener todos los usuarios con sus roles y permisos
    const users = await prisma.usuario.findMany({
      where: { estado: true },
      select: {
        dni: true,
        iddatauser: true,
        roles: { select: { n_rol: true } },
        subunidad: { select: { n_subuni: true } },
      },
    });

    // Retornamos los usuarios con las relaciones
    res.json(users);
  } catch (error) {
    // Si hay un error, lo manejamos
    console.error(error);
    res.status(500).json({ error: "Algo salió mal al obtener los usuarios." });
  }
};*/

export const getAllRolesToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if(!req.usuario){
      res.status(401).json({message: 'Usuario no encontrado'});
      return;
    }
    const usuario = req.usuario as Usuario;
    console.log(usuario);
    const roles = await prisma.usuario.findMany({
      where: { iddatauser: Number(usuario.iddatauser), estado: true },
      select: {
        iduser: true,
        roles: { select: { n_rol: true, id_rol: true } },
        subunidad: { select: { n_subuni: true, id_subuni: true } },
      },
    });
    if(!roles){
      res.status(404).json({message: 'No se asigno nigun rol en niguna sub unidad.'});
      return;
    }
    res.status(200).json({ usuario, roles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los roles" });
  }
};

/*---------- TOGGLE USER STATE -------*/
/*
export const toggleUserState = async (req: Request, res: Response): Promise<void> => {
  const { dni, rol_id, subunidad_id_subuni, estado } = req.body; // Desestructurar todos los campos necesarios.

  // Validar datos básicos
  if (!dni || rol_id === undefined || subunidad_id_subuni === undefined || estado === undefined) {
    res.status(400).json({ message: 'Parámetros incompletos: dni, rol_id, subunidad_id_subuni o estado faltan.' });
    return;
  }

  try {
    // Verificar si el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: {
        dni_rol_id_subunidad_id_subuni: { // Prisma utiliza este formato para claves primarias compuestas
          dni,
          rol_id,
          subunidad_id_subuni,
        },
      },
    });

    if (!existingUser) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // Actualizar el estado del usuario
    const updatedUser = await prisma.usuario.update({
      where: {
        dni_rol_id_subunidad_id_subuni: {
          dni,
          rol_id,
          subunidad_id_subuni,
        },
      },
      data: { estado },
    });

    // Responder con los datos actualizados
    res.status(200).json({
      message: 'Estado del usuario actualizado correctamente.',
      updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar el estado del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
*/

export const getUser = async (req: Request, res: Response): Promise<void> => {

  const usuario = req.usuario as Usuario;

  try {
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado', access: false });
      return;
    }
    const dataUser = await prisma.datosUsuario.findUnique({
      where: {
        iddatauser: Number(usuario.iddatauser)
      },
      select: {
        dni: true,  
        email: true,
        nombre: true,
        APaterno: true,
        AMaterno: true,
        idpe: true,
        prgest: {select: {nmPE: true, idpe: true}},
      },
    });
    // Retornamos los usuarios con las relaciones
    if (!dataUser) {
      res.status(404).json({ message: 'Datos del usuario no encontrado', access: false });
      return;
    }
    req.datausuario = dataUser as DataUsuario;
    res.status(200).json({usuario, dataUser, access: true});

  } catch (error) {
    // Si hay un error, lo manejamos
    console.error(error);
    res.status(500).json({ error: "No tienes los privilegios." });
    return;
  }
};

/*export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { dni, nombre, aPaterno, aMaterno } = req.body;

  if !(dni || !nombre || !aPaterno || !aMaterno) {
    res.status(400).json({ message: "Todos los campos son obligatorios." });
    return;
  }

  try {
    const existingUser = await prisma.usuario.findFirst({
      where: { dni },
    });

    if (!existingUser) {
      res.status(404).json({ message: "Usuario no encontrado." });
      return;
    }

    const updatedUser = await prisma.usuario.update({
      where: { dni },
      data: {
        nombre,
        APaterno: aPaterno,
        AMaterno: aMaterno,
      },
    });

    res.status(200).json({ message: "Usuario actualizado correctamente.", updatedUser });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  } 
};*/



export const AllUserBySubUnidad = async (req: Request, res: Response): Promise<void> => {
  const date = HoraLima();
  console.log(date);
  // verificar mediante el token si existe el usuario
  if(!req.usuario){
    res.status(400).json({message: "el usuario no a sido registrado"});
    return;
  }

  try {
    // Usamos Prisma para obtener todos los usuarios con sus roles y permisos
    const users = await prisma.usuario.findMany({
      where: {
        idsubunidad: Number(req.usuario.idsubunidad)
      },
      select: {
        
        iduser:true,
        datausuario: {
          select: {
            APaterno: true,
            AMaterno: true,
            nombre: true,
            dni: true,
            iddatauser: true,

          }
        },
        iddatauser: false,
        estado: true,

        roles: { select: { n_rol: true, id_rol: true } },
        subunidad: { select: { n_subuni: true, id_subuni: true } },
        createdAt: true,
        updatedAt: true,  
      },

      orderBy: {
        iduser: "asc"
      }
    });

    // Retornamos los usuarios con las relaciones
    res.json({users:users});
  } catch (error) {
    // Si hay un error, lo manejamos
    console.error(error);
    res.status(500).json({ error: "Algo salió mal al obtener los usuarios." });
  }
};