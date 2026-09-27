import axios from "axios";
import { obtenerToken } from "../utils/authStorage";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Agrega el token guardado (staff o cliente) a cada request automáticamente
api.interceptors.request.use((config) => {
  const token = obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
