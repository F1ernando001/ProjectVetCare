import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Alert, Box, Tabs, Tab, Stack,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import DataTable, { EstadoChip } from "../components/DataTable";
import { listarCitas, crearCita, cambiarEstadoCita, cancelarCita } from "../services/cita.service";
import { listarPropietarios } from "../services/propietario.service";
import { listarUsuarios } from "../services/usuario.service";

const ESTADOS = ["Pendiente", "Confirmada", "Completada", "Cancelada"];

const esquema = z.object({
  propietarioId: z.string().min(1, "Seleccioná un propietario"),
  mascotaId: z.string().min(1, "Seleccioná una mascota"),
  usuarioId: z.string().min(1, "Seleccioná un veterinario"),
  fecha: z.string().min(1, "Obligatorio"),
  hora: z.string().min(1, "Obligatorio"),
  motivo: z.string().min(1, "Obligatorio"),
  tipoConsulta: z.string().min(1, "Obligatorio"),
});

const VACIO = { propietarioId: "", mascotaId: "", usuarioId: "", fecha: "", hora: "", motivo: "", tipoConsulta: "General" };

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");

  const { control, register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: VACIO,
  });

  const propietarioIdElegido = watch("propietarioId");
  const propietarioElegido = propietarios.find((p) => p._id === propietarioIdElegido);
  const mascotasDisponibles = propietarioElegido?.mascotas || [];

  const cargarCitas = (estado = filtroEstado) => {
    setCargando(true);
    listarCitas(estado ? { estado } : {})
      .then((data) => setCitas(data.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudieron cargar las citas"))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarCitas();
    listarPropietarios().then((d) => setPropietarios(d.data)).catch(() => {});
    listarUsuarios().then((d) => setVeterinarios(d.data.filter((u) => u.rol?.nombre === "Veterinario"))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNuevo = () => {
    reset(VACIO);
    setDialogoAbierto(true);
  };

  const onSubmit = (datos) => {
    setError("");
    crearCita(datos)
      .then(() => { setDialogoAbierto(false); cargarCitas(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo crear la cita"));
  };

  const handleCambiarEstado = (id, estado) => {
    cambiarEstadoCita(id, estado).then(() => cargarCitas()).catch((err) => setError(err.response?.data?.mensaje || "No se pudo actualizar"));
  };

  const handleCancelar = (cita) => {
    cancelarCita(cita._id).then(() => cargarCitas()).catch((err) => setError(err.response?.data?.mensaje || "No se pudo cancelar"));
  };

  const columnas = [
    { key: "fecha", label: "Fecha", render: (c) => new Date(c.fecha).toLocaleDateString() },
    { key: "hora", label: "Hora" },
    { key: "propietario", label: "Propietario", render: (c) => `${c.propietarioId?.nombre || ""} ${c.propietarioId?.apellido || ""}` },
    { key: "veterinario", label: "Veterinario", render: (c) => c.usuarioId?.nombreUsuario || "Sin asignar" },
    { key: "estado", label: "Estado", render: (c) => <EstadoChip estado={c.estado} /> },
    {
      key: "acciones2", label: "",
      render: (c) => (
        <Stack direction="row" spacing={0.5}>
          {c.estado === "Pendiente" && (
            <Button size="small" onClick={() => handleCambiarEstado(c._id, "Confirmada")}>Confirmar</Button>
          )}
          {c.estado === "Confirmada" && (
            <Button size="small" onClick={() => handleCambiarEstado(c._id, "Completada")}>Completar</Button>
          )}
          {(c.estado === "Pendiente" || c.estado === "Confirmada") && (
            <Button size="small" color="error" onClick={() => handleCancelar(c)}>Cancelar</Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader titulo="Citas" subtitulo={`${citas.length} en este filtro`} textoBoton="Nueva cita" onClickBoton={abrirNuevo} />

      <Tabs
        value={filtroEstado}
        onChange={(e, v) => { setFiltroEstado(v); cargarCitas(v); }}
        sx={{ mb: 2 }}
      >
        <Tab label="Todas" value="" />
        {ESTADOS.map((e) => <Tab key={e} label={e} value={e} />)}
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable columnas={columnas} filas={citas} cargando={cargando} mensajeVacio="No hay citas con este filtro." />

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva cita</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={0} direction={{ xs: "column", sm: "row" }} sx={{ gap: 0 }}>
              <Controller
                name="propietarioId" control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Propietario" fullWidth margin="dense"
                    error={Boolean(errors.propietarioId)} helperText={errors.propietarioId?.message}>
                    <MenuItem value="">Seleccioná uno...</MenuItem>
                    {propietarios.map((p) => <MenuItem key={p._id} value={p._id}>{p.nombre} {p.apellido}</MenuItem>)}
                  </TextField>
                )}
              />
            </Stack>

            <Controller
              name="mascotaId" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Mascota" fullWidth margin="dense" disabled={!propietarioIdElegido}
                  error={Boolean(errors.mascotaId)} helperText={errors.mascotaId?.message}>
                  <MenuItem value="">{propietarioIdElegido ? "Seleccioná una..." : "Elegí primero un propietario"}</MenuItem>
                  {mascotasDisponibles.map((m) => <MenuItem key={m._id} value={m._id}>{m.nombre}</MenuItem>)}
                </TextField>
              )}
            />

            <Controller
              name="usuarioId" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Veterinario" fullWidth margin="dense"
                  error={Boolean(errors.usuarioId)} helperText={errors.usuarioId?.message}>
                  <MenuItem value="">Seleccioná uno...</MenuItem>
                  {veterinarios.map((v) => <MenuItem key={v._id} value={v._id}>{v.nombreUsuario}</MenuItem>)}
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

            <TextField
              label="Fecha" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
              {...register("fecha")} error={Boolean(errors.fecha)} helperText={errors.fecha?.message}
            />
            <TextField
              label="Hora" type="time" fullWidth margin="dense" InputLabelProps={{ shrink: true }}
              {...register("hora")} error={Boolean(errors.hora)} helperText={errors.hora?.message}
            />
            <TextField
              label="Motivo" fullWidth margin="dense"
              {...register("motivo")} error={Boolean(errors.motivo)} helperText={errors.motivo?.message}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoAbierto(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Crear cita"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Citas;
