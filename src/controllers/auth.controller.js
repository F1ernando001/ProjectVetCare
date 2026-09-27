import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.model.js";

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol.nombre,
      tipo: "usuario", // distingue el token de staff del token de Propietario (cliente)
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

export const registrar = async (req, res, next) => {
  try {
    const { nombreUsuario, correo, password, rol, especialidad } = req.body;

    if (!nombreUsuario || !correo || !password || !rol) {
      return res.status(400).json({
        ok: false,
        mensaje: "nombreUsuario, correo, password y rol son obligatorios",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombreUsuario,
      correo,
      passwordHash,
      rol,
      especialidad,
    });

    const usuarioSinPassword = nuevoUsuario.toObject();
    delete usuarioSinPassword.passwordHash;

    res.status(201).json({ ok: true, data: usuarioSinPassword });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, mensaje: "correo y password son obligatorios" });
    }

    const usuario = await Usuario.findOne({ correo }).select("+passwordHash");

    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(usuario);

    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const perfil = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: "Usuario no encontrado" });
    }
    res.json({ ok: true, data: usuario });
  } catch (error) {
    next(error);
  }
};
