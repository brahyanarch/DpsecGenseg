export interface SecurityScope {
    scope: 'GLOBAL' | 'LOCAL';
    idOficina: number | null;
    idRol: number;
    cNombreRol: string;
    permissions: string[];
}

export interface SecurityContext {
    scope: 'GLOBAL' | 'LOCAL';
    idOficina: number | null;
    idRol: number;
    cNombreRol: string;
    permissions: string[];
}
