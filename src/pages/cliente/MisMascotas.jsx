import { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Alert, Chip } from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import { obtenerPerfilPropietario } from "../../services/auth.service";

const MisMascotas = () => {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerPerfilPropietario()
      .then((data) => setPerfil(data.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo cargar tu información"))
      .finally(() => setCargando(false));
  }, []);

  const mascotas = perfil?.mascotas || [];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>Mis mascotas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Si necesitás registrar una mascota nueva, pedíselo al personal de la clínica en tu próxima visita.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cargando ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : mascotas.length === 0 ? (
        <Alert severity="info">Todavía no tenés mascotas registradas.</Alert>
      ) : (
        <Grid container spacing={2}>
          {mascotas.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m._id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <PetsIcon color="primary" />
                    <Typography variant="h6">{m.nombre}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {m.especie?.nombre || "—"} · {m.raza?.nombre || "sin raza"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {m.sexo} {m.peso ? `· ${m.peso} kg` : ""}
                  </Typography>
                  <Chip label={m.estado} size="small" sx={{ mt: 1 }} color={m.estado === "Activo" ? "success" : "default"} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MisMascotas;
