import { Request } from 'express';

// Extender la interfaz Request para incluir la propiedad 'user'
declare global {
    namespace Express {
        interface Request {
            user?: {
                dni: string;
                n_usu: string;
                estado: boolean;
                rol_id: number;
                subunidad_id_subuni: number;
                [key: string]: any; // Si tienes más campos dinámicos
            };
        }
    }
}
