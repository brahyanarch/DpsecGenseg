export class entPermiso {
    constructor(
        public readonly idPermiso: number | null,
        public readonly cNombrePermiso: string,
        public readonly cAbrevPermiso: string | null = null,
        public readonly lActivo: boolean = true,
        public readonly lVigente: boolean = true
    ) {}
}
