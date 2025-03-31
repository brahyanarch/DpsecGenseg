export function HoraLima(fechaParametro?: string | Date): Date {
    // Si no se proporciona fecha, usa la fecha actual
    const fecha = fechaParametro ? new Date(fechaParametro) : new Date();
    
    // Restar 5 horas
    fecha.setHours(fecha.getHours() - 5);
    
    return fecha;
  }