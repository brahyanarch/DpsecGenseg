export const errorCatalog = {
    // Usamos {field} como un placeholder que luego reemplazaremos
    MISSING_FIELD: { 
        code: "54001", 
        message: "El campo {field} es obligatorio",
        canCancel: true
    },
    INVALID_LENGTH: { 
        code: "54032", 
        message: "El campo {field} no tiene la longitud correcta",
        canCancel: true
    },
    // ...
};