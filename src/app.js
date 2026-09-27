import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import propietarioRoutes from "./routes/propietario.routes.js";
import citaRoutes from "./routes/cita.routes.js";
import consultaRoutes from "./routes/consulta.routes.js";
import historialMedicoRoutes from "./routes/historialMedico.routes.js";
import facturaRoutes from "./routes/factura.routes.js";
import catalogoRoutes from "./routes/catalogo.routes.js";

import { errorHandler, noEncontrado } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ ok: true, mensaje: " SystemVetCare funcionando correctamente" });
});

// Rutas principales
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/propietarios", propietarioRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/consultas", consultaRoutes);
app.use("/api/historiales", historialMedicoRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/catalogos", catalogoRoutes);

// 404 y manejo de errores (SIEMPRE al final)
app.use(noEncontrado);
app.use(errorHandler);

export default app;
