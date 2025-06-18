import { Request, Response, NextFunction } from "express";
import { Type } from "@prisma/client";

// VALIDACIONES PARA EL ADMINISTRADOR GENERAL
export const ValidateInputForm = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

  if (!name) {
    res.status(401).json({ message: "El titulo es obligatorio" });
    return;
  }

  if (!req.usuario) {
    res.status(402).json({ message: "El usuario no autenticado" });
    return;
  }

  next(); // Si todo está bien, pasa al siguiente middleware o controlador
};

export const ValidateToggleForm = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!id) {
    res.status(401).json({ message: "El id del formulario es obligatorio" });
    return;
  }

  if (!req.usuario) {
    res.status(402).json({ message: "El usuario no autenticado" });
    return;
  }

  next(); // Si todo está bien, pasa al siguiente middleware o controlador
};

export const ValidateQuestionsForm = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const preguntas = req.body.preguntas;
  // Tipos de preguntas permitidos
  const tiposPermitidos = Object.values(Type);;
  // Validar que el campo "preguntas" exista y sea un array
  if (!preguntas || !Array.isArray(preguntas)) {
    res.status(400).json({
      message: "El formulario debe tener un array de preguntas.",
    });
    return;
  }
  // Validar que el formulario tenga al menos 1 pregunta
  if (preguntas.length <= 0) {
    res.status(400).json({
      message: "El formulario debe tener al menos 1 pregunta.",
    });
    return;
  }
  // Validar cada pregunta
  for (let i = 0; i < preguntas.length; i++) {
    const pregunta = preguntas[i];
    if(preguntas.length <= 0){
      res.status(400).json({
        message: "El formulario no debe tener al menos 1 pregunta"
      });
      return;
    }
    // 1. Validar campos obligatorios
    if (!pregunta.id || !pregunta.type || !pregunta.text) {
      res.status(400).json({
        error: `La pregunta en la posición ${i} no tiene los campos obligatorios (id, type, text).`,
      });
      return;
    }

    // 2. Validar que el tipo de pregunta sea permitido
    if (!tiposPermitidos.includes(pregunta.type)) {
      res.status(400).json({
        error: `El tipo de pregunta "${pregunta.type}" en la posición ${i} no es válido.`,
      });
      return;
    }
    if (pregunta.text.length > 1000) {
      res.status(400).json({
        error: `El texto de la pregunta en la posición ${i} no debe exceder los 1000 caracteres.`,
      });
      return;
    }
    
    // 3. Validar reglas específicas por tipo de pregunta
    switch (pregunta.type) {
      case "singleChoice":
        if (pregunta.options.length < 2) {
          res.status(400).json({
            error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) debe tener al menos 2 opciones.`,
          });
          return;
        }
        if (pregunta.options.length > 20) {
          res.status(400).json({
            error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) no debe tener más de 20 opciones.`,
          });
          return;
        }
        break;
      case "dropdown":
        if (pregunta.options.length < 2) {
            res.status(400).json({
              error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) debe tener al menos 2 opciones.`,
            });
            return;
          }
          if (pregunta.options.length > 20) {
            res.status(400).json({
              error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) no debe tener más de 20 opciones.`,
            });
            return;
          }
          break;
      case "multipleChoice":
        // Verificar que las opciones estén presentes y no estén vacías
        if (pregunta.options.length < 2) {
            res.status(400).json({
              error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) debe tener al menos 2 opciones.`,
            });
            return;
          }
          if (pregunta.options.length > 20) {
            res.status(400).json({
              error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) no debe tener más de 20 opciones.`,
            });
            return;
          }
        break;

      case "date":
        if (pregunta.options) {
          res.status(400).json({
            error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) no debe tener opciones.`,
          });
          return;
        }
        break;
      case "archive":
        if (pregunta.options) {
          res.status(400).json({
            error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) no debe tener opciones.`,
          });
          return;
        }
        break;
      case "Number":
        if (pregunta.options) {
          res.status(400).json({
            error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) no debe tener opciones.`,
          });
          return;
        }
        break;
      case "text":
        // Verificar que no haya opciones (no son necesarias para estos tipos)
        if (pregunta.options) {
          res.status(400).json({
            error: `La pregunta en la posición ${i} (tipo: ${pregunta.type}) no debe tener opciones.`,
          });
          return;
        }
        break;

      default:
        break;
    }
  }
  //console.log("Preguntas validadas correctamente");
  next(); // Si todo está bien, pasa al siguiente middleware o controlador
};

//Validar que venga el plan en pdf y que pese menos de 10MB
export const ValidatePlanPDF = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = req.file as Express.Multer.File; // Asegúrate de que estás usando multer para manejar archivos
  if (!file) {
    res.status(400).json({ message: "El archivo del plan es obligatorio" });
    return;
  }
  // Validar que el archivo sea un PDF
  if (file.mimetype !== "application/pdf") {
    res.status(400).json({ message: "El archivo debe ser un PDF" });
    return;
  }
  // Validar que el tamaño del archivo no exceda los 10MB
  if (file.size > 10 * 1024 * 1024) {
    res.status(400).json({ message: "El archivo no debe exceder los 10MB" });
    return;
  }
  
  next(); // Si todo está bien, pasa al siguiente middleware o controlador
}

// validar que las actividades vengan en el formato correcto
export const ValidateActivities = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const actividades = req.body.actividades;
  
  // Validar que el campo "actividades" exista y sea un array
  if (!actividades || !Array.isArray(actividades)) {
    res.status(400).json({
      message: "El formulario debe tener un array de actividades.",
    });
    return;
  }
  
  // Validar que el formulario tenga al menos 1 actividad
  if (actividades.length <= 0) {
    res.status(400).json({
      message: "El formulario debe tener al menos 1 actividad.",
    });
    return;
  }
  
  // Validar cada actividad
  for (let i = 0; i < actividades.length; i++) {
    const actividad = actividades[i];
    
    // Validar campos obligatorios
    if (!actividad.id || !actividad.name || !actividad.description) {
      res.status(400).json({
        error: `La actividad en la posición ${i} no tiene los campos obligatorios (id, name, description).`,
      });
      return;
    }
    
    if (actividad.name.length > 100) {
      res.status(400).json({
        error: `El nombre de la actividad en la posición ${i} no debe exceder los 100 caracteres.`,
      });
      return;
    }
    
    if (actividad.description.length > 500) {
      res.status(400).json({
        error: `La descripción de la actividad en la posición ${i} no debe exceder los 500 caracteres.`,
      });
      return;
    }
    
    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ["pendiente", "en_proceso", "completada"];
    if (!estadosPermitidos.includes(actividad.state)) {
      res.status(400).json({
        error: `El estado de la actividad en la posición ${i} no es válido.`,
      });
      return;
    }
    
    // Validar que las fechas sean válidas
    if (actividad.startDate && isNaN(Date.parse(actividad.startDate))) {
      res.status(400).json({
        error: `La fecha de inicio de la actividad en la posición ${i} no es válida.`,
      });
      return;
    }
    
    if (actividad.endDate && isNaN(Date.parse(actividad.endDate))) {
      res.status(400).json({
        error: `La fecha de fin de la actividad en la posición ${i} no es válida.`,
      });
      return;
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (actividad.startDate && actividad.endDate) {
      const startDate = new Date(actividad.startDate);
      const endDate = new Date(actividad.endDate);
      if (startDate >= endDate) {
        res.status(400).json({
          error: `La fecha de inicio de la actividad en la posición ${i} debe ser anterior a la fecha de fin.`,
        });
        return;
      }
    }
  }
}