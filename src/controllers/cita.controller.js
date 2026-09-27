import Cita from "../models/cita.model.js";
import Propietario from "../models/propietario.model.js";

export const listar = async (req, res, next) => {
  try {
    const { fecha, estado, usuarioId, mascotaId, propietarioId } = req.query;
    const filtro = {};
    if (fecha) {
      const inicio = new Date(fecha);
      const fin = new Date(fecha);
      fin.setHours(23, 59, 59, 999);
      filtro.fecha = { $gte: inicio, $lte: fin };
    }
    if (estado) filtro.estado = estado;
    if (usuarioId) filtro.usuarioId = usuarioId;
    if (mascotaId) filtro.mascotaId = mascotaId;
    if (propietarioId) filtro.propietarioId = propietarioId;

    // Un cliente (Propietario) solo puede ver SUS PROPIAS citas, sin importar qué filtro mande
    if (req.usuario.tipo === "propietario") {
      filtro.propietarioId = req.usuario.id;
    }

    const citas = await Cita.find(filtro)
      .populate("propietarioId", "nombre apellido telefono")
      .populate("usuarioId", "nombreUsuario rol")
      .sort({ fecha: 1, hora: 1 });

    res.json({ ok: true, total: citas.length, data: citas });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const cita = await Cita.findById(req.params.id)
      .populate("propietarioId", "nombre apellido telefono")
      .populate("usuarioId", "nombreUsuario rol");
    if (!cita) return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });

    // Un cliente no puede ver citas de otros propietarios
    if (
      req.usuario.tipo === "propietario" &&
      cita.propietarioId._id.toString() !== req.usuario.id
    ) {
      return res.status(403).json({ ok: false, mensaje: "No tenés acceso a esta cita" });
    }

    res.json({ ok: true, data: cita });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const datos = { ...req.body };

    if (req.usuario.tipo === "propietario") {
      // El cliente solo puede reservar citas para SÍ MISMO y para SUS PROPIAS mascotas
      const propietario = await Propietario.findById(req.usuario.id);
      if (!propietario) {
        return res.status(404).json({ ok: false, mensaje: "Propietario no encontrado" });
      }

      const mascota = propietario.mascotas.id(datos.mascotaId);
      if (!mascota) {
        return res
          .status(403)
          .json({ ok: false, mensaje: "Esa mascota no pertenece a tu cuenta" });
      }

      datos.propietarioId = req.usuario.id; // se fuerza, ignorando lo que mande el body
      datos.estado = "Pendiente"; // toda cita creada por el cliente empieza como Pendiente
      delete datos.usuarioId; // el veterinario lo asigna el staff después
    }

    const cita = await Cita.create(datos);
    res.status(201).json({ ok: true, data: cita });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cita) return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });
    res.json({ ok: true, data: cita });
  } catch (error) {
    next(error);
  }
};

export const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["Pendiente", "Confirmada", "Cancelada", "Completada"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, mensaje: "Estado inválido" });
    }

    const cita = await Cita.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    if (!cita) return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });

    res.json({ ok: true, data: cita });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const cita = await Cita.findById(req.params.id);
    if (!cita) return res.status(404).json({ ok: false, mensaje: "Cita no encontrada" });

    // Un cliente solo puede cancelar SUS PROPIAS citas
    if (req.usuario.tipo === "propietario" && cita.propietarioId.toString() !== req.usuario.id) {
      return res.status(403).json({ ok: false, mensaje: "No podés cancelar esta cita" });
    }

    cita.estado = "Cancelada";
    await cita.save();

    res.json({ ok: true, mensaje: "Cita cancelada", data: cita });
  } catch (error) {
    next(error);
  }
};