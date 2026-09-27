import { Router } from "express";
import { registrar, login, perfil } from "../controllers/auth.controller.js";
import * as PropietarioAuth from "../controllers/propietarioAuth.controller.js";
import { verificarToken, verificarPropietario } from "../middlewares/auth.middleware.js";

const router = Router();

// ---- Auth de STAFF (Administrador, Veterinario, etc.) ----
router.post("/registro", registrar);
router.post("/login", login);
router.get("/perfil", verificarToken, perfil);

// ---- Auth de PROPIETARIOS (clientes) ----
router.post("/propietario/registro", PropietarioAuth.registrar);
router.post("/propietario/login", PropietarioAuth.login);
router.get(
  "/propietario/perfil",
  verificarToken,
  verificarPropietario,
  PropietarioAuth.perfil
);

export default router;
