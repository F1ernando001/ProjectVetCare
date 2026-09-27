import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, mensaje: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // { id, rol, nombreUsuario }
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, mensaje: "Token inválido o expirado" });
  }
};

// Uso: verificarRol("Administrador", "Veterinario")
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ ok: false, mensaje: "No tienes permisos para esta acción" });
    }
    next();
  };
};

// Permite el paso solo a personal de la clínica (token de Usuario: Admin/Veterinario/Recepcionista...)
export const verificarStaff = (req, res, next) => {
  if (!req.usuario || req.usuario.tipo !== "usuario") {
    return res
      .status(403)
      .json({ ok: false, mensaje: "Solo el personal de la clínica puede realizar esta acción" });
  }
  next();
};

// Permite el paso solo a clientes (token de Propietario)
export const verificarPropietario = (req, res, next) => {
  if (!req.usuario || req.usuario.tipo !== "propietario") {
    return res
      .status(403)
      .json({ ok: false, mensaje: "Solo clientes registrados pueden realizar esta acción" });
  }
  next();
};