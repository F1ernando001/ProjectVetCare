import Factura from "../models/factura.model.js";

const calcularTotales = (detalle, tasaImpuesto = 0.13) => {
  const subtotal = detalle.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
  const impuesto = Number((subtotal * tasaImpuesto).toFixed(2));
  const total = Number((subtotal + impuesto).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), impuesto, total };
};

export const listar = async (req, res, next) => {
  try {
    const { estado, propietarioId } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (propietarioId) filtro.propietarioId = propietarioId;

    const facturas = await Factura.find(filtro).populate(
      "propietarioId",
      "nombre apellido telefono"
    );
    res.json({ ok: true, total: facturas.length, data: facturas });
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const factura = await Factura.findById(req.params.id).populate(
      "propietarioId",
      "nombre apellido telefono"
    );
    if (!factura) return res.status(404).json({ ok: false, mensaje: "Factura no encontrada" });
    res.json({ ok: true, data: factura });
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { detalle = [] } = req.body;
    const totales = calcularTotales(detalle);

    const factura = await Factura.create({ ...req.body, ...totales });
    res.status(201).json({ ok: true, data: factura });
  } catch (error) {
    next(error);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const cambios = { ...req.body };

    if (cambios.detalle) {
      Object.assign(cambios, calcularTotales(cambios.detalle));
    }

    const factura = await Factura.findByIdAndUpdate(req.params.id, cambios, {
      new: true,
      runValidators: true,
    });
    if (!factura) return res.status(404).json({ ok: false, mensaje: "Factura no encontrada" });
    res.json({ ok: true, data: factura });
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const factura = await Factura.findByIdAndUpdate(
      req.params.id,
      { estado: "Anulada" },
      { new: true }
    );
    if (!factura) return res.status(404).json({ ok: false, mensaje: "Factura no encontrada" });
    res.json({ ok: true, mensaje: "Factura anulada", data: factura });
  } catch (error) {
    next(error);
  }
};

// ---------- Subdocumento: Pagos ----------

export const agregarPago = async (req, res, next) => {
  try {
    const factura = await Factura.findById(req.params.id);
    if (!factura) return res.status(404).json({ ok: false, mensaje: "Factura no encontrada" });

    factura.pagos.push(req.body);

    const totalPagado = factura.pagos.reduce((acc, p) => acc + p.monto, 0);
    if (totalPagado >= factura.total) {
      factura.estado = "Pagada";
    }

    await factura.save();

    res.status(201).json({ ok: true, data: factura });
  } catch (error) {
    next(error);
  }
};
