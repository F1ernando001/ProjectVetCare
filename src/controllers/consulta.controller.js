import Consulta from "../models/consulta.model.js";

export const listar = async (req, res, next) => {
  try {
    const { mascotaId, usuarioId } = req.query;
    const filtro = {};
    if (mascotaId) filtro.mascotaId = mascotaId;
    if (usuarioId) filtro.usuarioId = usuarioId;

    const consultas = await Consulta.find(filtro)
      .populate("citaId")
      .populate("usuarioId", "nombreUsuario rol")
      .sort({ fecha: -1 });

    res.json({ ok: true, total: consultas.length, data: consultas });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const consulta = await Consulta.findById(req.params.id)
      .populate("citaId")
      .populate("usuarioId", "nombreUsuario rol");
    if (!consulta) return res.status(404).json({ ok: false, mensaje: "Consulta no encontrada" });
    res.json({ ok: true, data: consulta });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const consulta = await Consulta.create(req.body);
    res.status(201).json({ ok: true, data: consulta });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const consulta = await Consulta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!consulta) return res.status(404).json({ ok: false, mensaje: "Consulta no encontrada" });
    res.json({ ok: true, data: consulta });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const consulta = await Consulta.findByIdAndDelete(req.params.id);
    if (!consulta) return res.status(404).json({ ok: false, mensaje: "Consulta no encontrada" });
    res.json({ ok: true, mensaje: "Consulta eliminada" });
  } catch (error) {
    next(error);
  }
};

// ---------- Subdocumento: Tratamientos ----------

export const agregarTratamiento = async (req, res, next) => {
  try {
    const consulta = await Consulta.findById(req.params.id);
    if (!consulta) return res.status(404).json({ ok: false, mensaje: "Consulta no encontrada" });

    consulta.tratamientos.push(req.body);
    await consulta.save();

    res.status(201).json({ ok: true, data: consulta.tratamientos });
  } catch (error) {
    next(error);
  }
};

// ---------- Subdocumento: Receta ----------

export const actualizarReceta = async (req, res, next) => {
  try {
    const consulta = await Consulta.findByIdAndUpdate(
      req.params.id,
      { receta: req.body },
      { new: true, runValidators: true }
    );
    if (!consulta) return res.status(404).json({ ok: false, mensaje: "Consulta no encontrada" });

    res.json({ ok: true, data: consulta.receta });
  } catch (error) {
    next(error);
  }
};
