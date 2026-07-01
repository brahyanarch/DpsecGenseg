// src/domain/exceptions/app.Error.ts

import { errorCatalog } from "./error.Catalog";

export class appError extends Error {
    constructor(
        public readonly cCode: string,
        public readonly cUserMessage: string,
        public readonly cTechnicalMessage: string,
        public readonly lCanCancel: boolean = false
    ) {
        super(cUserMessage);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    // Método estático para crear el error reemplazando el nombre del campo
    public static createMissingField(fieldName: string) {
        const template = errorCatalog.MISSING_FIELD;
        return new appError(
            template.code,
            template.message.replace("{field}", fieldName),
            `Missing field: ${fieldName}`,
            true
        );
    }
}