import api from "../api/axiosInstance";

export const listarPropietarios = () => api.get("/propietarios").then((res) => res.data);

export const obtenerPropietario = (id) =>
  api.get(`/propietarios/${id}`).then((res) => res.data);

export const crearPropietario = (datos) =>
  api.post("/propietarios", datos).then((res) => res.data);

export const actualizarPropietario = (id, datos) =>
  api.put(`/propietarios/${id}`, datos).then((res) => res.data);

export const eliminarPropietario = (id) =>
  api.delete(`/propietarios/${id}`).then((res) => res.data);

// ---- Mascotas (subrecurso) ----

export const listarMascotas = (propietarioId) =>
  api.get(`/propietarios/${propietarioId}/mascotas`).then((res) => res.data);

export const agregarMascota = (propietarioId, datos) =>
  api.post(`/propietarios/${propietarioId}/mascotas`, datos).then((res) => res.data);

export const actualizarMascota = (propietarioId, mascotaId, datos) =>
  api.put(`/propietarios/${propietarioId}/mascotas/${mascotaId}`, datos).then((res) => res.data);

export const eliminarMascota = (propietarioId, mascotaId) =>
  api.delete(`/propietarios/${propietarioId}/mascotas/${mascotaId}`).then((res) => res.data);
