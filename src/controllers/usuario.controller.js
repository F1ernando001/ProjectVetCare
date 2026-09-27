import bcrypt from "bcryptjs";
import Usuario from "../models/usuario.model.js";

export const listar = async (req, res, next) => {
  try {
    const { estado, rol } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (rol) filtro["rol.nombre"] = rol;

    const usuarios = await Usuario.find(filtro);
    res.json({ ok: true, total: usuarios.length, data: usuarios });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    res.json({ ok: true, data: usuario });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { password, ...resto } = req.body;
    if (!password) {
      return res.status(400).json({ ok: false, mensaje: "password es obligatorio" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ ...resto, passwordHash });

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.passwordHash;

    res.status(201).json({ ok: true, data: usuarioSinPassword });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { password, ...resto } = req.body;
    const cambios = { ...resto };

    if (password) {
      cambios.passwordHash = await bcrypt.hash(password, 10);
    }

    const usuario = await Usuario.findByIdAndUpdate(req.params.id, cambios, {
      new: true,
      runValidators: true,
    });

    if (!usuario) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    res.json({ ok: true, data: usuario });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { estado: "Inactivo" },
      { new: true }
    );
    if (!usuario) return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    res.json({ ok: true, mensaje: "Usuario desactivado", data: usuario });
  } catch (error) {
    next(error);
  }
};
