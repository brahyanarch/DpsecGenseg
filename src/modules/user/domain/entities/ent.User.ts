// src/domain/entities/ent.User.ts

export interface Perfil {
    idRol: number;
    cNombreRol: string;
    idOficina: number;
    cNombreOficina: string;
    idProfile: number | null;
    dExpiresAt: Date | null;
    lActivo: boolean;
    lVigente: boolean;
    cTipoRol: string;
}

export interface AsignacionSistema {
    idRol: number;
    cNombreRol: string;
    idAsignacionSistema: number;
    lActivo: boolean;
    lVigente: boolean;
    cTipoRol: string;
}

export interface ActiveContext {
    tipo: "UNIVERSIDAD" | "SISTEMA";
    id: number;
}

export interface Permission {
    idPermiso: number;
    cNombrePermiso: string;
}

export class entUser {
    constructor(
        private readonly _idUser: number,
        private readonly _cEmail: string,
        private readonly _cPassword: string | null,
        private readonly _cNombre: string | null,
        private readonly _perfiles: Perfil[],
        private readonly _permissions: Permission[],
        private readonly _idActiveProfile: number | null = null,
        private readonly _lVigente: boolean = true,
        private readonly _lActivo: boolean = true,
        private readonly _nFailedAttempts: number = 0,
        private readonly _dLastFailedAttempt: Date | null = null,
        private readonly _asignacionesSistema: AsignacionSistema[] = [],
        private readonly _profilePermissions: { id: number; permissions: Permission[] }[] = [],
        private readonly _systemPermissions: { id: number; permissions: Permission[] }[] = []
    ) {}

    // ESTÁNDAR: Métodos de acceso (Getters explícitos)
    public getId(): number { return this._idUser; }
    public getEmail(): string { return this._cEmail; }
    public getNombre(): string | null { return this._cNombre; }
    public getCPassword(): string | null { return this._cPassword; }
    public getIdActiveProfile(): number | null { return this._idActiveProfile; }
    public isVigente(): boolean { return this._lVigente; }
    public isActivo(): boolean { return this._lActivo; }
    public verifyProfile(_paramidActiveProfile: number | null): boolean { 
        return this._perfiles.some(perfil => perfil.idProfile === _paramidActiveProfile && perfil.lActivo && perfil.lVigente && perfil.cTipoRol === "UNIVERSIDAD" && (!perfil.dExpiresAt || perfil.dExpiresAt > new Date()));
    }

    public verifySystemAssignment(id: number): boolean {
        return this._asignacionesSistema.some(a => a.idAsignacionSistema === id && a.lActivo && a.lVigente && a.cTipoRol === "SISTEMA");
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

    public getAsignacionesSistema(): AsignacionSistema[] { return [...this._asignacionesSistema]; }

    public getPermissions(): Permission[] {
        return [...this._permissions];
    }

    public getActiveContext(idProfile?: number | null, idSystemAssignment?: number | null): ActiveContext | null {
        if (idProfile != null && idSystemAssignment == null && this.verifyProfile(idProfile)) return { tipo: "UNIVERSIDAD", id: idProfile };
        if (idSystemAssignment != null && idProfile == null && this.verifySystemAssignment(idSystemAssignment)) return { tipo: "SISTEMA", id: idSystemAssignment };
        return null;
    }

    public getPermissionsForContext(idProfile?: number | null, idSystemAssignment?: number | null): Permission[] {
        const context = this.getActiveContext(idProfile, idSystemAssignment);
        if (!context) return [];
        const source = context.tipo === "UNIVERSIDAD" ? this._profilePermissions : this._systemPermissions;
        return [...(source.find(item => item.id === context.id)?.permissions ?? [])];
    }
}
