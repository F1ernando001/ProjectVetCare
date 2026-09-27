import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Alert, Box,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import DataTable, { EstadoChip } from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario,
} from "../services/usuario.service";

const ROLES = ["Administrador", "Veterinario", "Recepcionista"];

const esquemaBase = {
  nombreUsuario: z.string().min(1, "Obligatorio"),
  correo: z.string().min(1, "Obligatorio").email("Correo inválido"),
  rolNombre: z.string().min(1, "Seleccioná un rol"),
};

const esquemaCrear = z.object({ ...esquemaBase, password: z.string().min(6, "Mínimo 6 caracteres") });
const esquemaEditar = z.object(esquemaBase);

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [editando, setEditando] = useState(null); // objeto usuario o null
  const [aEliminar, setAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const esEdicion = Boolean(editando);

  const {
    control, register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esEdicion ? esquemaEditar : esquemaCrear),
    defaultValues: { nombreUsuario: "", correo: "", rolNombre: "Veterinario", password: "" },
  });

  const cargar = () => {
    setCargando(true);
    listarUsuarios()
      .then((data) => setUsuarios(data.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudieron cargar los usuarios"))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const abrirNuevo = () => {
    setEditando(null);
    reset({ nombreUsuario: "", correo: "", rolNombre: "Veterinario", password: "" });
    setDialogoAbierto(true);
  };

  const abrirEdicion = (u) => {
    setEditando(u);
    reset({ nombreUsuario: u.nombreUsuario, correo: u.correo, rolNombre: u.rol?.nombre || "Veterinario", password: "" });
    setDialogoAbierto(true);
  };

  const onSubmit = (datos) => {
    setError("");
    const payload = {
      nombreUsuario: datos.nombreUsuario,
      correo: datos.correo,
      rol: { nombre: datos.rolNombre },
    };
    if (datos.password) payload.password = datos.password;

    const peticion = esEdicion ? actualizarUsuario(editando._id, payload) : crearUsuario(payload);

    peticion
      .then(() => {
        setDialogoAbierto(false);
        cargar();
      })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo guardar el usuario"));
  };

  const confirmarEliminar = () => {
    setEliminando(true);
    eliminarUsuario(aEliminar._id)
      .then(() => {
        setAEliminar(null);
        cargar();
      })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo eliminar"))
      .finally(() => setEliminando(false));
  };

  const columnas = [
    { key: "nombreUsuario", label: "Usuario" },
    { key: "correo", label: "Correo" },
    { key: "rol", label: "Rol", render: (u) => u.rol?.nombre },
    { key: "estado", label: "Estado", render: (u) => <EstadoChip estado={u.estado} /> },
  ];

  return (
    <Box>
      <PageHeader titulo="Usuarios" subtitulo={`${usuarios.length} registrados`} textoBoton="Nuevo usuario" onClickBoton={abrirNuevo} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable
        columnas={columnas}
        filas={usuarios}
        cargando={cargando}
        onEditar={abrirEdicion}
        onEliminar={setAEliminar}
        mensajeVacio="No hay usuarios registrados."
      />

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{esEdicion ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <TextField
              label="Nombre de usuario" fullWidth margin="dense"
              {...register("nombreUsuario")}
              error={Boolean(errors.nombreUsuario)} helperText={errors.nombreUsuario?.message}
            />
            <TextField
              label="Correo" fullWidth margin="dense"
              {...register("correo")}
              error={Boolean(errors.correo)} helperText={errors.correo?.message}
            />
            <Controller
              name="rolNombre"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Rol" fullWidth margin="dense">
                  {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              )}
            />
            {!esEdicion && (
              <TextField
                label="Contraseña"
                type="password" fullWidth margin="dense"
                {...register("password")}
                error={Boolean(errors.password)} helperText={errors.password?.message}
              />
            )}
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
        titulo="Desactivar usuario"
        mensaje={`¿Seguro que querés desactivar a "${aEliminar?.nombreUsuario}"?`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
        cargando={eliminando}
      />
    </Box>
  );
};

export default Usuarios;
