export interface SecurityScope {
    scope: 'GLOBAL' | 'LOCAL';
    idOficina: number | null;
    idRol: number;
    cNombreRol: string;
}

export interface SecurityContext {
    scope: 'GLOBAL' | 'LOCAL';
    idOficina: number | null;
    idRol: number;
    cNombreRol: string;
}
