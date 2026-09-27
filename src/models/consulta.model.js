import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subdocumento: ItemReceta
const itemRecetaSchema = new Schema(
  {
    productoId: { type: Schema.Types.ObjectId, ref: "Producto" },
    nombre: { type: String, required: true },
    dosis: String,
    instrucciones: String,
  },
  { _id: false }
);

// Subdocumento: Receta
const recetaSchema = new Schema(
  {
    fecha: { type: Date, default: Date.now },
    observaciones: String,
    medicamentos: [itemRecetaSchema],
  },
  { _id: false }
);

// Subdocumento: Tratamiento
const tratamientoSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: String,
    frecuencia: String,
    duracion: String,
    indicaciones: String,
  },
  { _id: false }
);

const consultaSchema = new Schema(
  {
    citaId: { type: Schema.Types.ObjectId, ref: "Cita", required: true },
    mascotaId: { type: Schema.Types.ObjectId, required: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: Date, default: Date.now },
    sintomas: String,
    diagnostico: String,
    observaciones: String,
    tratamientos: [tratamientoSchema],
    receta: recetaSchema,
  },
  { timestamps: true }
);

export default model("Consulta", consultaSchema);
