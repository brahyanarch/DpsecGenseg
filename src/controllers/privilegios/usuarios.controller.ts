import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../../services/password.service";
import {
  generateTokenUsuario,
  verifyTokenUsuario,
} from "../../services/auth.service";
import { HoraLima } from "../../services/horaLima.service";
import { login } from "../auth.controller";
import { Usuario, DataUsuario } from "../../models/interface/user.interface";
import emailService from "../../services/email.service";
import validator from "validator";

class AuthController {
  private static prisma = new PrismaClient();

  static async sendWelcomeEmail(userEmail: string, userName: string) {
    try {
      // Sanitizar inputs
      console.log("Enviando correo de bienvenida a:", userEmail);
      const sanitizedName = validator.escape(userName);

      const subject = "¡Bienvenido a nuestra plataforma!";
      const htmlContent = `
        <html>
          <body>
            <h1>Hola ${sanitizedName}</h1>
            <p>Gracias por registrarte. Por favor establece tu contraseña:</p>
            <a href="${process.env.URL_FRONTEND_BASE}/intranet/establecer_password">
              Establecer contraseña
            </a>
          </body>
        </html>
      `;

      await emailService.sendEmail({
        subject,
        to: [{ email: userEmail, name: sanitizedName }],
        htmlContent,
      });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Considera agregar notificación a un sistema de monitoreo
    }
  }
  /*---------- METODO LOGIN -------*/
  static async loginUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const existingDataUser =
        await AuthController.prisma.datosUsuario.findUnique({
          where: { email: email },
        });

      if (!existingDataUser) {
        return login(req, res);
      }

      const blockDuration = 15 * 60 * 1000;
      if (
        existingDataUser.failedAttempts >= 5 &&
        existingDataUser.lastFailedAttempt &&
        Date.now() - new Date(existingDataUser.lastFailedAttempt).getTime() <
          blockDuration
      ) {
        res.status(429).json({
          message:
            "Cuenta bloqueada temporalmente. Inténtalo de nuevo más tarde.",
        });
        return;
      }

      const isPasswordValid = await comparePassword(
        password,
        existingDataUser.password
      );
      if (!isPasswordValid) {
        await AuthController.prisma.datosUsuario.update({
          where: { iddatauser: existingDataUser.iddatauser },
          data: {
            failedAttempts: existingDataUser.failedAttempts + 1,
            lastFailedAttempt: new Date(),
          },
        });
        res.status(401).json({ message: "Contraseña incorrecta" });
        return;
      }

      const users = await AuthController.prisma.usuario.findMany({
        where: {
          iddatauser: existingDataUser.iddatauser,
          estado: true,
        },
        select: {
          iddatauser: true,
          roles: { select: { n_rol: true, id_rol: true } },
          subunidad: { select: { n_subuni: true, id_subuni: true } },
        },
      });

      await AuthController.prisma.datosUsuario.update({
        where: { iddatauser: existingDataUser.iddatauser },
        data: {
          failedAttempts: 0,
          lastFailedAttempt: null,
        },
      });

      if (!users || users.length === 0) {
        res
          .status(404)
          .json({ message: "No se asignó ningún rol en ninguna sub unidad." });
        return;
      }

      res.status(200).json({
        message: "Escoja el rol y subunidad asignados.",
        admin: false,
        users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  }

  static async loginUniqueUser(req: Request, res: Response): Promise<void> {
    const { iddatausuario, idrol, idsubunidad } = req.body;

    try {
      const existingUser = await AuthController.prisma.usuario.findFirst({
        where: {
          iddatauser: Number(iddatausuario),
          idrol: Number(idrol),
          idsubunidad: Number(idsubunidad),
          estado: true,
        },
      });

      if (!existingUser) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      const token = generateTokenUsuario(existingUser);
      res.status(200).json({
        message: "user",
        admin: false,
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  }

  /*---------- CREAR USUARIO -------*/
  static async createUser(req: Request, res: Response): Promise<void> {
    const { dni, email, nombre, aPaterno, aMaterno, idpe } = req.body;

    try {
      let programa = null;
      if (idpe) {
        const programaEst = await AuthController.prisma.prgEstudio.findUnique({
          where: { idpe },
        });
        if (!programaEst) {
          res.status(400).json({
            message: "El programa de estudio no existe.",
          });
          return;
        }
        programa = idpe;
      }

      const existingUser = await AuthController.prisma.datosUsuario.findFirst({
        where: { OR: [{ dni }, { email }] },
      });

      if (existingUser) {
        res.status(400).json({ message: "El usuario ya existe" });
        return;
      }

      const hashedPassword = await hashPassword(req.body.password);
      const newDataUser = await AuthController.prisma.datosUsuario.create({
        data: {
          dni: dni,
          email: email,
          nombre: nombre,
          APaterno: aPaterno,
          AMaterno: aMaterno,
          password: hashedPassword,
          idpe: programa,
          createdAt: HoraLima(),
          updatedAt: HoraLima(),
        },
      });

      const { password: _, ...userWithoutPassword } = newDataUser;
      if (req.body.generated) {
        const sanitizedName = validator.escape(nombre);

        const subject = "¡Bienvenido a nuestra plataforma GENSEG!";
        const htmlContent = `
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantillas de Correo - Genseg</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        
        body {
            background-color: #f8f9fa;
            color: #333;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 0;
            border-bottom: 1px solid #eaeaea;
        }
        
        h1 {
            color: #1a2a6c;
            margin-bottom: 10px;
            font-size: 2rem;
            font-weight: 600;
        }
        
        .subtitle {
            color: #555;
            font-size: 1.1rem;
            margin-top: 5px;
        }
        
        .template-container {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .template {
            flex: 1;
            min-width: 300px;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            border: 1px solid #eaeaea;
        }
        
        .template-header {
            background-color: #1a2a6c;
            color: white;
            padding: 20px;
        }
        
        .template-content {
            padding: 30px;
            line-height: 1.6;
            color: #444;
        }
        
        .template-content h3 {
            color: #1a2a6c;
            margin-bottom: 20px;
            font-size: 1.3rem;
        }
        
        .template-content p {
            margin-bottom: 15px;
        }
        
        .credentials {
            background-color: #f8f9fa;
            border-left: 3px solid #1a2a6c;
            padding: 15px;
            margin: 20px 0;
            font-size: 0.95rem;
        }
        
        .btn {
            display: inline-block;
            background-color: #1a2a6c;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 15px;
            border: none;
            cursor: pointer;
            text-align: center;
            font-size: 0.95rem;
        }
        
        .instructions {
            background-color: #f0f7ff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .instructions ol {
            padding-left: 20px;
            margin-top: 10px;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            color: #666;
            margin-top: 30px;
            font-size: 0.9rem;
            border-top: 1px solid #eaeaea;
        }
        
        .highlight {
            font-weight: 600;
            color: #1a2a6c;
        }
        
        .university-info {
            margin-top: 20px;
            font-size: 0.9rem;
            color: #666;
            line-height: 1.5;
        }
        
        @media (max-width: 768px) {
            .template-container {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        
        
        <div class="template-container">
            
            
            <!-- Plantilla 2: Bienvenida con contraseña -->
            <div class="template">
                <div class="template-header">
                    <h2>Bienvenido a la plataforma GENSEG</h2>
                </div>
                <div class="template-content">
                    <h3>Su cuenta ha sido creada</h3>
                    
                    <p>Estimado/a ${sanitizedName},</p>
                    
                    <p>El administrador ha creado una cuenta para usted en <span class="highlight">Genseg</span>, la plataforma de gestión de proyectos.</p>
                    
                    <p>Sus credenciales de acceso:</p>
                    
                    <div class="credentials">
                        <p><strong>Usuario:</strong> ${email} </p>
                        <p><strong>Contraseña temporal:</strong> ${req.body.password}</p>
                        <p><strong>Acceso:</strong> https://genseg.unap.edu.pe</p>
                    </div>
                    
                    <div class="instructions">
                        <p><strong>Recomendación de seguridad:</strong></p>
                        <p>Por favor cambie su contraseña después del primer inicio de sesión:</p>
                        <ol>
                            <li>Inicie sesión con las credenciales anteriores</li>
                            <li>Acceda a su perfil</li>
                            <li>Seleccione "Cambiar contraseña"</li>
                            <li>Establezca una nueva contraseña segura</li>
                        </ol>
                    </div>
                    
                    <a href="#" class="btn">Acceder a la plataforma</a>
                    
                    <div class="university-info">
                        <p>Dirección de Proyección Social y Extensión Cultural<br>
                        Universidad Nacional del Altiplano<br>
                        Teléfono: 950 036 674 | Email: drs@unap.edu.pe</p>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
</body>
</html>
      `;

        await emailService.sendEmail({
          subject,
          to: [{ email: email, name: sanitizedName }],
          htmlContent,
        });
        console.log("Mensaje de bienvenida enviado a:", email);
      }
      const sanitizedName = validator.escape(nombre);

      const subject = "¡Bienvenido a nuestra plataforma GENSEG!";
      const htmlContent = `
        <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plantillas de Correo - Genseg</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        
        body {
            background-color: #f8f9fa;
            color: #333;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 0;
            border-bottom: 1px solid #eaeaea;
        }
        
        h1 {
            color: #1a2a6c;
            margin-bottom: 10px;
            font-size: 2rem;
            font-weight: 600;
        }
        
        .subtitle {
            color: #555;
            font-size: 1.1rem;
            margin-top: 5px;
        }
        
        .template-container {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .template {
            flex: 1;
            min-width: 300px;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            border: 1px solid #eaeaea;
        }
        
        .template-header {
            background-color: #1a2a6c;
            color: white;
            padding: 20px;
        }
        
        .template-content {
            padding: 30px;
            line-height: 1.6;
            color: #444;
        }
        
        .template-content h3 {
            color: #1a2a6c;
            margin-bottom: 20px;
            font-size: 1.3rem;
        }
        
        .template-content p {
            margin-bottom: 15px;
        }
        
        .credentials {
            background-color: #f8f9fa;
            border-left: 3px solid #1a2a6c;
            padding: 15px;
            margin: 20px 0;
            font-size: 0.95rem;
        }
        
        .btn {
            display: inline-block;
            background-color: #1a2a6c;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin-top: 15px;
            border: none;
            cursor: pointer;
            text-align: center;
            font-size: 0.95rem;
        }
        
        .instructions {
            background-color: #f0f7ff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .instructions ol {
            padding-left: 20px;
            margin-top: 10px;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            color: #666;
            margin-top: 30px;
            font-size: 0.9rem;
            border-top: 1px solid #eaeaea;
        }
        
        .highlight {
            font-weight: 600;
            color: #1a2a6c;
        }
        
        .university-info {
            margin-top: 20px;
            font-size: 0.9rem;
            color: #666;
            line-height: 1.5;
        }
        
        @media (max-width: 768px) {
            .template-container {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Plantillas de Correo Electrónico</h1>
            <p class="subtitle">Genseg - Gestor de Proyectos | Dirección de Proyección Social y Extensión Cultural</p>
            <p class="subtitle">Universidad Nacional del Altiplano</p>
        </header>
        
        <div class="template-container">
            <!-- Plantilla 1: Bienvenida simple -->
            <div class="template">
                <div class="template-header">
                    <h2>Bienvenido a nuestra plataforma GENSEG</h2>
                </div>
                <div class="template-content">
                    <h3>Bienvenido/a a Genseg</h3>
                    
                    <p>Estimado/a ${sanitizedName},</p>
                    
                    <p>Le damos la bienvenida a <span class="highlight">GENSEG</span>, la plataforma de gestión de proyectos de la Dirección de Proyección Social y Extensión Cultural.</p>
                    
                    <p>Su cuenta ha sido creada con éxito:</p>
                    
                    <div class="credentials">
                        <p><strong>Usuario:</strong> ${email} </p>
                        <p><strong>Acceso:</strong> https://genseg.unap.edu.pe</p>
                    </div>
                    
                    <p>Para iniciar sesión, utilice las credenciales que estableció durante el registro.</p>
                    
                    <p>Si necesita asistencia, nuestro equipo de soporte está disponible para ayudarle.</p>
                    
                    <a href="#" class="btn">Acceder a la plataforma</a>
                    
                    <div class="university-info">
                        <p>Dirección de Proyección Social y Extensión Cultural<br>
                        Universidad Nacional del Altiplano<br>
                        Teléfono: 950 036 674 | Email: drs@unap.edu.pe</p>
                    </div>
                </div>
            </div>
            
        </div>
        
    </div>
</body>
</html>
      `;

      await emailService.sendEmail({
        subject,
        to: [{ email: email, name: sanitizedName }],
        htmlContent,
      });
      //sendPasswordEmail(email, req.body.password).catch(error => console.error('Error enviando correo:', error));
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({
        message: "Error al crear el usuario 123.",
        error,
      });
    }
  }

  static async AsignateRolSubunidad(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idrol, idsubunidad, iddatausuario } = req.body;

    try {
      const rol = await AuthController.prisma.rol.findUnique({
        where: { id_rol: Number(idrol) },
      });
      if (!rol) {
        res.status(401).json({ message: "El rol no existe" });
        return;
      }

      const subunidad = await AuthController.prisma.sub_unidad.findUnique({
        where: { id_subuni: Number(idsubunidad) },
      });
      if (!subunidad) {
        res.status(401).json({ message: "La sub unidad no existe" });
        return;
      }

      const dataUser = await AuthController.prisma.datosUsuario.findUnique({
        where: { iddatauser: Number(iddatausuario) },
      });
      if (!dataUser) {
        res.status(401).json({ message: "El usuario no existe" });
        return;
      }

      const newUserAsigned = await AuthController.prisma.usuario.create({
        data: {
          iddatauser: Number(iddatausuario),
          idrol: Number(idrol),
          idsubunidad: Number(idsubunidad),
          createdAt: HoraLima(),
          updatedAt: HoraLima(),
        },
      });

      res.status(200).json({
        message: "Usuario asignado correctamente",
        newUserAsigned,
      });
    } catch (error: any) {
      if (
        error?.code === "P2002" &&
        error?.meta?.target?.includes(
          "Usuario_iddatauser_idrol_idsubunidad_key"
        )
      ) {
        res.status(400).json({
          message:
            "El usuario ya tiene asignado este rol en la misma subunidad",
        });
        return;
      }
      res.status(500).json({
        message: "Error al asignar el usuario",
        error,
      });
    }
  }

  static async AuthenticateUsuario(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Acceso no autorizado" });
      return;
    }

    try {
      const decoded = verifyTokenUsuario(token) as Omit<
        Usuario,
        "iddatauser" | "idrol" | "idsubunidad"
      >;
      const usuario = await AuthController.prisma.usuario.findUnique({
        where: { iduser: Number(decoded.iduser), estado: true },
        include: {
          subunidad: { select: { id_subuni: true, n_subuni: true } },
          roles: { select: { id_rol: true, n_rol: true } },
        },
      });

      if (!usuario) {
        res.status(401).json({ message: "Usuario no encontrado" });
        return;
      }

      req.usuario = usuario as Usuario;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token inválido o expirado" });
    }
  }

  static async getAllRolesToUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.usuario) {
        res.status(401).json({ message: "Usuario no encontrado" });
        return;
      }

      const usuario = req.usuario as Usuario;
      const roles = await AuthController.prisma.usuario.findMany({
        where: {
          iddatauser: Number(usuario.iddatauser),
          estado: true,
        },
        select: {
          iduser: true,
          roles: { select: { n_rol: true, id_rol: true } },
          subunidad: { select: { n_subuni: true, id_subuni: true } },
        },
      });

      if (!roles || roles.length === 0) {
        res.status(404).json({
          message: "No se asignó ningún rol en ninguna sub unidad.",
        });
        return;
      }

      res.status(200).json({ usuario, roles });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener los roles" });
    }
  }

  /*---------- TOGGLE USER STATE -------*/
  static async toggleUserState(req: Request, res: Response): Promise<void> {
    const { estado } = req.body;
    const iduser = Number(req.params.id);

    if (estado === undefined) {
      res.status(400).json({
        message: "Parámetro estado faltante.",
      });
      return;
    }

    try {
      const existingUser = await AuthController.prisma.usuario.findUnique({
        where: { iduser: iduser },
      });

      if (!existingUser) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const updatedUser = await AuthController.prisma.usuario.update({
        where: { iduser: iduser },
        data: { estado },
      });

      res.status(200).json({
        message: "Estado del usuario actualizado correctamente.",
        updatedUser,
      });
    } catch (error) {
      console.error("Error al actualizar el estado del usuario:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    const usuario = req.usuario as Usuario;

    try {
      if (!usuario) {
        res.status(404).json({
          message: "Usuario no encontrado",
          access: false,
        });
        return;
      }

      const dataUser = await AuthController.prisma.datosUsuario.findUnique({
        where: { iddatauser: Number(usuario.iddatauser) },
        select: {
          dni: true,
          email: true,
          nombre: true,
          APaterno: true,
          AMaterno: true,
          idpe: true,
          prgest: { select: { nmPE: true, idpe: true } },
        },
      });

      if (!dataUser) {
        res.status(404).json({
          message: "Datos del usuario no encontrado",
          access: false,
        });
        return;
      }

      req.datausuario = dataUser as DataUsuario;
      res.status(200).json({
        usuario,
        dataUser,
        access: true,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "No tienes los privilegios." });
    }
  }

  static async AllUserBySubUnidad(req: Request, res: Response): Promise<void> {
    if (!req.usuario) {
      res.status(400).json({
        message: "El usuario no ha sido registrado",
      });
      return;
    }

    try {
      const users = await AuthController.prisma.usuario.findMany({
        where: {
          idsubunidad: Number(req.usuario.idsubunidad),
        },
        select: {
          iduser: true,
          datausuario: {
            select: {
              APaterno: true,
              AMaterno: true,
              nombre: true,
              dni: true,
              iddatauser: true,
            },
          },
          estado: true,
          roles: { select: { n_rol: true, id_rol: true } },
          subunidad: { select: { n_subuni: true, id_subuni: true } },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          iduser: "asc",
        },
      });

      res.json({ users });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Algo salió mal al obtener los usuarios.",
      });
    }
  }
  static async probarEmail(req: Request, res: Response): Promise<void> {
    try {
      //await EmailDavid();
      res.status(200).json({ message: "Correo enviado correctamente" });
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      res.status(500).json({ message: "Error al enviar el correo" });
    }
  }

  static async ToggleUserStatus(req: Request, res: Response): Promise<void> {
    const { estado } = req.body;
    const iduser = Number(req.params.id);

    if (estado === undefined) {
      res.status(400).json({
        message: "Parámetro estado faltante.",
      });
      return;
    }

    try {
      const existingUser = await AuthController.prisma.usuario.findUnique({
        where: { iduser: iduser },
      });

      if (!existingUser) {
        res.status(404).json({ message: "Usuario no encontrado" });
        return;
      }

      const updatedUser = await AuthController.prisma.usuario.update({
        where: { iduser: iduser },
        data: { estado },
      });

      res.status(200).json({
        message: "Estado del usuario actualizado correctamente.",
        updatedUser,
      });
    } catch (error) {
      console.error("Error al actualizar el estado del usuario:", error);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
}

export default AuthController;
