import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert,
} from "@mui/material";
import DataTable, { EstadoChip } from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import { listarCitas, crearCita, cancelarCita } from "../../services/cita.service";
import { obtenerPerfilPropietario } from "../../services/auth.service";

const esquema = z.object({
  mascotaId: z.string().min(1, "Seleccioná una mascota"),
  fecha: z.string().min(1, "Obligatorio"),
  hora: z.string().min(1, "Obligatorio"),
  motivo: z.string().min(1, "Obligatorio"),
  tipoConsulta: z.string().min(1),
});

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { mascotaId: "", fecha: "", hora: "", motivo: "", tipoConsulta: "General" },
  });

  const cargarCitas = () => {
    setCargando(true);
    // el backend ya filtra automáticamente: solo devuelve las citas de este cliente
    listarCitas()
      .then((data) => setCitas(data.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudieron cargar tus citas"))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarCitas();
    obtenerPerfilPropietario().then((d) => setMascotas(d.data.mascotas || [])).catch(() => {});
  }, []);

  const abrirNuevo = () => {
    reset({ mascotaId: "", fecha: "", hora: "", motivo: "", tipoConsulta: "General" });
    setDialogoAbierto(true);
  };

  const onSubmit = (datos) => {
    setError("");
    // el backend fuerza el propietarioId real e ignora cualquier otro dato sensible
    crearCita(datos)
      .then(() => { setDialogoAbierto(false); cargarCitas(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo crear la cita"));
  };

  const handleCancelar = (cita) => {
    cancelarCita(cita._id).then(() => cargarCitas()).catch((err) => setError(err.response?.data?.mensaje || "No se pudo cancelar"));
  };

  const columnas = [
    { key: "fecha", label: "Fecha", render: (c) => new Date(c.fecha).toLocaleDateString() },
    { key: "hora", label: "Hora" },
    { key: "motivo", label: "Motivo" },
    { key: "veterinario", label: "Veterinario", render: (c) => c.usuarioId?.nombreUsuario || "Por asignar" },
    { key: "estado", label: "Estado", render: (c) => <EstadoChip estado={c.estado} /> },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Mis citas"
        subtitulo={mascotas.length === 0 ? "Necesitás tener al menos una mascota registrada para pedir una cita" : `${citas.length} en total`}
        textoBoton={mascotas.length > 0 ? "Pedir cita" : undefined}
        onClickBoton={abrirNuevo}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable
        columnas={columnas}
        filas={citas}
        cargando={cargando}
        onEliminar={(c) => (c.estado === "Pendiente" || c.estado === "Confirmada") ? handleCancelar(c) : undefined}
        mensajeVacio="Todavía no pediste ninguna cita."
      />

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Pedir una cita</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Controller
              name="mascotaId" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Mascota" fullWidth margin="dense"
                  error={Boolean(errors.mascotaId)} helperText={errors.mascotaId?.message}>
                  <MenuItem value="">Seleccioná una...</MenuItem>
                  {mascotas.map((m) => <MenuItem key={m._id} value={m._id}>{m.nombre}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller
              name="tipoConsulta" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Tipo de consulta" fullWidth margin="dense">
                  {["General", "Vacunacion", "Cirugia", "Emergencia", "Control"].map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField label="Fecha" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} {...register("fecha")} error={Boolean(errors.fecha)} helperText={errors.fecha?.message} />
            <TextField label="Hora" type="time" fullWidth margin="dense" InputLabelProps={{ shrink: true }} {...register("hora")} error={Boolean(errors.hora)} helperText={errors.hora?.message} />
            <TextField label="Motivo" fullWidth margin="dense" {...register("motivo")} error={Boolean(errors.motivo)} helperText={errors.motivo?.message} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoAbierto(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Pedir cita"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default MisCitas;
