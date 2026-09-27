import { Router } from "express";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
} from "../controllers/usuario.controller.js";
import { verificarToken, verificarRol } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", verificarRol("Administrador"), crear);
router.put("/:id", verificarRol("Administrador"), actualizar);
router.delete("/:id", verificarRol("Administrador"), eliminar);

export default router;
