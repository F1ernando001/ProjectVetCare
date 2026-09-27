import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Box, Alert } from "@mui/material";
import DataTable, { EstadoChip } from "../components/DataTable";
import { listarPropietarios } from "../services/propietario.service";
import { listarCitas } from "../services/cita.service";
import { listarConsultas } from "../services/consulta.service";
import { listarFacturas } from "../services/factura.service";

const Tarjeta = ({ numero, label, color = "primary.main" }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h4" fontWeight={700} color={color}>
        {numero}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ propietarios: 0, citasPendientes: 0, citasHoy: 0, consultas: 0, facturasPendientes: 0 });
  const [citasHoyLista, setCitasHoyLista] = useState([]);

  useEffect(() => {
    setCargando(true);
    setError("");
    const hoy = new Date().toISOString().slice(0, 10);

    Promise.all([
      listarPropietarios(),
      listarCitas({ estado: "Pendiente" }),
      listarCitas({ fecha: hoy }),
      listarConsultas(),
      listarFacturas({ estado: "Pendiente" }),
    ])
      .then(([propietarios, citasPendientes, citasHoy, consultas, facturasPendientes]) => {
        setStats({
          propietarios: propietarios.total,
          citasPendientes: citasPendientes.total,
          citasHoy: citasHoy.total,
          consultas: consultas.total,
          facturasPendientes: facturasPendientes.total,
        });
        setCitasHoyLista(citasHoy.data);
      })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo conectar con el servidor"))
      .finally(() => setCargando(false));
  }, []);

  const columnas = [
    { key: "hora", label: "Hora" },
    { key: "propietario", label: "Propietario", render: (c) => `${c.propietarioId?.nombre || ""} ${c.propietarioId?.apellido || ""}` },
    { key: "veterinario", label: "Veterinario", render: (c) => c.usuarioId?.nombreUsuario || "Sin asignar" },
    { key: "motivo", label: "Motivo" },
    { key: "estado", label: "Estado", render: (c) => <EstadoChip estado={c.estado} /> },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Tarjeta numero={stats.propietarios} label="Propietarios" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Tarjeta numero={stats.citasPendientes} label="Citas pendientes" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Tarjeta numero={stats.citasHoy} label="Citas de hoy" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Tarjeta numero={stats.consultas} label="Consultas totales" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Tarjeta numero={stats.facturasPendientes} label="Facturas pendientes" color="error.main" />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>Citas de hoy</Typography>
      <DataTable columnas={columnas} filas={citasHoyLista} cargando={cargando} mensajeVacio="No hay citas agendadas para hoy." />
    </Box>
  );
};

export default Dashboard;
