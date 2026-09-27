import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subdocumento: Rol
const rolSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: String,
    nivelAcceso: Number,
    permisos: [String],
  },
  { _id: false }
);

// Subdocumento: Especialidad
const especialidadSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: String,
    duracionConsulta: Number,
    costoBase: Number,
  },
  { _id: false }
);

const usuarioSchema = new Schema(
  {
    nombreUsuario: { type: String, required: true, unique: true, trim: true },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    fechaRegistro: { type: Date, default: Date.now },
    estado: { type: String, enum: ["Activo", "Inactivo"], default: "Activo" },
    rol: { type: rolSchema, required: true },
    especialidad: especialidadSchema, // opcional (solo aplica a veterinarios)
  },
  { timestamps: true }
);

export default model("Usuario", usuarioSchema);
