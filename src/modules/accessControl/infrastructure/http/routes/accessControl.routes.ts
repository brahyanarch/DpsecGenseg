import { Router } from "express";
import { AccessControlController } from "../controllers/accessControl.controller";

const router = Router();
const controller = new AccessControlController();

router.post("/roles", controller.createRole);
router.post("/permissions", controller.createPermission);

export default router;
