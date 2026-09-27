import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Box, Chip, List, ListItem, ListItemText, IconButton, MenuItem, Typography, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  listarPropietarios, crearPropietario, actualizarPropietario, eliminarPropietario,
  agregarMascota, eliminarMascota,
} from "../services/propietario.service";

const esquemaMascota = z.object({
  nombre: z.string().min(1, "Obligatorio"),
  sexo: z.string().min(1, "Obligatorio"),
  especieNombre: z.string().min(1, "Obligatorio"),
  razaNombre: z.string().optional(),
  peso: z.string().optional(),
});

const esquema = z.object({
  nombre: z.string().min(1, "Obligatorio"),
  apellido: z.string().min(1, "Obligatorio"),
  telefono: z.string().min(1, "Obligatorio"),
  correo: z.string().email("Correo inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
});

const VACIO = { nombre: "", apellido: "", telefono: "", correo: "", direccion: "" };

const Propietarios = () => {
  const [propietarios, setPropietarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const [propietarioMascotas, setPropietarioMascotas] = useState(null); // propietario con dialogo de mascotas abierto
  const [errorMascota, setErrorMascota] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: VACIO,
  });

  const {
    register: registerMascota, handleSubmit: handleSubmitMascota, reset: resetMascota,
    formState: { errors: erroresMascota, isSubmitting: guardandoMascota },
  } = useForm({ resolver: zodResolver(esquemaMascota), defaultValues: { nombre: "", sexo: "", especieNombre: "", razaNombre: "", peso: "" } });

  const cargar = () => {
    setCargando(true);
    listarPropietarios()
      .then((data) => setPropietarios(data.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudieron cargar los propietarios"))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const abrirNuevo = () => {
    setEditando(null);
    reset(VACIO);
    setDialogoAbierto(true);
  };

  const abrirEdicion = (p) => {
    setEditando(p);
    reset({ nombre: p.nombre, apellido: p.apellido, telefono: p.telefono, correo: p.correo || "", direccion: p.direccion || "" });
    setDialogoAbierto(true);
  };

  const onSubmit = (datos) => {
    setError("");
    const peticion = editando ? actualizarPropietario(editando._id, datos) : crearPropietario(datos);
    peticion
      .then(() => { setDialogoAbierto(false); cargar(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo guardar el propietario"));
  };

  const confirmarEliminar = () => {
    setEliminando(true);
    eliminarPropietario(aEliminar._id)
      .then(() => { setAEliminar(null); cargar(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo eliminar"))
      .finally(() => setEliminando(false));
  };

  const columnas = [
    { key: "nombre", label: "Nombre", render: (p) => `${p.nombre} ${p.apellido}` },
    { key: "telefono", label: "Teléfono" },
    { key: "correo", label: "Correo", render: (p) => p.correo || "—" },
    {
      key: "mascotas",
      label: "Mascotas",
      render: (p) => (
        <Chip
          label={`${p.mascotas?.length || 0} mascota(s)`}
          size="small"
          onClick={() => { setPropietarioMascotas(p); setErrorMascota(""); resetMascota(); }}
          clickable
        />
      ),
    },
  ];

  const propietarioActualizado = propietarios.find((p) => p._id === propietarioMascotas?._id) || propietarioMascotas;

  const onSubmitMascota = (datos) => {
    setErrorMascota("");
    const payload = {
      nombre: datos.nombre,
      sexo: datos.sexo,
      peso: datos.peso ? Number(datos.peso) : undefined,
      especie: { nombre: datos.especieNombre },
      raza: datos.razaNombre ? { nombre: datos.razaNombre } : undefined,
    };
    agregarMascota(propietarioMascotas._id, payload)
      .then(() => {
        resetMascota();
        cargar();
        setPropietarioMascotas(null);
      })
      .catch((err) => setErrorMascota(err.response?.data?.mensaje || "No se pudo agregar la mascota"));
  };

  const quitarMascota = (mascotaId) => {
    eliminarMascota(propietarioMascotas._id, mascotaId)
      .then(cargar)
      .catch((err) => setErrorMascota(err.response?.data?.mensaje || "No se pudo quitar la mascota"));
  };

  return (
    <Box>
      <PageHeader titulo="Propietarios" subtitulo={`${propietarios.length} registrados`} textoBoton="Nuevo propietario" onClickBoton={abrirNuevo} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable columnas={columnas} filas={propietarios} cargando={cargando} onEditar={abrirEdicion} onEliminar={setAEliminar} mensajeVacio="No hay propietarios registrados." />

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editando ? "Editar propietario" : "Nuevo propietario"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <TextField label="Nombre" fullWidth margin="dense" {...register("nombre")} error={Boolean(errors.nombre)} helperText={errors.nombre?.message} />
            <TextField label="Apellido" fullWidth margin="dense" {...register("apellido")} error={Boolean(errors.apellido)} helperText={errors.apellido?.message} />
            <TextField label="Teléfono" fullWidth margin="dense" {...register("telefono")} error={Boolean(errors.telefono)} helperText={errors.telefono?.message} />
            <TextField label="Correo" fullWidth margin="dense" {...register("correo")} error={Boolean(errors.correo)} helperText={errors.correo?.message} />
            <TextField label="Dirección" fullWidth margin="dense" {...register("direccion")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoAbierto(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        abierto={Boolean(aEliminar)}
        titulo="Desactivar propietario"
        mensaje={`¿Seguro que querés desactivar a "${aEliminar?.nombre} ${aEliminar?.apellido}"?`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
        cargando={eliminando}
      />

      <Dialog open={Boolean(propietarioMascotas)} onClose={() => setPropietarioMascotas(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Mascotas de {propietarioMascotas?.nombre}</DialogTitle>
        <DialogContent>
          {errorMascota && <Alert severity="error" sx={{ mb: 2 }}>{errorMascota}</Alert>}

          <List dense>
            {(propietarioActualizado?.mascotas || []).map((m) => (
              <ListItem
                key={m._id}
                secondaryAction={
                  <IconButton edge="end" size="small" color="error" onClick={() => quitarMascota(m._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText primary={m.nombre} secondary={`${m.especie?.nombre || ""} · ${m.raza?.nombre || "sin raza"}`} />
              </ListItem>
            ))}
            {(propietarioActualizado?.mascotas || []).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                Todavía no tiene mascotas.
              </Typography>
            )}
          </List>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Agregar mascota</Typography>

          <Box component="form" onSubmit={handleSubmitMascota(onSubmitMascota)} noValidate>
            <TextField label="Nombre" fullWidth margin="dense" size="small" {...registerMascota("nombre")} error={Boolean(erroresMascota.nombre)} helperText={erroresMascota.nombre?.message} />
            <TextField select label="Sexo" fullWidth margin="dense" size="small" defaultValue="" {...registerMascota("sexo")} error={Boolean(erroresMascota.sexo)} helperText={erroresMascota.sexo?.message}>
              <MenuItem value="Macho">Macho</MenuItem>
              <MenuItem value="Hembra">Hembra</MenuItem>
            </TextField>
            <TextField label="Especie (ej. Perro, Gato)" fullWidth margin="dense" size="small" {...registerMascota("especieNombre")} error={Boolean(erroresMascota.especieNombre)} helperText={erroresMascota.especieNombre?.message} />
            <TextField label="Raza" fullWidth margin="dense" size="small" {...registerMascota("razaNombre")} />
            <TextField label="Peso (kg)" type="number" fullWidth margin="dense" size="small" {...registerMascota("peso")} />
            <Button type="submit" variant="outlined" fullWidth disabled={guardandoMascota} sx={{ mt: 1 }}>
              {guardandoMascota ? "Agregando..." : "Agregar mascota"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropietarioMascotas(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Propietarios;
