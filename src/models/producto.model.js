import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productoSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    categoria: String,
    marca: String,
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    fechaVencimiento: Date,
  },
  { timestamps: true }
);

export default model("Producto", productoSchema);