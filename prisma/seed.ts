import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/shared/services/password.service';

const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando la semilla (seed)...');

  // 1. Crear el Rol de Administrador
  const adminRol = await prisma.rol.upsert({
    where: { cNombreRol: 'ADMINISTRADOR' },
    update: { cTipoRol: 'SISTEMA' },
    create: {
      cNombreRol: 'ADMINISTRADOR',
      cAbrevRol: 'ADMIN',
      lActivo: true,
      lVigente: true,
      cTipoRol: 'SISTEMA',
    },
  });
  console.log(' Rol Administrador creado o verificado.');

  // 2. Crear el permiso de acceso total y vincularlo al rol de Administrador
  const accesoTotalPermiso = await prisma.permiso.upsert({
    where: { cNombrePermiso: 'ACCESO_TOTAL_SISTEMA' },
    update: { cTipoRol: 'SISTEMA', lActivo: true, lVigente: true },
    create: {
      cNombrePermiso: 'ACCESO_TOTAL_SISTEMA',
      cTipoRol: 'SISTEMA',
      lActivo: true,
      lVigente: true,
    },
  });

  await prisma.detallePermiso.upsert({
    where: {
      unique_detalle_permiso: {
        idRol: adminRol.idRol,
        idPermiso: accesoTotalPermiso.idPermiso,
      },
    },
    update: { lActivo: true, lVigente: true },
    create: {
      idRol: adminRol.idRol,
      idPermiso: accesoTotalPermiso.idPermiso,
      lActivo: true,
      lVigente: true,
    },
  });
  console.log(' Permiso de acceso total vinculado al rol Administrador.');

  // 3. Crear el Usuario Administrador Inicial
  const emailAdmin = 'admin@admin.com'; // Puedes cambiarlo aquí
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
  await prisma.usuarioSistema.upsert({
    where: {
      unique_usuario_sistema_user_rol: {
        idUser: adminUser.idUser,
        idRol: adminRol.idRol,
      },
    },
    update: {
        lActivo: true,
        lVigente: true
    },
    create: {
      idUser: adminUser.idUser,
      idRol: adminRol.idRol,
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
