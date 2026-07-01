// src/infrastructure/http/routes/user.routes.ts
import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { validateUserRegister } from "../middlewares/user-validator.middleware";

const router = Router();

// Aquí definimos las rutas que empiezan con /user o /auth
router.post("/login", login);
router.post("/register", validateUserRegister, register);

export default router;