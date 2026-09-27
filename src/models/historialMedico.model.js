import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subdocumento: Vacuna
const vacunaSchema = new Schema({
  nombre: { type: String, required: true },
  fechaAplicacion: { type: Date, required: true },
  proximaFecha: Date,
  lote: String,
});

const historialMedicoSchema = new Schema(
  {
    mascotaId: { type: Schema.Types.ObjectId, required: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: Date, default: Date.now },
    motivo: String,
    diagnostico: String,
    observaciones: String,
    vacunas: [vacunaSchema],
  },
  { timestamps: true }
);

historialMedicoSchema.index({ mascotaId: 1 });

export default model("HistorialMedico", historialMedicoSchema);
