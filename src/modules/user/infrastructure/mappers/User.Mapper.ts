// src/infrastructure/mappers/User.Mapper.ts
import { entUser, Permission } from "../../domain/entities/ent.User";

export class UserMapper {
    public static toDomain(raw: any): entUser {
        // Aquí conviertes el objeto sucio de Prisma a tu Entidad limpia
        
        // Extraemos los permisos únicos de todos los roles del usuario
        // Permissions are resolved only after selecting a single active context.

        // Eliminamos duplicados basándonos en el idPermiso
        const uniquePermissions: Permission[] = [];

        return new entUser(
            raw.idUser,
            raw.cEmail,
            raw.cPassword,
            raw.cNombre,
            (raw.perfiles || []).map((a: any) => ({
                idRol: a.idRol,
                cNombreRol: a.rol.cNombreRol,
                idOficina: a.idOficina,
                cNombreOficina: a.oficina.cNombreOficina,
                idProfile: a.idUsuarioUni,
                dExpiresAt: a.dExpiresAt,
                lActivo: a.lActivo,
                lVigente: a.lVigente,
                cTipoRol: a.rol.cTipoRol
            })),
            uniquePermissions,
            null,
            raw.lVigente,
            raw.lActivo,
            raw.nFailedAttempts,
            raw.dLastFailedAttempt,
            (raw.asignacionesSistema || []).map((a: any) => ({
                idRol: a.idRol,
                cNombreRol: a.rol.cNombreRol,
                idAsignacionSistema: a.idUsuarioSistema,
                lActivo: a.lActivo,
                lVigente: a.lVigente,
                cTipoRol: a.rol.cTipoRol
            })),
            (raw.perfiles || []).map((a: any) => ({ id: a.idUsuarioUni, permissions: (a.rol.detallePermisos || []).map((d: any) => ({ idPermiso: d.permiso.idPermiso, cNombrePermiso: d.permiso.cNombrePermiso })) })),
            (raw.asignacionesSistema || []).map((a: any) => ({ id: a.idUsuarioSistema, permissions: (a.rol.detallePermisos || []).map((d: any) => ({ idPermiso: d.permiso.idPermiso, cNombrePermiso: d.permiso.cNombrePermiso })) }))
        );
    }

    public static toResponse(user: entUser) {
        return {
            idUser: user.getId(),
            cEmail: user.getEmail(),
            cNombre: user.getNombre(),
            lActivo: user.isActivo(),
            perfiles: user.getPerfiles(),
            asignacionesSistema: user.getAsignacionesSistema(),
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
