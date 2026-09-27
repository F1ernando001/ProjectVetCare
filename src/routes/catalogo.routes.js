import { Router } from "express";
import * as ProductoCtrl from "../controllers/producto.controller.js";
import * as ServicioCtrl from "../controllers/servicio.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verificarToken);

// ---- Productos: /api/catalogos/productos ----
router.get("/productos", ProductoCtrl.listar);
router.get("/productos/:id", ProductoCtrl.obtener);
router.post("/productos", ProductoCtrl.crear);
router.put("/productos/:id", ProductoCtrl.actualizar);
router.delete("/productos/:id", ProductoCtrl.eliminar);

// ---- Servicios: /api/catalogos/servicios ----
router.get("/servicios", ServicioCtrl.listar);
router.get("/servicios/:id", ServicioCtrl.obtener);
router.post("/servicios", ServicioCtrl.crear);
router.put("/servicios/:id", ServicioCtrl.actualizar);
router.delete("/servicios/:id", ServicioCtrl.eliminar);

export default router;
