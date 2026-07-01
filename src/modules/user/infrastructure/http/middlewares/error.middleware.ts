// src/infrastructure/http/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { appError } from "../../../domain/exceptions/app.Error";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Si es un error de los que definimos (appError)
    if (err instanceof appError) {
        return res.status(401).json({
            nSuccess: false,
            error: {
                cCode: err.cCode,
                cMessage: err.cUserMessage,
                cTechnicalDetails: err.cTechnicalMessage
            }
        });
    }

    // Si es cualquier otro error desconocido (500)
    res.status(500).json({
        nSuccess: false,
        error: {
            cCode: "50000",
            cMessage: "Error interno del servidor",
            cTechnicalDetails: err.message
        },
    });
};