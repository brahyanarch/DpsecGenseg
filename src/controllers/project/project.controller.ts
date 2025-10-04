import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { HoraLima } from "../../services/horaLima.service";
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

class ProjectController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  public createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fechaInicioProyecto, fechaFinProyecto, actividades } = req.body;

    // 1. Validar fechas del proyecto
    const fechaInicio = new Date(fechaInicioProyecto);
    const fechaFin = new Date(fechaFinProyecto);
    
    if (fechaInicio > fechaFin) {
      res.status(400).json({ error: "Fecha de inicio no puede ser mayor a fecha de fin" });
      return;
    }

    // 2. Crear proyecto
    const newProject = await this.prisma.project.create({
      data: {
        fInit: fechaInicio,
        fFin: fechaFin,
        estado: 'PENDIENTE',
        tipo: 'SUBUNIDAD',
        createdAt: HoraLima(),
        updatedAt: HoraLima(),
        iduser: Number(req.usuario?.iduser), // Asumiendo que tienes usuario en request
        idString:  `${req.usuario?.iduser}-${req.usuario?.idsubunidad}`,
        
      }
    });

    // 3. Procesar actividades
    for (const actividadData of actividades) {
      // Validar fechas de actividad
      const fechaInicioAct = new Date(actividadData.fechaInicio);
      const fechaFinAct = new Date(actividadData.fechaFin);
      
      if (fechaInicioAct < fechaInicio || fechaFinAct > fechaFin) {
        res.status(400).json({ 
          error: `Fechas de actividad "${actividadData.nombre}" fuera del rango del proyecto` 
        });
        return;
      }

      // Crear actividad
      const newActivity = await this.prisma.actividad.create({
        data: {
          name: actividadData.nombre,
          fInit: fechaInicioAct,
          fFin: fechaFinAct,
          estado: 'PENDIENTE',
          idproj: newProject.idproj,
          createdAt: HoraLima(),
          updatedAt: HoraLima(),

        }
      });

      // 4. Procesar respuestas
      for (const [questionId, respuesta] of Object.entries(actividadData.respuestas)) {
        const pregunta = actividadData.preguntas.find((p: any) => p.idp === parseInt(questionId));
        
        if (!pregunta) continue;

        const answerData: any = {
          activityId: newActivity.idActivi,
          questionId: parseInt(questionId),
          createdAt: HoraLima()
        };

        // Manejar diferentes tipos de respuestas
        switch (pregunta.type) {
          case 'TEXT':
            answerData.textValue = respuesta as string;
            break;
            
          case 'NUMBER':
            answerData.numberValue = parseFloat(respuesta as string);
            break;
            
          case 'DATE':
            answerData.dateValue = new Date(respuesta as string);
            break;
            
          case 'FILE':
            // Aquí manejarías la subida de archivos
            answerData.filePath = 'ruta/del/archivo';
            break;
            
          case 'SINGLECHOICE':
          case 'DROPDOWN':
            answerData.optionId = parseInt(respuesta as string);
            break;
            
          case 'MULTIPLECHOICE':
            // Para opción múltiple, crear múltiples respuestas
            for (const opcionId of respuesta as string[]) {
              await this.prisma.answer.create({
                data: {
                  ...answerData,
                  optionId: parseInt(opcionId)
                }
              });
            }
            continue; // Continuar sin crear otra respuesta debajo
            
          default:
            console.warn(`Tipo de pregunta no soportado: ${pregunta.type}`);
            continue;
        }

        await this.prisma.answer.create({ data: answerData });
      }
    }

    const actividadesConRespuestas = [];

    for (const actividadData of actividades) {
      // Validar fechas de actividad
      const fechaInicioAct = new Date(actividadData.fechaInicio);
      const fechaFinAct = new Date(actividadData.fechaFin);
      
      if (fechaInicioAct < fechaInicio || fechaFinAct > fechaFin) {
        res.status(400).json({ 
          error: `Fechas de actividad "${actividadData.nombre}" fuera del rango del proyecto` 
        });
        return;
      }

      // Crear actividad
      /*const newActivity = await this.prisma.actividad.create({
        data: {
          name: actividadData.nombre,
          fInit: fechaInicioAct,
          fFin: fechaFinAct,
          estado: 'PENDIENTE',
          idproj: newProject.idproj,
          createdAt: HoraLima(),
          updatedAt: HoraLima(),
        }
      });*/

      
      // Procesar respuestas y recolectar datos
      const respuestasConDetalles = [];
      
      for (const [questionId, respuesta] of Object.entries(actividadData.respuestas)) {
        const pregunta = actividadData.preguntas.find((p: any) => p.idp === parseInt(questionId));
        
        if (!pregunta) continue;

        // Formatear respuesta según tipo
        let respuestaFormateada = '';
        
        switch (pregunta.type) {
          case 'TEXT':
          case 'NUMBER':
            respuestaFormateada = respuesta as string;
            break;
            
          case 'DATE':
            respuestaFormateada = new Date(respuesta as string).toLocaleDateString();
            break;
            
          case 'FILE':
            respuestaFormateada = 'Archivo adjunto';
            break;
            
          case 'SINGLECHOICE':
          case 'DROPDOWN':
            const opcionSeleccionada = pregunta.opcs.find((opc: any) => 
              opc.idOpc === parseInt(respuesta as string)
            );
            respuestaFormateada = opcionSeleccionada?.txtOpc || '';
            break;
            
          case 'MULTIPLECHOICE':
            const opcionesSeleccionadas = (respuesta as string[]).map(id => {
              const opc = pregunta.opcs.find((opc: any) => opc.idOpc === parseInt(id));
              return opc?.txtOpc || '';
            });
            respuestaFormateada = opcionesSeleccionadas.join(', ');
            break;
        }

        respuestasConDetalles.push({
          pregunta: pregunta.nmPrg,
          respuesta: respuestaFormateada,
          tipo: pregunta.type
        });
      }

      // Almacenar datos de actividad para PDF
      actividadesConRespuestas.push({
        nombre: actividadData.nombre,
        fechaInicio: fechaInicioAct.toLocaleDateString(),
        fechaFin: fechaFinAct.toLocaleDateString(),
        respuestas: respuestasConDetalles
      });
    }

    // Generar PDF con los datos en memoria
    await this.generateProjectPDF({
      proyecto: {
        id: newProject.idproj,
        fechaInicio: fechaInicio.toLocaleDateString(),
        fechaFin: fechaFin.toLocaleDateString(),
        estado: newProject.estado
      },
      actividades: actividadesConRespuestas
    }, res);

    res.status(201).json({
      message: "Proyecto creado exitosamente",
      projectId: newProject.idproj
    });
    
  } catch (error: any) {
    console.error("Error creando proyecto:", error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
}

public getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await this.prisma.project.findMany({
      where:{iduser: Number(req.usuario?.iduser) },
      select:{
        idproj:true,
        idString: true,
        estado: true,
        fInit: true,
        fFin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        idproj: 'asc'
      }
    });

   
    res.json(projects);
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


private async generateProjectPDF(
  projectData: {
    proyecto: {id: number, fechaInicio: string, fechaFin: string, estado: string},
    actividades: Array<{
      nombre: string,
      fechaInicio: string,
      fechaFin: string,
      respuestas: Array<{pregunta: string, respuesta: string, tipo: string}>
    }>
  }, 
  res: Response
) {
  try {
    // 1. Crear contenido LaTeX usando los datos en memoria
    const latexContent = this.generateLatexContent(projectData);

    // 2. Guardar archivo .tex temporal
    const texFilePath = path.join(__dirname, 'temp', `project_${projectData.proyecto.id}.tex`);
    const pdfFilePath = path.join(__dirname, 'temp', `project_${projectData.proyecto.id}.pdf`);
    
    if (!fs.existsSync(path.dirname(texFilePath))) {
      fs.mkdirSync(path.dirname(texFilePath), { recursive: true });
    }
    
    fs.writeFileSync(texFilePath, latexContent);

    // 3. Compilar a PDF
    exec(`pdflatex -output-directory=${path.dirname(texFilePath)} ${texFilePath}`, 
      async (error) => {
        if (error) {
          console.error('Error compilando LaTeX:', error);
          return res.status(500).json({ error: 'Error generando PDF' });
        }

        // 4. Enviar PDF como respuesta
        /*res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="proyecto_${projectData.proyecto.id}.pdf"`);
        fs.createReadStream(pdfFilePath).pipe(res);*/
        // 4. Mover el PDF a la carpeta permanente de proyectos
        const projectDir = path.join(__dirname, 'projects');
        const finalPdfPath = path.join(projectDir, `proyecto_${projectData.proyecto.id}.pdf`);
        
        // Crear directorio de proyectos si no existe
        if (!fs.existsSync(projectDir)) {
          fs.mkdirSync(projectDir, { recursive: true });
        }
        
        // Mover el archivo
        try {
          fs.renameSync(pdfFilePath, finalPdfPath);
          console.log(`PDF guardado en: ${finalPdfPath}`);
        } catch (moveError) {
          console.error('Error moviendo el PDF:', moveError);
          return res.status(500).json({ error: 'Error guardando PDF' });
        }

        // 5. Limpiar archivos temporales
        try {
          const filesToDelete = [
            texFilePath,
            pdfFilePath.replace('.pdf', '.aux'),
            pdfFilePath.replace('.pdf', '.log')
          ];
          
          filesToDelete.forEach(file => {
            if (fs.existsSync(file)) fs.unlinkSync(file);
          });
          console.log('Archivos temporales eliminados');
        } catch (cleanError) {
          console.warn('Error limpiando archivos temporales:', cleanError);
        }

        
        // 5. Limpiar archivos temporales (opcional)
        
      }
    );
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error al generar reporte PDF' });
  }
}

private generateLatexContent(projectData: any): string {
  return `\\documentclass{article}
\\usepackage[spanish]{babel}
\\usepackage[a4paper, margin=2cm]{geometry}
\\usepackage{longtable}
\\usepackage{graphicx}
\\usepackage[table]{xcolor}
\\definecolor{lightgray}{gray}{0.95}

\\title{Reporte del Proyecto \\#${projectData.proyecto.id}}
\\author{Sistema de Gestión de Proyectos}
\\date{}

\\begin{document}
\\maketitle

\\section*{Información del Proyecto}
\\begin{tabular}{|l|l|}
\\hline
\\rowcolor{lightgray} \\textbf{Atributo} & \\textbf{Valor} \\\\
\\hline
ID Proyecto & ${projectData.proyecto.id} \\\\
\\hline
Fecha Inicio & ${projectData.proyecto.fechaInicio} \\\\
\\hline
Fecha Fin & ${projectData.proyecto.fechaFin} \\\\
\\hline
Estado & ${projectData.proyecto.estado} \\\\
\\hline
\\end{tabular}

\\vspace{1cm}

\\section*{Actividades}
${projectData.actividades.map((actividad: any, index: number) => `
\\subsection*{Actividad ${index + 1}: ${this.escapeLatex(actividad.nombre)}}
\\begin{tabular}{|l|l|}
\\hline
\\rowcolor{lightgray} \\textbf{Atributo} & \\textbf{Valor} \\\\
\\hline
Fecha Inicio & ${actividad.fechaInicio} \\\\
\\hline
Fecha Fin & ${actividad.fechaFin} \\\\
\\hline
\\end{tabular}

\\vspace{0.5cm}

\\begin{longtable}{|p{0.4\\textwidth}|p{0.55\\textwidth}|}
\\hline
\\rowcolor{lightgray} \\textbf{Pregunta} & \\textbf{Respuesta} \\\\
\\hline
\\endhead
${actividad.respuestas.map((resp: any) => `
${this.escapeLatex(resp.pregunta)} & 
\\begin{minipage}[t]{0.55\\textwidth}
${this.formatLatexResponse(resp.respuesta, resp.tipo)}
\\end{minipage} \\\\
\\hline
`).join('')}
\\end{longtable}
\\vspace{1cm}
`).join('')}

\\end{document}`;
}

private formatLatexResponse(response: string, type: string): string {
  if (type === 'FILE' && response !== 'Archivo adjunto') {
    return `\\includegraphics[width=0.4\\textwidth]{${response}}`;
  }
  return this.escapeLatex(response);
}

private escapeLatex(text: string): string {
  const replacements: Record<string, string> = {
    '&': '\\&',
    '%': '\\%',
    '$': '\\$',
    '#': '\\#',
    '_': '\\_',
    '{': '\\{',
    '}': '\\}',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
    '\\': '\\textbackslash{}',
  };
  return text.replace(/[&%$#_{}~^\\]/g, char => replacements[char] || char);
}

  
}

export default new ProjectController();
/*
{
    "fechaInicioProyecto": "2025-07-25T05:00:00.000Z",
    "fechaFinProyecto": "2025-08-02T05:00:00.000Z",
    "actividades": [
        {
            "id": 1,
            "nombre": "Actividad Principal",
            "fechaInicio": "2025-07-25T05:00:00.000Z",
            "fechaFin": "2025-08-02T05:00:00.000Z",
            "preguntas": [
                {
                    "idp": 5,
                    "nmPrg": "Texto",
                    "type": "TEXT",
                    "opcs": []
                },
                {
                    "idp": 6,
                    "nmPrg": "Fecha",
                    "type": "DATE",
                    "opcs": []
                },
                {
                    "idp": 7,
                    "nmPrg": "Dime algo",
                    "type": "SINGLECHOICE",
                    "opcs": [
                        {
                            "idOpc": 9,
                            "txtOpc": "dos"
                        },
                        {
                            "idOpc": 10,
                            "txtOpc": "543"
                        }
                    ]
                },
                {
                    "idp": 8,
                    "nmPrg": "aglklo",
                    "type": "DROPDOWN",
                    "opcs": [
                        {
                            "idOpc": 11,
                            "txtOpc": "3"
                        },
                        {
                            "idOpc": 12,
                            "txtOpc": "er"
                        }
                    ]
                },
                {
                    "idp": 9,
                    "nmPrg": "mukltiple",
                    "type": "MULTIPLECHOICE",
                    "opcs": [
                        {
                            "idOpc": 13,
                            "txtOpc": "sdf"
                        },
                        {
                            "idOpc": 14,
                            "txtOpc": "erf"
                        }
                    ]
                },
                {
                    "idp": 10,
                    "nmPrg": "pdf",
                    "type": "FILE",
                    "opcs": []
                },
                {
                    "idp": 11,
                    "nmPrg": "cuantos",
                    "type": "NUMBER",
                    "opcs": []
                }
            ],
            "respuestas": {
                "5": "fsdgfdsfgsdsdfg",
                "6": "2025-08-01",
                "7": "9",
                "8": "12",
                "9": [
                    "13",
                    "14"
                ],
                "10": {},
                "11": "1231"
            }
        }
    ]
}

*/