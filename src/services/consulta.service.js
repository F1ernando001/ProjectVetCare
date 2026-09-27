import api from "../api/axiosInstance";

export const listarConsultas = (filtros = {}) =>
  api.get("/consultas", { params: filtros }).then((res) => res.data);

export const obtenerConsulta = (id) => api.get(`/consultas/${id}`).then((res) => res.data);

export const crearConsulta = (datos) => api.post("/consultas", datos).then((res) => res.data);

export const actualizarConsulta = (id, datos) =>
  api.put(`/consultas/${id}`, datos).then((res) => res.data);

export const eliminarConsulta = (id) => api.delete(`/consultas/${id}`).then((res) => res.data);

export const agregarTratamiento = (consultaId, datos) =>
  api.post(`/consultas/${consultaId}/tratamientos`, datos).then((res) => res.data);

export const actualizarReceta = (consultaId, datos) =>
  api.put(`/consultas/${consultaId}/receta`, datos).then((res) => res.data);
