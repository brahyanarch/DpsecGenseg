import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/services/password.service';

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando la semilla (seed)...');

  // 1. Crear el Rol de Administrador
  const adminRol = await prisma.rol.upsert({
    where: { cNombreRol: 'ADMINISTRATOR' },
    update: {},
    create: {
      cNombreRol: 'ADMINISTRATOR',
      cAbrevRol: 'ADMIN',
      lActivo: true,
      lVigente: true,
    },
  });
  console.log(' Rol Administrador creado o verificado.');

  // 2. Crear una Oficina inicial
  const oficina = await prisma.oficina.upsert({
    where: { cNombreOficina: 'CENTRAL' },
    update: {},
    create: {
      cNombreOficina: 'CENTRAL',
      cAbrevOficina: 'CENTRAL',
      lActivo: true,
      lVigente: true,
    },
  });
  console.log(' Oficina Sede Central creada o verificada.');

  // 3. Crear el Usuario Administrador Inicial
  const emailAdmin = 'admin'; // Puedes cambiarlo aquí
  const passwordAdmin = 'Admin123*';      // ¡Cámbiala después de loguearte!
  
  const hashedPassword = await hashPassword(passwordAdmin);

  const adminUser = await prisma.user.upsert({
    where: { cEmail: emailAdmin },
    update: {
        cPassword: hashedPassword // Por si quieres resetear la clave corriendo el seed
    },
    create: {
      cEmail: emailAdmin,
      cPassword: hashedPassword,
      cNombre: 'Administrador',
      cAPaterno: 'Root',
      cAMaterno: 'Genseg',
      cLoginMethod: 'LOCAL',
      lActivo: true,
      lVigente: true,
    },
  });
  console.log(`Usuario Administrador (${emailAdmin}) creado o verificado.`);

  // 4. Vincular Usuario + Rol + Oficina (Perfil)
  // Usamos upsert con la restricción única definida en el schema
  await prisma.usuarioUniversidad.upsert({
    where: {
      unique_usuario_rol_oficina: {
        idUser: adminUser.idUser,
        idRol: adminRol.idRol,
        idOficina: oficina.idOficina,
      },
    },
    update: {
        lActivo: true,
        lVigente: true
    },
    create: {
      idUser: adminUser.idUser,
      idRol: adminRol.idRol,
      idOficina: oficina.idOficina,
      lActivo: true,
      lVigente: true,
    },
  });
  console.log(' Perfil de Administrador vinculado correctamente.');

  console.log('\n ¡Configuración inicial completada!');
  console.log(` Email: ${emailAdmin}`);
  console.log(` Password: ${passwordAdmin}`);
  console.log('Recuerda que debes usar estos datos para tu primer Login.');
}

main()
  .catch((e) => {
    console.error(' Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
