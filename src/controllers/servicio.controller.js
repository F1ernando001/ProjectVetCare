import Servicio from "../models/servicio.model.js";

export const listar = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const filtro = categoria ? { categoria } : {};
    const servicios = await Servicio.find(filtro);
    res.json({ ok: true, total: servicios.length, data: servicios });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    if (!servicio) return res.status(404).json({ ok: false, mensaje: "Servicio no encontrado" });
    res.json({ ok: true, data: servicio });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const servicio = await Servicio.create(req.body);
    res.status(201).json({ ok: true, data: servicio });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!servicio) return res.status(404).json({ ok: false, mensaje: "Servicio no encontrado" });
    res.json({ ok: true, data: servicio });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const servicio = await Servicio.findByIdAndDelete(req.params.id);
    if (!servicio) return res.status(404).json({ ok: false, mensaje: "Servicio no encontrado" });
    res.json({ ok: true, mensaje: "Servicio eliminado" });
  } catch (error) {
    next(error);
  }
};