import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Propietario from "../models/propietario.model.js";

const generarToken = (propietario) => {
  return jwt.sign(
    { id: propietario._id, nombre: propietario.nombre, tipo: "propietario" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// El cliente se registra a sí mismo
export const registrar = async (req, res, next) => {
  try {
    const { nombre, apellido, telefono, correo, password, direccion } = req.body;

    if (!nombre || !apellido || !telefono || !correo || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: "nombre, apellido, telefono, correo y password son obligatorios",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoPropietario = await Propietario.create({
      nombre,
      apellido,
      telefono,
      correo,
      direccion,
      passwordHash,
      mascotas: [],
    });

    const propietarioSinPassword = nuevoPropietario.toObject();
    delete propietarioSinPassword.passwordHash;

    res.status(201).json({ ok: true, data: propietarioSinPassword });
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

    const propietario = await Propietario.findOne({ correo }).select("+passwordHash");

    if (!propietario || !propietario.passwordHash) {
      return res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });
    }

    const passwordValido = await bcrypt.compare(password, propietario.passwordHash);

    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: "Credenciales inválidas" });
    }

    const token = generarToken(propietario);

    res.json({
      ok: true,
      token,
      propietario: {
        id: propietario._id,
        nombre: propietario.nombre,
        apellido: propietario.apellido,
        correo: propietario.correo,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const perfil = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.usuario.id);
    if (!propietario) {
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });
    }
    res.json({ ok: true, data: propietario });
  } catch (error) {
    next(error);
  }
};