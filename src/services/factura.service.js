import api from "../api/axiosInstance";

export const listarFacturas = (filtros = {}) =>
  api.get("/facturas", { params: filtros }).then((res) => res.data);

export const obtenerFactura = (id) => api.get(`/facturas/${id}`).then((res) => res.data);

export const crearFactura = (datos) => api.post("/facturas", datos).then((res) => res.data);

export const actualizarFactura = (id, datos) =>
  api.put(`/facturas/${id}`, datos).then((res) => res.data);

export const agregarPago = (facturaId, datos) =>
  api.post(`/facturas/${facturaId}/pagos`, datos).then((res) => res.data);

export const anularFactura = (id) => api.delete(`/facturas/${id}`).then((res) => res.data);
