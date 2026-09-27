import { Router } from "express";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  agregarPago,
} from "../controllers/factura.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

// Subrecurso: Pagos
router.post("/:id/pagos", agregarPago);

export default router;
