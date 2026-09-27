import Propietario from "../models/propietario.model.js";

// ---------- CRUD Propietario ----------

export const listar = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const filtro = estado ? { estado } : {};
    const propietarios = await Propietario.find(filtro);
    res.json({ ok: true, total: propietarios.length, data: propietarios });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.params.id);
    if (!propietario)
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });
    res.json({ ok: true, data: propietario });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const propietario = await Propietario.create(req.body);
    res.status(201).json({ ok: true, data: propietario });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const propietario = await Propietario.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!propietario)
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });
    res.json({ ok: true, data: propietario });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const propietario = await Propietario.findByIdAndUpdate(
      req.params.id,
      { estado: "Inactivo" },
      { new: true }
    );
    if (!propietario)
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });
    res.json({ ok: true, mensaje: "Propietario desactivado", data: propietario });
  } catch (error) {
    next(error);
  }
};

// ---------- Subdocumento: Mascotas ----------

export const listarMascotas = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.params.id);
    if (!propietario)
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });
    res.json({ ok: true, data: propietario.mascotas });
  } catch (error) {
    next(error);
  }
};

export const agregarMascota = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.params.id);
    if (!propietario)
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });

    propietario.mascotas.push(req.body);
    await propietario.save();

    const nuevaMascota = propietario.mascotas[propietario.mascotas.length - 1];
    res.status(201).json({ ok: true, data: nuevaMascota });
  } catch (error) {
    next(error);
  }
};

export const actualizarMascota = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.params.id);
    if (!propietario)
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });

    const mascota = propietario.mascotas.id(req.params.mascotaId);
    if (!mascota) return res.status(404).json({ ok: false, mensaje: "Mascota no encontrada" });

    mascota.set(req.body);
    await propietario.save();

    res.json({ ok: true, data: mascota });
  } catch (error) {
    next(error);
  }
};

export const eliminarMascota = async (req, res, next) => {
  try {
    const propietario = await Propietario.findById(req.params.id);
    if (!propietario)
      return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });

    const mascota = propietario.mascotas.id(req.params.mascotaId);
    if (!mascota) return res.status(404).json({ ok: false, mensaje: "Mascota no encontrada" });

    mascota.estado = "Inactivo";
    await propietario.save();

    res.json({ ok: true, mensaje: "Mascota desactivada" });
  } catch (error) {
    next(error);
  }
};