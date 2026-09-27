import mongoose from "mongoose";

const { Schema, model } = mongoose;

const citaSchema = new Schema(
  {
    propietarioId: {
      type: Schema.Types.ObjectId,
      ref: "Propietario",
      required: true,
    },
    mascotaId: { type: Schema.Types.ObjectId, required: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario" }, // veterinario asignado (lo asigna el staff; puede quedar sin asignar si la creó el cliente)
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    motivo: { type: String, required: true },
    tipoConsulta: {
      type: String,
      enum: ["General", "Vacunacion", "Cirugia", "Emergencia", "Control"],
      default: "General",
    },
    estado: {
      type: String,
      enum: ["Pendiente", "Confirmada", "Cancelada", "Completada"],
      default: "Pendiente",
    },
  },
  { timestamps: true }
);

citaSchema.index({ fecha: 1, estado: 1 });

export default model("Cita", citaSchema);
