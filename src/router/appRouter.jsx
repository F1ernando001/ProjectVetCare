import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StaffLayout from "../components/layout/StaffLayout";
import ClienteLayout from "../components/layout/ClienteLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Propietarios from "../pages/Propietarios";
import Citas from "../pages/Citas";
import Consultas from "../pages/Consultas";
import Catalogos from "../pages/Catalogos";
import Facturas from "../pages/Facturas";

import MisMascotas from "../pages/cliente/MisMascotas";
import MisCitas from "../pages/cliente/MisCitas";

import { esStaff, esCliente } from "../utils/authStorage";

const RutaStaff = ({ children }) => (esStaff() ? children : <Navigate to="/login" replace />);
const RutaCliente = ({ children }) => (esCliente() ? children : <Navigate to="/login" replace />);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Ruta antigua del portal de clientes: redirige al login único */}
        <Route path="/login-cliente" element={<Navigate to="/login" replace />} />

        {/* ---- Panel de staff (Administrador / Veterinario) ---- */}
        <Route
          element={
            <RutaStaff>
              <StaffLayout />
            </RutaStaff>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/propietarios" element={<Propietarios />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/catalogos" element={<Catalogos />} />
          <Route path="/facturas" element={<Facturas />} />
        </Route>

        {/* ---- Portal del cliente (Propietario) ---- */}
        <Route
          element={
            <RutaCliente>
              <ClienteLayout />
            </RutaCliente>
          }
        >
          <Route path="/portal/mascotas" element={<MisMascotas />} />
          <Route path="/portal/citas" element={<MisCitas />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
