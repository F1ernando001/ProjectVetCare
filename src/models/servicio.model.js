import mongoose from "mongoose";

const { Schema, model } = mongoose;

const servicioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: String,
    precio: { type: Number, required: true, min: 0 },
    duracion: Number, // en minutos
    categoria: String,
  },
  { timestamps: true }
);

export default model("Servicio", servicioSchema);
