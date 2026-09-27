import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Alert, Box, Stack, IconButton, Typography, Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PageHeader from "../components/PageHeader";
import DataTable, { EstadoChip } from "../components/DataTable";
import {
  listarFacturas, crearFactura, agregarPago, anularFactura,
} from "../services/factura.service";
import { listarPropietarios } from "../services/propietario.service";
import { listarProductos, listarServicios } from "../services/catalogo.service";

const esquemaItem = z.object({
  tipo: z.string().min(1),
  referenciaId: z.string().min(1, "Seleccioná un ítem"),
  concepto: z.string().optional(),
  cantidad: z.string().min(1, "Obligatorio"),
  precioUnitario: z.string().min(1, "Obligatorio"),
});

const esquemaFactura = z.object({
  propietarioId: z.string().min(1, "Seleccioná un propietario"),
  metodoPago: z.string().min(1),
  detalle: z.array(esquemaItem).min(1, "Agregá al menos un ítem"),
});

const esquemaPago = z.object({
  monto: z.string().min(1, "Obligatorio"),
  metodoPago: z.string().min(1),
});

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [facturaPago, setFacturaPago] = useState(null);

  const { control, register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(esquemaFactura),
    defaultValues: { propietarioId: "", metodoPago: "Efectivo", detalle: [{ tipo: "Producto", referenciaId: "", concepto: "", cantidad: "1", precioUnitario: "0" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "detalle" });

  const formPago = useForm({ resolver: zodResolver(esquemaPago), defaultValues: { monto: "", metodoPago: "Efectivo" } });

  const cargarFacturas = () => {
    setCargando(true);
    listarFacturas().then((d) => setFacturas(d.data)).catch((err) => setError(err.response?.data?.mensaje || "Error")).finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarFacturas();
    listarPropietarios().then((d) => setPropietarios(d.data)).catch(() => {});
    listarProductos().then((d) => setProductos(d.data)).catch(() => {});
    listarServicios().then((d) => setServicios(d.data)).catch(() => {});
  }, []);

  const opcionesDelTipo = (tipo) => (tipo === "Producto" ? productos : servicios);

  const abrirNuevo = () => {
    reset({ propietarioId: "", metodoPago: "Efectivo", detalle: [{ tipo: "Producto", referenciaId: "", concepto: "", cantidad: "1", precioUnitario: "0" }] });
    setDialogoAbierto(true);
  };

  const detalleActual = watch("detalle");
  const totalEstimado = detalleActual.reduce((acc, i) => acc + Number(i.cantidad || 0) * Number(i.precioUnitario || 0), 0);

  const seleccionarItem = (index, referenciaId, tipo) => {
    const opciones = opcionesDelTipo(tipo);
    const elegido = opciones.find((o) => o._id === referenciaId);
    setValue(`detalle.${index}.referenciaId`, referenciaId);
    if (elegido) {
      setValue(`detalle.${index}.concepto`, elegido.nombre);
      setValue(`detalle.${index}.precioUnitario`, String(elegido.precio));
    }
  };

  const onSubmit = (datos) => {
    setError("");
    const payload = {
      propietarioId: datos.propietarioId,
      metodoPago: datos.metodoPago,
      detalle: datos.detalle.map((i) => ({
        concepto: i.concepto,
        tipo: i.tipo,
        referenciaId: i.referenciaId,
        cantidad: Number(i.cantidad),
        precioUnitario: Number(i.precioUnitario),
      })),
    };
    crearFactura(payload)
      .then(() => { setDialogoAbierto(false); cargarFacturas(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo crear la factura"));
  };

  const onSubmitPago = (datos) => {
    agregarPago(facturaPago, { monto: Number(datos.monto), metodoPago: datos.metodoPago })
      .then(() => { formPago.reset(); setFacturaPago(null); cargarFacturas(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo registrar el pago"));
  };

  const handleAnular = (f) => {
    anularFactura(f._id).then(() => cargarFacturas()).catch((err) => setError(err.response?.data?.mensaje || "No se pudo anular"));
  };

  const columnas = [
    { key: "fecha", label: "Fecha", render: (f) => new Date(f.fecha).toLocaleDateString() },
    { key: "propietario", label: "Propietario", render: (f) => `${f.propietarioId?.nombre || ""} ${f.propietarioId?.apellido || ""}` },
    { key: "total", label: "Total", render: (f) => `$${f.total?.toFixed(2)}` },
    { key: "estado", label: "Estado", render: (f) => <EstadoChip estado={f.estado} /> },
    {
      key: "acciones2", label: "",
      render: (f) => f.estado === "Pendiente" && (
        <Stack direction="row" spacing={0.5}>
          <Button size="small" onClick={() => setFacturaPago(f._id)}>+ Pago</Button>
          <Button size="small" color="error" onClick={() => handleAnular(f)}>Anular</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader titulo="Facturas" subtitulo={`${facturas.length} registradas`} textoBoton="Nueva factura" onClickBoton={abrirNuevo} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <DataTable columnas={columnas} filas={facturas} cargando={cargando} mensajeVacio="Todavía no hay facturas." />

      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva factura</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
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
            <Controller
              name="metodoPago" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Método de pago" fullWidth margin="dense">
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                </TextField>
              )}
            />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Detalle</Typography>

            {fields.map((field, index) => {
              const tipoActual = watch(`detalle.${index}.tipo`);
              return (
                <Stack key={field.id} direction="row" spacing={1} sx={{ mb: 1 }} alignItems="center">
                  <Controller
                    name={`detalle.${index}.tipo`} control={control}
                    render={({ field: f }) => (
                      <TextField {...f} select label="Tipo" size="small" sx={{ width: 120 }}>
                        <MenuItem value="Producto">Producto</MenuItem>
                        <MenuItem value="Servicio">Servicio</MenuItem>
                      </TextField>
                    )}
                  />
                  <TextField
                    select label="Ítem" size="small" sx={{ flex: 1 }}
                    value={watch(`detalle.${index}.referenciaId`)}
                    onChange={(e) => seleccionarItem(index, e.target.value, tipoActual)}
                    error={Boolean(errors.detalle?.[index]?.referenciaId)}
                  >
                    <MenuItem value="">Seleccioná...</MenuItem>
                    {opcionesDelTipo(tipoActual).map((o) => (
                      <MenuItem key={o._id} value={o._id}>{o.nombre} (${o.precio})</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Cant." type="number" size="small" sx={{ width: 80 }}
                    {...register(`detalle.${index}.cantidad`)}
                  />
                  <TextField
                    label="Precio" type="number" size="small" sx={{ width: 100 }}
                    {...register(`detalle.${index}.precioUnitario`)}
                  />
                  {fields.length > 1 && (
                    <IconButton size="small" color="error" onClick={() => remove(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              );
            })}

            <Button
              size="small"
              onClick={() => append({ tipo: "Producto", referenciaId: "", concepto: "", cantidad: "1", precioUnitario: "0" })}
            >
              + Agregar ítem
            </Button>

            <Typography variant="body2" sx={{ mt: 2 }}>
              Subtotal estimado: <b>${totalEstimado.toFixed(2)}</b>{" "}
              <Typography component="span" variant="caption" color="text.secondary">
                (el impuesto del 13% lo calcula el backend)
              </Typography>
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoAbierto(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Crear factura"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(facturaPago)} onClose={() => setFacturaPago(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Registrar pago</DialogTitle>
        <Box component="form" onSubmit={formPago.handleSubmit(onSubmitPago)} noValidate>
          <DialogContent>
            <TextField label="Monto" type="number" fullWidth margin="dense" {...formPago.register("monto")} error={Boolean(formPago.formState.errors.monto)} helperText={formPago.formState.errors.monto?.message} />
            <Controller
              name="metodoPago" control={formPago.control}
              render={({ field }) => (
                <TextField {...field} select label="Método" fullWidth margin="dense">
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setFacturaPago(null)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained">Guardar pago</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Facturas;
