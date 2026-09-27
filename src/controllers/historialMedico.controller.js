import HistorialMedico from "../models/historialMedico.model.js";

export const listar = async (req, res, next) => {
  try {
    const historiales = await HistorialMedico.find().populate(
      "usuarioId",
      "nombreUsuario rol"
    );
    res.json({ ok: true, total: historiales.length, data: historiales });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const historial = await HistorialMedico.findById(req.params.id).populate(
      "usuarioId",
      "nombreUsuario rol"
    );
    if (!historial)
      return res.status(404).json({ ok: false, mensaje: "Historial no encontrado" });
    res.json({ ok: true, data: historial });
  } catch (error) {
    next(error);
  }
};

export const obtenerPorMascota = async (req, res, next) => {
  try {
    const historiales = await HistorialMedico.find({
      mascotaId: req.params.mascotaId,
    }).sort({ fecha: -1 });
    res.json({ ok: true, total: historiales.length, data: historiales });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const historial = await HistorialMedico.create(req.body);
    res.status(201).json({ ok: true, data: historial });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const historial = await HistorialMedico.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!historial)
      return res.status(404).json({ ok: false, mensaje: "Historial no encontrado" });
    res.json({ ok: true, data: historial });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const historial = await HistorialMedico.findByIdAndDelete(req.params.id);
    if (!historial)
      return res.status(404).json({ ok: false, mensaje: "Historial no encontrado" });
    res.json({ ok: true, mensaje: "Historial eliminado" });
  } catch (error) {
    next(error);
  }
};

// ---------- Subdocumento: Vacunas ----------

export const agregarVacuna = async (req, res, next) => {
  try {
    const historial = await HistorialMedico.findById(req.params.id);
    if (!historial)
      return res.status(404).json({ ok: false, mensaje: "Historial no encontrado" });

    historial.vacunas.push(req.body);
    await historial.save();

    res.status(201).json({ ok: true, data: historial.vacunas });
  } catch (error) {
    next(error);
  }
};
