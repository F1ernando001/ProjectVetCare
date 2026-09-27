// Maneja la sesión guardada en localStorage.
// tipo: 'usuario' (staff: admin/veterinario) o 'propietario' (cliente)

const KEY_TOKEN = "vetcare_token";
const KEY_SESION = "vetcare_sesion"; // { tipo, datos }

export const guardarSesion = (token, datos, tipo) => {
  localStorage.setItem(KEY_TOKEN, token);
  localStorage.setItem(KEY_SESION, JSON.stringify({ tipo, datos }));
};

export const obtenerToken = () => localStorage.getItem(KEY_TOKEN);

export const obtenerSesion = () => {
  const raw = localStorage.getItem(KEY_SESION);
  return raw ? JSON.parse(raw) : null;
};

export const obtenerTipoSesion = () => obtenerSesion()?.tipo || null;

export const cerrarSesion = () => {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_SESION);
};

export const haySesionActiva = () => Boolean(obtenerToken());
export const esStaff = () => obtenerTipoSesion() === "usuario";
export const esCliente = () => obtenerTipoSesion() === "propietario";
