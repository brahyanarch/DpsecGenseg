export interface Office {
    idOficina: number;
    cNombreOficina: string;
    cAbrevOficina: string;
    lActivo: boolean;
    lVigente: boolean;
    dCreatedAt: Date;
    dUpdatedAt: Date | null;
}

export interface UpdateOfficeData {
    cNombreOficina?: string;
    cAbrevOficina?: string;
}

export interface CreateOfficeData {
    cNombreOficina: string;
    cAbrevOficina: string;
}
