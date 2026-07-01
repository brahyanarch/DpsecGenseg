// src/infrastructure/http/routes/user.routes.ts
import { Router } from "express";
import { login, register } from "../controllers/auth.controller";

const router = Router();

// Aquí definimos las rutas que empiezan con /user o /auth
router.post("/login", login);
router.post("/register", register);

export default router;