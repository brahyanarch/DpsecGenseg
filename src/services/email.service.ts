import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // O tu proveedor de correo
  auth: {
    user: 'brahyanarch@gmail.com',
    pass: 'A8kCOpQF',
  },
});

export async function enviarCorreo(destinatario: string, contraseña: string): Promise<void> {
  const enlaceCambio = 'http://localhost:3005/auth/cambiar-contrasena';
  const mensaje = `Hola,\n\nTu contraseña por defecto es: ${contraseña}\n\nPor favor, cambia tu contraseña siguiendo este enlace: ${enlaceCambio}`;

  const mailOptions = {
    from: 'brahyanarch@gmail.com',
    to: destinatario,
    subject: 'Datos de tu cuenta en GENSEG',
    text: mensaje,
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
        console.log('Error al enviar el correo:', error);
    } else {
        console.log('Correo enviado:', info.response);
    }
});
}