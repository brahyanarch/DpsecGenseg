import { Request } from 'express';
import { Usuario} from "@prisma/client";
import { User } from "../models/interface/user.interface"


// Extender la interfaz Request para incluir la propiedad 'user'
declare global {
    namespace Express {
        interface Request {
            user?: User;
            
        }
    }
}

export {};
