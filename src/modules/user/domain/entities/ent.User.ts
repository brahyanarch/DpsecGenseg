// src/domain/entities/ent.User.ts

export interface Perfil {
    idRol: number;
    cNombreRol: string;
    idOficina: number;
    cNombreOficina: string;
    lVigente: boolean;
    dExpiresAt: Date | null;
}

export class entUser {
    constructor(
        private readonly _idUser: number,
        private readonly _cEmail: string,
        private readonly _cPassword: string | null,
        private readonly _cNombre: string | null,
        private readonly _perfiles: Perfil[]
    ) {}

    // ESTÁNDAR: Métodos de acceso (Getters explícitos)
    public getId(): number { return this._idUser; }
    public getEmail(): string { return this._cEmail; }
    public getNombre(): string | null { return this._cNombre; }
    public getCPassword(): string | null {
        return this._cPassword;
    }

    // Regla de negocio: ¿Tiene rol activo?
    public hasActiveRole(idOficina: number, nombreRol: string): boolean {
        return this._perfiles.some(perfil => 
            perfil.idOficina === idOficina && 
            perfil.cNombreRol === nombreRol &&
            perfil.lVigente === true &&
            (perfil.dExpiresAt === null || perfil.dExpiresAt > new Date())
        );
    }
}