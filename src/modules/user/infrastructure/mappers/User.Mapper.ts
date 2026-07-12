// src/infrastructure/mappers/User.Mapper.ts
import { entUser, Permission } from "../../domain/entities/ent.User";

export class UserMapper {
    public static toDomain(raw: any): entUser {
        // Aquí conviertes el objeto sucio de Prisma a tu Entidad limpia
        
        // Extraemos los permisos únicos de todos los roles del usuario
        const permissionsSet = new Set();
        const permissions: Permission[] = [];

        if (raw.perfiles) {
            raw.perfiles.forEach((perfil: any) => {
                if (perfil.rol && perfil.rol.detallePermisos) {
                    perfil.rol.detallePermisos.forEach((dp: any) => {
                        if (dp.lVigente && dp.lActivo && dp.permiso) {
                            permissionsSet.add(dp.permiso.idPermiso);
                            permissions.push({
                                idPermiso: dp.permiso.idPermiso,
                                cNombrePermiso: dp.permiso.cNombrePermiso
                            });
                        }
                    });
                }
            });
        }

        // Eliminamos duplicados basándonos en el idPermiso
        const uniquePermissions = permissions.filter((p, index, self) =>
            index === self.findIndex((t) => t.idPermiso === p.idPermiso)
        );

        return new entUser(
            raw.idUser,
            raw.cEmail,
            raw.cPassword,
            raw.cNombre,
            raw.perfiles.map((a: any) => ({
                idRol: a.idRol,
                cNombreRol: a.rol.cNombreRol,
                idOficina: a.idOficina,
                cNombreOficina: a.oficina.cNombreOficina,
                idProfile: a.idUsuarioUni,
                dExpiresAt: a.dExpiresAt,
                lActivo: a.lActivo
            })),
            uniquePermissions,
            raw.lVigente,
            raw.lActivo
        );
    }

    public static toResponse(user: entUser) {
        return {
            idUser: user.getId(),
            cEmail: user.getEmail(),
            cNombre: user.getNombre(),
            lActivo: user.isActivo(),
            perfiles: user.getPerfiles(),
            permissions: user.getPermissions()
        };
    }

    public static toPersistence(user: entUser) {
        return {
            cEmail: user.getEmail(),
            cPassword: user.getCPassword(),
            cNombre: user.getNombre(),
            // idActiveProfile: user.getIdActiveProfile(),
            // Nota: Si tu tabla 'users' requiere nFailedAttempts por defecto, 
            // agrégalo aquí o deja que Prisma lo gestione si tiene default en el schema.
        };
    }
}
