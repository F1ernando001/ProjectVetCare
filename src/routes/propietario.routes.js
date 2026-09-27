import { Router } from "express";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  listarMascotas,
  agregarMascota,
  actualizarMascota,
  eliminarMascota,
} from "../controllers/propietario.controller.js";
import { verificarToken, verificarStaff } from "../middlewares/auth.middleware.js";

const router = Router();

// Exclusivo del staff: un cliente NO puede ver ni editar otros propietarios por acá.
// El cliente gestiona su propia cuenta vía /api/auth/propietario/*
router.use(verificarToken, verificarStaff);

// CRUD Propietario
router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

// Subrecurso: Mascotas
router.get("/:id/mascotas", listarMascotas);
router.post("/:id/mascotas", agregarMascota);
router.put("/:id/mascotas/:mascotaId", actualizarMascota);
router.delete("/:id/mascotas/:mascotaId", eliminarMascota);

export default router;