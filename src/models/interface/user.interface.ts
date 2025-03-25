import { isEnumMember } from "typescript";

export interface User{
    id: Number,
    usuario:  string,
    password: string
}
export type Roles = {
    id_rol: number,
    n_rol: string,
    abrev: string,
    createdAt: string,
    updatedAt: string,
}
export interface Usuario {
    iduser: Number,
    idrol: Number,
    idsubunidad: Number,
    estado: boolean,
    iddatauser: Number,
}

export type DataUsuario = {
    email: string;
    dni: string;
    nombre: string;
    APaterno: string;
    AMaterno: string;
    idpe: Number | null;
    prgest: {
        idpe: number;
        nmPE: string;
    } | null;
} 

export type Type = 'TEXT' | 'MULTIPLECHOICE' | 'SINGLECHOICE' | 'DROPDOWN' | 'DATE' | 'FILE' | 'NUMBER';

