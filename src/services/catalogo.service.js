import api from "../api/axiosInstance";

// ---- Productos ----
export const listarProductos = () => api.get("/catalogos/productos").then((res) => res.data);
export const crearProducto = (datos) =>
  api.post("/catalogos/productos", datos).then((res) => res.data);
export const actualizarProducto = (id, datos) =>
  api.put(`/catalogos/productos/${id}`, datos).then((res) => res.data);
export const eliminarProducto = (id) =>
  api.delete(`/catalogos/productos/${id}`).then((res) => res.data);

// ---- Servicios ----
export const listarServicios = () => api.get("/catalogos/servicios").then((res) => res.data);
export const crearServicio = (datos) =>
  api.post("/catalogos/servicios", datos).then((res) => res.data);
export const actualizarServicio = (id, datos) =>
  api.put(`/catalogos/servicios/${id}`, datos).then((res) => res.data);
export const eliminarServicio = (id) =>
  api.delete(`/catalogos/servicios/${id}`).then((res) => res.data);
