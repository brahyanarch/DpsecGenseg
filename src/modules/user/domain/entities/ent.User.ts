// src/domain/entities/ent.User.ts

export interface Perfil {
    idRol: number;
    cNombreRol: string;
    idOficina: number;
    cNombreOficina: string;
    idProfile: number | null;
    dExpiresAt: Date | null;
}

export class entUser {
    constructor(
        private readonly _idUser: number,
        private readonly _cEmail: string,
        private readonly _cPassword: string | null,
        private readonly _cNombre: string | null,
        private readonly _perfiles: Perfil[],
        private readonly _idActiveProfile: number | null = null
    ) {}

    // ESTÁNDAR: Métodos de acceso (Getters explícitos)
    public getId(): number { return this._idUser; }
    public getEmail(): string { return this._cEmail; }
    public getNombre(): string | null { return this._cNombre; }
    public getCPassword(): string | null { return this._cPassword; }
    public getIdActiveProfile(): number | null { return this._idActiveProfile; }
    public verifyProfile(_paramidActiveProfile: number | null): boolean { 
        return this._perfiles.some(perfil => perfil.idProfile === _paramidActiveProfile);
    }
    // Regla de negocio: ¿Tiene rol activo?
    public hasActiveRole(idOficina: number, nombreRol: string): boolean {
        return this._perfiles.some(perfil => 
            perfil.idOficina === idOficina && 
            perfil.cNombreRol === nombreRol &&
            (perfil.dExpiresAt === null || perfil.dExpiresAt > new Date())
        );
    }

    public getPerfiles(): Perfil[] {
        return [...this._perfiles]; 
    }
}