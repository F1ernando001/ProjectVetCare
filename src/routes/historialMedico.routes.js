import { Router } from "express";
import {
  listar,
  obtener,
  obtenerPorMascota,
  crear,
  actualizar,
  eliminar,
  agregarVacuna,
} from "../controllers/historialMedico.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);

router.get("/", listar);
router.get("/mascota/:mascotaId", obtenerPorMascota);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

// Subrecurso: Vacunas
router.post("/:id/vacunas", agregarVacuna);

export default router;
