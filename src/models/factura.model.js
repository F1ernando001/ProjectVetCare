import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subdocumento: DetalleFactura
const detalleFacturaSchema = new Schema({
  concepto: { type: String, required: true },
  tipo: { type: String, enum: ["Producto", "Servicio"], required: true },
  referenciaId: { type: Schema.Types.ObjectId, required: true }, // apunta a Producto o Servicio
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true, min: 0 },
});

// Subdocumento: Pago
const pagoSchema = new Schema({
  monto: { type: Number, required: true, min: 0 },
  metodoPago: {
    type: String,
    enum: ["Efectivo", "Tarjeta", "Transferencia"],
    required: true,
  },
  fecha: { type: Date, default: Date.now },
  referencia: String,
});

const facturaSchema = new Schema(
  {
    propietarioId: {
      type: Schema.Types.ObjectId,
      ref: "Propietario",
      required: true,
    },
    fecha: { type: Date, default: Date.now },
    subtotal: { type: Number, required: true, default: 0 },
    impuesto: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    metodoPago: String,
    estado: {
      type: String,
      enum: ["Pendiente", "Pagada", "Anulada"],
      default: "Pendiente",
    },
    detalle: [detalleFacturaSchema],
    pagos: [pagoSchema],
  },
  { timestamps: true }
);

export default model("Factura", facturaSchema);
