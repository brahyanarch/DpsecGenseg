import { Router } from "express";
import { AccessControlController } from "../controllers/accessControl.controller";
import { authenticate } from "../../../../user/infrastructure/http/middlewares/auth.middleware";
import { resolveScope } from "../../../../user/infrastructure/http/middlewares/scope.middleware";
import { checkPermission } from "../../../../user/infrastructure/http/middlewares/permission.middleware";

const router = Router();
const controller = new AccessControlController();

router.get("/roles", authenticate, resolveScope, checkPermission('VER_ROLES'), controller.getRoles);
router.post("/roles", controller.createRole);
router.post("/permissions", controller.createPermission);

export default router;
