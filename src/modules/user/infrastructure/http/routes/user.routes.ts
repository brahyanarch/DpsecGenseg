// src/infrastructure/http/routes/user.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateUserRegister } from "../middlewares/user-validator.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { resolveScope } from "../middlewares/scope.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();
const authController = new AuthController();

// Aquí definimos las rutas que empiezan con /user o /auth
router.post("/login", authController.login);
router.post("/register", validateUserRegister, authController.register);
router.get("/me", authenticate, authController.me);
router.post("/switch-profile", authenticate, authController.switchProfile);
router.get("/users", authenticate, resolveScope, authController.getUsers);
router.post("/assign-role", authController.assignRole);
router.patch("/users/:idUser/status", authenticate, resolveScope, checkPermission('DESACTIVAR_USUARIO'), authController.updateUserStatus);
router.delete("/users/:idUser", authenticate, resolveScope, checkPermission('ELIMINAR_USUARIO'), authController.softDeleteUser);
router.patch("/profiles/:idUsuarioUni/status", authenticate, resolveScope, checkPermission('DESACTIVAR_USUARIO'), authController.updateProfileStatus);
router.delete("/profiles/:idUsuarioUni", authenticate, resolveScope, checkPermission('ELIMINAR_USUARIO'), authController.softDeleteProfile);

export default router;
