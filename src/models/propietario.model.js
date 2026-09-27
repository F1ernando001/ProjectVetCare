import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subdocumento: Especie
const especieSchema = new Schema(
  {
    nombre: { type: String, required: true },
    descripcion: String,
    tipoAnimal: String,
    esperanzaVida: Number,
  },
  { _id: false }
);

// Subdocumento: Raza
const razaSchema = new Schema(
  {
    nombre: { type: String, required: true },
    tamano: String,
    pesoPromedio: Number,
  },
  { _id: false }
);

// Subdocumento: Mascota (SÍ lleva _id propio porque Citas/Consultas la referencian por mascotaId)
const mascotaSchema = new Schema({
  nombre: { type: String, required: true },
  sexo: { type: String, enum: ["Macho", "Hembra"] },
  fechaNacimiento: Date,
  peso: Number,
  estado: { type: String, enum: ["Activo", "Inactivo"], default: "Activo" },
  especie: especieSchema,
  raza: razaSchema,
});

const propietarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    telefono: { type: String, required: true },
    correo: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false }, // permite login del cliente (opcional: el staff puede crear un propietario sin cuenta)
    direccion: String,
    estado: { type: String, enum: ["Activo", "Inactivo"], default: "Activo" },
    mascotas: [mascotaSchema],
  },
  { timestamps: true }
);

export default model("Propietario", propietarioSchema);
