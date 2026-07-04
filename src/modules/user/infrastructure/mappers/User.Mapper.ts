// src/infrastructure/mappers/User.Mapper.ts
import { entUser } from "../../domain/entities/ent.User";

export class UserMapper {
    public static toDomain(raw: any): entUser {
        // Aquí conviertes el objeto sucio de Prisma a tu Entidad limpia
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
                dExpiresAt: a.dExpiresAt
            }))
        );
    }

    public static toPersistence(user: entUser) {
        return {
            cEmail: user.getEmail(),
            cPassword: user.getCPassword(),
            cNombre: user.getNombre(),
            idActiveProfile: user.getIdActiveProfile(),
            // Nota: Si tu tabla 'users' requiere nFailedAttempts por defecto, 
            // agrégalo aquí o deja que Prisma lo gestione si tiene default en el schema.
        };
    }
}