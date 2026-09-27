// Middleware centralizado de manejo de errores.
// Se coloca AL FINAL, después de todas las rutas.
export const errorHandler = (err, req, res, next) => {
  console.error("❌", err.message);

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const errores = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ ok: false, mensaje: "Error de validación", errores });
  }

  // Id con formato inválido
  if (err.name === "CastError") {
    return res.status(400).json({ ok: false, mensaje: `ID inválido: ${err.value}` });
  }

  // Clave duplicada (unique)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res
      .status(409)
      .json({ ok: false, mensaje: `El valor de '${campo}' ya está en uso` });
  }

  return res.status(err.status || 500).json({
    ok: false,
    mensaje: err.message || "Error interno del servidor",
  });
};

// Middleware para rutas no encontradas
export const noEncontrado = (req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.originalUrl}` });
};
