import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // O tu proveedor de correo
  auth: {
    user: 'tucorreo@gmail.com',
    pass: 'tucontraseña',
  },
});

export async function enviarCorreo(destinatario: string, contraseña: string): Promise<void> {
  const enlaceCambio = 'http://localhost:3006/auth/cambiar-contrasena';
  const mensaje = `Hola,\n\nTu contraseña por defecto es: ${contraseña}\n\nPor favor, cambia tu contraseña siguiendo este enlace: ${enlaceCambio}`;

  const mailOptions = {
    from: 'ssdad@gmail.com',
    to: destinatario,
    subject: 'Tu nueva contraseña',
    text: mensaje,
  };

  await transporter.sendMail(mailOptions);
}