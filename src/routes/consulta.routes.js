import { Router } from "express";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  agregarTratamiento,
  actualizarReceta,
} from "../controllers/consulta.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

// Subrecursos
router.post("/:id/tratamientos", agregarTratamiento);
router.put("/:id/receta", actualizarReceta);

export default router;
