export class entRol {
    constructor(
        public readonly idRol: number | null,
        public readonly cNombreRol: string,
        public readonly cAbrevRol: string | null = null,
        public readonly lActivo: boolean = true,
        public readonly lVigente: boolean = true
    ) {}
}
