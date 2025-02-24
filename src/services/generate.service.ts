export function generarContrasenia(longitud: number = 12): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let contraseña = '';
    for (let i = 0; i < longitud; i++) {
      contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return contraseña;
  }