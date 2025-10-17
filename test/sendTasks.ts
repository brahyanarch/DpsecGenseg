// 🔹 URL base de tu API
const BASE_URL = "http://localhost:3006";
const ENDPOINT = "/api/task";

// 🔹 Lista de tareas (puedes ampliar a 50+)
const tasks = [
  {"title": "Matemática", "description": "Aprender funciones y derivadas", "estado": "COMPLETADO"},
  {"title": "Historia", "description": "Estudio de las civilizaciones antiguas", "estado": "ENPROCESO"},
  {"title": "Física", "description": "Simulaciones de movimiento y energía", "estado": "PENDIENTE"},
  {"title": "Química", "description": "Reacciones químicas básicas", "estado": "ARCHIVADO"},
  {"title": "Programación", "description": "Estructuras de datos en C++", "estado": "COMPLETADO"},
  {"title": "Inglés", "description": "Práctica de conversación avanzada", "estado": "ENPROCESO"},
  {"title": "Biología", "description": "Genética y evolución", "estado": "PENDIENTE"},
  {"title": "Arte", "description": "Historia del arte moderno", "estado": "ARCHIVADO"},
  {"title": "Geografía", "description": "Regiones naturales del Perú", "estado": "ENPROCESO"},
  {"title": "Literatura", "description": "Análisis de obras latinoamericanas", "estado": "COMPLETADO"},
  {"title": "Economía", "description": "Principios de oferta y demanda", "estado": "PENDIENTE"},
  {"title": "Algoritmos", "description": "Optimización de procesos", "estado": "ENPROCESO"},
  {"title": "Base de Datos", "description": "Diseño de modelos relacionales", "estado": "COMPLETADO"},
  {"title": "Redes", "description": "Configuración de routers", "estado": "ARCHIVADO"},
  {"title": "Seguridad Informática", "description": "Prácticas de ciberseguridad", "estado": "PENDIENTE"},
  {"title": "Robótica", "description": "Control de servomotores", "estado": "ENPROCESO"},
  {"title": "Estadística", "description": "Análisis de datos y probabilidades", "estado": "COMPLETADO"},
  {"title": "Psicología", "description": "Teorías del aprendizaje", "estado": "PENDIENTE"},
  {"title": "Contabilidad", "description": "Balances y estados financieros", "estado": "ARCHIVADO"},
  {"title": "Marketing", "description": "Estrategias digitales", "estado": "ENPROCESO"},
  {"title": "Fotografía", "description": "Composición y luz natural", "estado": "COMPLETADO"},
  {"title": "Diseño Gráfico", "description": "Tipografía y color", "estado": "PENDIENTE"},
  {"title": "Música", "description": "Teoría y práctica instrumental", "estado": "ARCHIVADO"},
  {"title": "Sociología", "description": "Estructuras sociales urbanas", "estado": "ENPROCESO"},
  {"title": "Administración", "description": "Gestión de proyectos", "estado": "COMPLETADO"},
  {"title": "Educación", "description": "Modelos de enseñanza", "estado": "PENDIENTE"},
  {"title": "Derecho", "description": "Normas y justicia social", "estado": "ARCHIVADO"},
  {"title": "Turismo", "description": "Gestión de destinos turísticos", "estado": "COMPLETADO"},
  {"title": "Arquitectura", "description": "Diseño estructural básico", "estado": "ENPROCESO"},
  {"title": "Cine", "description": "Guion y dirección", "estado": "PENDIENTE"},
  {"title": "Ingeniería Civil", "description": "Materiales de construcción", "estado": "ARCHIVADO"},
  {"title": "Medicina", "description": "Anatomía y fisiología humana", "estado": "COMPLETADO"},
  {"title": "Veterinaria", "description": "Cuidado de animales domésticos", "estado": "ENPROCESO"},
  {"title": "Astronomía", "description": "Exploración del sistema solar", "estado": "PENDIENTE"},
  {"title": "Informática", "description": "Sistemas operativos Linux", "estado": "ARCHIVADO"},
  {"title": "Energías Renovables", "description": "Paneles solares y eólicos", "estado": "COMPLETADO"},
  {"title": "Ingeniería Industrial", "description": "Optimización de procesos productivos", "estado": "ENPROCESO"},
  {"title": "Ciberseguridad", "description": "Auditorías de red y control", "estado": "PENDIENTE"},
  {"title": "Diseño Web", "description": "Desarrollo con HTML y CSS", "estado": "COMPLETADO"},
  {"title": "Desarrollo Móvil", "description": "Aplicaciones con Ionic", "estado": "ARCHIVADO"},
  {"title": "Gestión Ambiental", "description": "Control de residuos sólidos", "estado": "ENPROCESO"},
  {"title": "Ecología", "description": "Conservación de ecosistemas", "estado": "PENDIENTE"},
  {"title": "Antropología", "description": "Culturas del mundo antiguo", "estado": "ARCHIVADO"},
  {"title": "Ingeniería de Software", "description": "Ciclo de vida y pruebas", "estado": "COMPLETADO"},
  {"title": "Matemática Aplicada", "description": "Ecuaciones diferenciales", "estado": "ENPROCESO"},
  {"title": "Educación Física", "description": "Entrenamiento y salud", "estado": "PENDIENTE"},
  {"title": "Finanzas", "description": "Inversiones personales", "estado": "ARCHIVADO"},
  {"title": "Cocina", "description": "Recetas internacionales", "estado": "COMPLETADO"},
  {"title": "Panadería", "description": "Técnicas artesanales", "estado": "ENPROCESO"},
  {"title": "Carpintería", "description": "Muebles y acabados", "estado": "PENDIENTE"},
  {"title": "Electricidad", "description": "Instalaciones residenciales", "estado": "ARCHIVADO"},
  {"title": "Mecánica", "description": "Motores y transmisión", "estado": "COMPLETADO"},
  {"title": "Fotografía Digital", "description": "Edición con Lightroom", "estado": "ENPROCESO"},
  {"title": "Emprendimiento", "description": "Modelos de negocio innovadores", "estado": "PENDIENTE"},
  {"title": "Comunicación", "description": "Oratoria y expresión verbal", "estado": "ARCHIVADO"}
];

// 🔹 Función para enviar una tarea por POST
async function sendTask(task: any) {
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      console.error(`❌ Error al enviar ${task.title}: ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Enviado: ${task.title}`, data);
  } catch (error) {
    console.error(`⚠️ Error con ${task.title}:`, error);
  }
}

// 🔹 Ejecutar todas las tareas secuencialmente
async function main() {
  for (const task of tasks) {
    await sendTask(task);
  }
  console.log("🚀 Todos los datos fueron enviados.");
}

main();
