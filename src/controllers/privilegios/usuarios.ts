import { Request, Response } from "express";
//import bcrypt from 'bcryptjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient, Usuario } from "@prisma/client";
import { emit } from "process";

const prisma = new PrismaClient();
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || 'secret';  // Define una secret llave secreta para el token 

/*---------- METODO LOGIN -------*/
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body; // Desestructurar usuario y contraseña

  try {
    if (!email || !password) {
      res.status(400).json({
        message: "El email y la contraseña son obligatorios",
      });
      return;
    }

    // Buscar el usuario por nombre de usuario (n_usu)
    const existingUser = await prisma.usuario.findFirst({where: { email: email },});

    
    // si no existe el usuario buscamos en la tabla user que sond de administrador general
    if (!existingUser) {
      const user = await prisma.user.findUnique({where: {usuario: email}});
      if(!user){
        res.status(404).json({error: 'Usuario no encontrado'});
        return;
      }
      // Comparamos las password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if(!passwordMatch){
        res.status(401).json({error: 'Usuario y contrasenias no coinciden'});
        return;
      }
      
      if(passwordMatch)
        {
          const token = jwt.sign({ idAdmin: user.id },SECRET_KEY,{ expiresIn: '1h' });   
          res.status(200).json({message: 'admin',admin: true, token, user});
          return;
        }
    }
    else{
      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      
      if (!isPasswordValid) {res.status(401).json({message: "Credenciales incorrectas",});return;}

      const users = await prisma.usuario.findMany({where: { email: email, estado: true }, 
        select: {
          dni: true,
          nombre: true,
          AMaterno: true,
          APaterno: true,
          email: true,
          rol_id: true,
          subunidad_id_subuni: true,
          rol: {select: { id_rol:true, n_rol: true}},
          sub_uni: {select: {id_subuni:true, n_subuni: true}},
        }
      });
      
      // Generar un token
      if (!users) {
        res.status(404).json({message: "Usuario no encontrado"});return;
      }
      res.status(200).json({message: "user",admin: false,users});
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al iniciar sesión",
    });
  }
};

export const loginUniqueUser = async (req: Request, res: Response): Promise<void> => {
  const {dni,email,rol_id,subunidad_id_subuni} = req.body;
  try {
    if (!dni || !email || !rol_id || !subunidad_id_subuni) {
      res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
      return;
    }
    // Buscar el usuario por nombre de usuario (n_usu)
    const existingUser = await prisma.usuario.findFirst({where: { dni, email: email, rol_id, subunidad_id_subuni,estado:true },});

      if(!existingUser){
        res.status(404).json({error: 'Usuario no encontrado'});
        return;
      }

      const token = jwt.sign({ dni: existingUser.dni, email: existingUser.email, rol_id: rol_id,subunidad: subunidad_id_subuni  },SECRET_KEY,{ expiresIn: "1h" });
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
    const { dni, email, nombre, aPaterno, aMaterno, password, rol_id, id_sub, idpe } = req.body;

  try {
    if(!dni || !nombre || !aMaterno || !aPaterno || !password || !rol_id || !id_sub || !email ){
      res.status(400).json({ message: "Todos los campos son obligatorios." });
      return;
    }

    // Verificar si el usuario con la misma combinación de dni, rol_id, id_sub ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: {
        dni_rol_id_subunidad_id_subuni: {
          dni: dni,
          rol_id: Number(rol_id),
          subunidad_id_subuni: Number(id_sub),

        },
      },
    });
    
    if (existingUser) {
      res.status(400).json({ message: "El usuario con este rol y subunidad ya existe." });
      return;
    }

    const dniUser = await prisma.usuario.findFirst({
      where: {
        dni: dni,
      },
    });

    if (dniUser) {
      const newUser = await prisma.usuario.create({
        data: {
          dni: dniUser.dni,
          nombre: dniUser.nombre,
          APaterno: dniUser.APaterno,
          AMaterno: dniUser.AMaterno,
          password: dniUser.password,
          email: dniUser.email,
          rol_id: Number(rol_id),
          subunidad_id_subuni: Number(id_sub),
          estado: true,
          idpe: dniUser.idpe,
        },
      });
      res
        .status(201)
        .json({ message: "Usuario creado correctamente.", newUser });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      // Crear el nuevo usuario
      const newUser = await prisma.usuario.create({
        data: {
          idpe: Number(idpe),
          dni: dni,
          email: email,
          nombre: nombre,
          APaterno: aPaterno,
          AMaterno: aMaterno,
          password: hashedPassword,
          rol_id: Number(rol_id),
          subunidad_id_subuni: Number(id_sub),
          estado: true,
        },
      });
      res.status(201).json({ message: "Usuario creado correctamente.", newUser });
      return;
    }
  } catch (error) {
    //console.error(error);
    res.status(500).json({ message: "Error al crear el usuario.", error });
    return;
  } finally {
    await prisma.$disconnect();
  }
};

export const AllUser = async (req: Request, res: Response): Promise<void> => {

  try {
    // Usamos Prisma para obtener todos los usuarios con sus roles y permisos
    const users = await prisma.usuario.findMany({
      include: {
        rol: {},
        sub_uni: true, // Trae la subunidad asociada al usuario
      },
    });

    // Retornamos los usuarios con las relaciones
    res.json(users);
  } catch (error) {
    // Si hay un error, lo manejamos
    console.error(error);
    res.status(500).json({ error: "Algo salió mal al obtener los usuarios." });
  }
};

export const getUserwithDNI = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { dni } = req.params;
    const getRoles = await prisma.usuario.findFirst({
      where: { dni: dni, estado: true },
    });

    res.status(200).json(getRoles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los roles" });
  }
};


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


export const getUser = async (req: Request, res: Response): Promise<void> => {

  const user = req.user as any;

  try {
    // Usamos Prisma para obtener todos los usuarios con sus roles y permisos
    const users = await prisma.usuario.findFirst({
      where: { dni: user.dni, email: user.email, rol_id: user.rol_id, subunidad_id_subuni:user.subunidad_id_subuni, estado:true },
      
    }); 
    if (!users) {
      res.status(404).json({ message: 'Usuario no encontrado', access: false });
    }
    // Retornamos los usuarios con las relaciones
    res.status(200).json({users, access: true});

  } catch (error) {
    // Si hay un error, lo manejamos
    console.error(error);
    res.status(500).json({ error: "No tienes los privilegios." });
  }
};

/*export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { dni, nombre, aPaterno, aMaterno } = req.body;

  if (!dni || !nombre || !aPaterno || !aMaterno) {
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
  } finally {
    await prisma.$disconnect();
  }
};*/

/* 

  {
  "dni": "74652485",
  "usuario  ": "ssss",
  "password": "root",
  "rol_id": 1,
  "id_sub": 1
}
  */
