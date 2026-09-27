import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, Box, Tabs, Tab } from "@mui/material";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  listarProductos, crearProducto, actualizarProducto, eliminarProducto,
  listarServicios, crearServicio, actualizarServicio, eliminarServicio,
} from "../services/catalogo.service";

const esquemaProducto = z.object({
  nombre: z.string().min(1, "Obligatorio"),
  categoria: z.string().optional(),
  marca: z.string().optional(),
  precio: z.string().min(1, "Obligatorio").refine((v) => Number(v) >= 0, "No puede ser negativo"),
  stock: z.string().min(1, "Obligatorio").refine((v) => Number(v) >= 0, "No puede ser negativo"),
  fechaVencimiento: z.string().optional(),
});

const esquemaServicio = z.object({
  nombre: z.string().min(1, "Obligatorio"),
  descripcion: z.string().optional(),
  precio: z.string().min(1, "Obligatorio").refine((v) => Number(v) >= 0, "No puede ser negativo"),
  duracion: z.string().optional().refine((v) => !v || Number(v) >= 0, "No puede ser negativo"),
  categoria: z.string().optional(),
});

const VACIO_PRODUCTO = { nombre: "", categoria: "", marca: "", precio: "", stock: "", fechaVencimiento: "" };
const VACIO_SERVICIO = { nombre: "", descripcion: "", precio: "", duracion: "", categoria: "" };

const Catalogos = () => {
  const [tab, setTab] = useState(0);

  const [productos, setProductos] = useState([]);
  const [cargandoP, setCargandoP] = useState(true);
  const [dialogoP, setDialogoP] = useState(false);
  const [editandoP, setEditandoP] = useState(null);
  const [aEliminarP, setAEliminarP] = useState(null);

  const [servicios, setServicios] = useState([]);
  const [cargandoS, setCargandoS] = useState(true);
  const [dialogoS, setDialogoS] = useState(false);
  const [editandoS, setEditandoS] = useState(null);
  const [aEliminarS, setAEliminarS] = useState(null);

  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState(false);

  const formP = useForm({ resolver: zodResolver(esquemaProducto), defaultValues: VACIO_PRODUCTO });
  const formS = useForm({ resolver: zodResolver(esquemaServicio), defaultValues: VACIO_SERVICIO });

  const cargarProductos = () => {
    setCargandoP(true);
    listarProductos().then((d) => setProductos(d.data)).catch((err) => setError(err.response?.data?.mensaje || "Error")).finally(() => setCargandoP(false));
  };
  const cargarServicios = () => {
    setCargandoS(true);
    listarServicios().then((d) => setServicios(d.data)).catch((err) => setError(err.response?.data?.mensaje || "Error")).finally(() => setCargandoS(false));
  };

  useEffect(() => { cargarProductos(); cargarServicios(); }, []);

  // ---- Productos ----
  const abrirNuevoProducto = () => { setEditandoP(null); formP.reset(VACIO_PRODUCTO); setDialogoP(true); };
  const abrirEdicionProducto = (p) => {
    setEditandoP(p);
    formP.reset({ nombre: p.nombre, categoria: p.categoria || "", marca: p.marca || "", precio: String(p.precio), stock: String(p.stock), fechaVencimiento: p.fechaVencimiento ? p.fechaVencimiento.slice(0, 10) : "" });
    setDialogoP(true);
  };
  const onSubmitProducto = (datos) => {
    setError("");
    const payload = { ...datos, precio: Number(datos.precio), stock: Number(datos.stock) };
    const peticion = editandoP ? actualizarProducto(editandoP._id, payload) : crearProducto(payload);
    peticion.then(() => { setDialogoP(false); cargarProductos(); }).catch((err) => setError(err.response?.data?.mensaje || "No se pudo guardar"));
  };
  const confirmarEliminarProducto = () => {
    setEliminando(true);
    eliminarProducto(aEliminarP._id).then(() => { setAEliminarP(null); cargarProductos(); }).finally(() => setEliminando(false));
  };

  // ---- Servicios ----
  const abrirNuevoServicio = () => { setEditandoS(null); formS.reset(VACIO_SERVICIO); setDialogoS(true); };
  const abrirEdicionServicio = (s) => {
    setEditandoS(s);
    formS.reset({ nombre: s.nombre, descripcion: s.descripcion || "", precio: String(s.precio), duracion: s.duracion ? String(s.duracion) : "", categoria: s.categoria || "" });
    setDialogoS(true);
  };
  const onSubmitServicio = (datos) => {
    setError("");
    const payload = { ...datos, precio: Number(datos.precio), duracion: datos.duracion ? Number(datos.duracion) : undefined };
    const peticion = editandoS ? actualizarServicio(editandoS._id, payload) : crearServicio(payload);
    peticion.then(() => { setDialogoS(false); cargarServicios(); }).catch((err) => setError(err.response?.data?.mensaje || "No se pudo guardar"));
  };
  const confirmarEliminarServicio = () => {
    setEliminando(true);
    eliminarServicio(aEliminarS._id).then(() => { setAEliminarS(null); cargarServicios(); }).finally(() => setEliminando(false));
  };

  const columnasProductos = [
    { key: "nombre", label: "Nombre" },
    { key: "categoria", label: "Categoría", render: (p) => p.categoria || "—" },
    { key: "precio", label: "Precio", render: (p) => `$${p.precio?.toFixed(2)}` },
    { key: "stock", label: "Stock" },
  ];

  const columnasServicios = [
    { key: "nombre", label: "Nombre" },
    { key: "categoria", label: "Categoría", render: (s) => s.categoria || "—" },
    { key: "precio", label: "Precio", render: (s) => `$${s.precio?.toFixed(2)}` },
    { key: "duracion", label: "Duración", render: (s) => (s.duracion ? `${s.duracion} min` : "—") },
  ];

  return (
    <Box>
      <PageHeader titulo="Catálogos" />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Productos" />
        <Tab label="Servicios" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {tab === 0 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button variant="contained" onClick={abrirNuevoProducto}>+ Nuevo producto</Button>
          </Box>
          <DataTable columnas={columnasProductos} filas={productos} cargando={cargandoP} onEditar={abrirEdicionProducto} onEliminar={setAEliminarP} mensajeVacio="No hay productos." />
        </>
      )}

      {tab === 1 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button variant="contained" onClick={abrirNuevoServicio}>+ Nuevo servicio</Button>
          </Box>
          <DataTable columnas={columnasServicios} filas={servicios} cargando={cargandoS} onEditar={abrirEdicionServicio} onEliminar={setAEliminarS} mensajeVacio="No hay servicios." />
        </>
      )}

      {/* ---- Diálogo Producto ---- */}
      <Dialog open={dialogoP} onClose={() => setDialogoP(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editandoP ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        <Box component="form" onSubmit={formP.handleSubmit(onSubmitProducto)} noValidate>
          <DialogContent>
            <TextField label="Nombre" fullWidth margin="dense" {...formP.register("nombre")} error={Boolean(formP.formState.errors.nombre)} helperText={formP.formState.errors.nombre?.message} />
            <TextField label="Categoría" fullWidth margin="dense" {...formP.register("categoria")} />
            <TextField label="Marca" fullWidth margin="dense" {...formP.register("marca")} />
            <TextField label="Precio" type="number" inputProps={{ min: 0, step: "0.01" }} fullWidth margin="dense" {...formP.register("precio")} error={Boolean(formP.formState.errors.precio)} helperText={formP.formState.errors.precio?.message} />
            <TextField label="Stock" type="number" inputProps={{ min: 0 }} fullWidth margin="dense" {...formP.register("stock")} error={Boolean(formP.formState.errors.stock)} helperText={formP.formState.errors.stock?.message} />
            <TextField label="Vencimiento" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} {...formP.register("fechaVencimiento")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoP(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ---- Diálogo Servicio ---- */}
      <Dialog open={dialogoS} onClose={() => setDialogoS(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editandoS ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
        <Box component="form" onSubmit={formS.handleSubmit(onSubmitServicio)} noValidate>
          <DialogContent>
            <TextField label="Nombre" fullWidth margin="dense" {...formS.register("nombre")} error={Boolean(formS.formState.errors.nombre)} helperText={formS.formState.errors.nombre?.message} />
            <TextField label="Descripción" fullWidth margin="dense" {...formS.register("descripcion")} />
            <TextField label="Precio" type="number" inputProps={{ min: 0, step: "0.01" }} fullWidth margin="dense" {...formS.register("precio")} error={Boolean(formS.formState.errors.precio)} helperText={formS.formState.errors.precio?.message} />
            <TextField label="Duración (min)" type="number" inputProps={{ min: 0 }} fullWidth margin="dense" {...formS.register("duracion")} error={Boolean(formS.formState.errors.duracion)} helperText={formS.formState.errors.duracion?.message} />
            <TextField label="Categoría" fullWidth margin="dense" {...formS.register("categoria")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoS(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog abierto={Boolean(aEliminarP)} titulo="Eliminar producto" mensaje={`¿Eliminar "${aEliminarP?.nombre}"?`} onConfirmar={confirmarEliminarProducto} onCancelar={() => setAEliminarP(null)} cargando={eliminando} />
      <ConfirmDialog abierto={Boolean(aEliminarS)} titulo="Eliminar servicio" mensaje={`¿Eliminar "${aEliminarS?.nombre}"?`} onConfirmar={confirmarEliminarServicio} onCancelar={() => setAEliminarS(null)} cargando={eliminando} />
    </Box>
  );
};

export default Catalogos;
