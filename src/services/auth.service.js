import api from "../api/axiosInstance";

export const loginStaff = (correo, password) =>
  api.post("/auth/login", { correo, password }).then((res) => res.data);

export const loginPropietario = (correo, password) =>
  api.post("/auth/propietario/login", { correo, password }).then((res) => res.data);

export const registrarPropietario = (datos) =>
  api.post("/auth/propietario/registro", datos).then((res) => res.data);

export const obtenerPerfil = () => api.get("/auth/perfil").then((res) => res.data);

export const obtenerPerfilPropietario = () =>
  api.get("/auth/propietario/perfil").then((res) => res.data);
