import Producto from "../models/producto.model.js";

export const listar = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const filtro = categoria ? { categoria } : {};
    const productos = await Producto.find(filtro);
    res.json({ ok: true, total: productos.length, data: productos });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    res.json({ ok: true, data: producto });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json({ ok: true, data: producto });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!producto) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    res.json({ ok: true, data: producto });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    res.json({ ok: true, mensaje: "Producto eliminado" });
  } catch (error) {
    next(error);
  }
};
