import api from "../api/axiosInstance";

export const listarCitas = (filtros = {}) =>
  api.get("/citas", { params: filtros }).then((res) => res.data);

export const obtenerCita = (id) => api.get(`/citas/${id}`).then((res) => res.data);

export const crearCita = (datos) => api.post("/citas", datos).then((res) => res.data);

export const actualizarCita = (id, datos) =>
  api.put(`/citas/${id}`, datos).then((res) => res.data);

export const cambiarEstadoCita = (id, estado) =>
  api.patch(`/citas/${id}/estado`, { estado }).then((res) => res.data);

export const cancelarCita = (id) => api.delete(`/citas/${id}`).then((res) => res.data);
