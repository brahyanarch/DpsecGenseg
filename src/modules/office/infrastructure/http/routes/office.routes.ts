import { Router } from "express";
import { authenticate } from "../../../../user/infrastructure/http/middlewares/auth.middleware";
import { resolveScope } from "../../../../user/infrastructure/http/middlewares/scope.middleware";
import { checkPermission } from "../../../../user/infrastructure/http/middlewares/permission.middleware";
import { OfficeController } from "../controllers/office.controller";

const router = Router();
const controller = new OfficeController();

router.post("/", controller.create);
router.get("/", authenticate, resolveScope, checkPermission("LISTAR_OFICINAS_PROPIAS"), controller.list);
router.get("/:idOficina", authenticate, resolveScope, checkPermission("VER_OFICINA_PROPIA"), controller.getById);
router.patch("/:idOficina", authenticate, resolveScope, checkPermission("EDITAR_OFICINA_PROPIA"), controller.update);

export default router;
