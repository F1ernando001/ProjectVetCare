import api from "../api/axiosInstance";

export const listarUsuarios = () => api.get("/usuarios").then((res) => res.data);

export const obtenerUsuario = (id) => api.get(`/usuarios/${id}`).then((res) => res.data);

export const crearUsuario = (datos) => api.post("/usuarios", datos).then((res) => res.data);

export const actualizarUsuario = (id, datos) =>
  api.put(`/usuarios/${id}`, datos).then((res) => res.data);

export const eliminarUsuario = (id) => api.delete(`/usuarios/${id}`).then((res) => res.data);
