import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  MenuItem, Alert, Box, Card, CardContent, Typography, Stack, Chip, Divider,
} from "@mui/material";
import PageHeader from "../components/PageHeader";
import {
  listarConsultas, crearConsulta, agregarTratamiento, actualizarReceta,
} from "../services/consulta.service";
import { listarCitas } from "../services/cita.service";

const esquemaConsulta = z.object({
  citaId: z.string().min(1, "Seleccioná una cita"),
  sintomas: z.string().optional(),
  diagnostico: z.string().optional(),
  observaciones: z.string().optional(),
});

const esquemaTratamiento = z.object({
  nombre: z.string().min(1, "Obligatorio"),
  frecuencia: z.string().optional(),
  duracion: z.string().optional(),
  indicaciones: z.string().optional(),
});

const esquemaReceta = z.object({
  observaciones: z.string().optional(),
  nombreMed: z.string().min(1, "Obligatorio"),
  dosis: z.string().optional(),
  instrucciones: z.string().optional(),
});

const Consultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [consultaTratamiento, setConsultaTratamiento] = useState(null);
  const [consultaReceta, setConsultaReceta] = useState(null);

  const formConsulta = useForm({ resolver: zodResolver(esquemaConsulta), defaultValues: { citaId: "", sintomas: "", diagnostico: "", observaciones: "" } });
  const formTratamiento = useForm({ resolver: zodResolver(esquemaTratamiento), defaultValues: { nombre: "", frecuencia: "", duracion: "", indicaciones: "" } });
  const formReceta = useForm({ resolver: zodResolver(esquemaReceta), defaultValues: { observaciones: "", nombreMed: "", dosis: "", instrucciones: "" } });

  const cargarConsultas = () => {
    setCargando(true);
    listarConsultas()
      .then((data) => setConsultas(data.data))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudieron cargar las consultas"))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarConsultas();
    listarCitas({ estado: "Confirmada" }).then((d) => setCitas(d.data)).catch(() => {});
  }, []);

  const abrirNuevo = () => {
    formConsulta.reset({ citaId: "", sintomas: "", diagnostico: "", observaciones: "" });
    setDialogoAbierto(true);
  };

  const onSubmitConsulta = (datos) => {
    setError("");
    const cita = citas.find((c) => c._id === datos.citaId);
    crearConsulta({
      citaId: datos.citaId,
      mascotaId: cita?.mascotaId,
      usuarioId: cita?.usuarioId?._id,
      sintomas: datos.sintomas,
      diagnostico: datos.diagnostico,
      observaciones: datos.observaciones,
    })
      .then(() => { setDialogoAbierto(false); cargarConsultas(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo crear la consulta"));
  };

  const onSubmitTratamiento = (datos) => {
    agregarTratamiento(consultaTratamiento, datos)
      .then(() => { formTratamiento.reset(); setConsultaTratamiento(null); cargarConsultas(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo agregar el tratamiento"));
  };

  const onSubmitReceta = (datos) => {
    actualizarReceta(consultaReceta, {
      observaciones: datos.observaciones,
      medicamentos: [{ nombre: datos.nombreMed, dosis: datos.dosis, instrucciones: datos.instrucciones }],
    })
      .then(() => { formReceta.reset(); setConsultaReceta(null); cargarConsultas(); })
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo actualizar la receta"));
  };

  return (
    <Box>
      <PageHeader titulo="Consultas" subtitulo={`${consultas.length} registradas`} textoBoton="Nueva consulta" onClickBoton={abrirNuevo} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cargando ? (
        <Typography color="text.secondary">Cargando...</Typography>
      ) : consultas.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay consultas.</Typography>
      ) : (
        <Stack spacing={2}>
          {consultas.map((c) => (
            <Card key={c._id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">{new Date(c.fecha).toLocaleDateString()}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">{c.usuarioId?.nombreUsuario}</Typography>
                </Stack>
                <Typography variant="body2"><b>Síntomas:</b> {c.sintomas || "—"}</Typography>
                <Typography variant="body2"><b>Diagnóstico:</b> {c.diagnostico || "—"}</Typography>
                <Typography variant="body2"><b>Observaciones:</b> {c.observaciones || "—"}</Typography>

                {c.tratamientos?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Tratamientos:</Typography>
                    {c.tratamientos.map((t, i) => (
                      <Chip key={i} label={`${t.nombre} — ${t.frecuencia || ""}`} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                    ))}
                  </Box>
                )}

                {c.receta?.medicamentos?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Receta:</Typography>
                    {c.receta.medicamentos.map((m, i) => (
                      <Chip key={i} label={`${m.nombre} — ${m.dosis || ""}`} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                    ))}
                  </Box>
                )}

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined" onClick={() => { formTratamiento.reset(); setConsultaTratamiento(c._id); }}>
                    + Tratamiento
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => { formReceta.reset(); setConsultaReceta(c._id); }}>
                    + Receta
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* ---- Diálogo: crear consulta ---- */}
      <Dialog open={dialogoAbierto} onClose={() => setDialogoAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva consulta</DialogTitle>
        <Box component="form" onSubmit={formConsulta.handleSubmit(onSubmitConsulta)} noValidate>
          <DialogContent>
            <Controller
              name="citaId" control={formConsulta.control}
              render={({ field }) => (
                <TextField {...field} select label="Cita (confirmada)" fullWidth margin="dense"
                  error={Boolean(formConsulta.formState.errors.citaId)} helperText={formConsulta.formState.errors.citaId?.message}>
                  <MenuItem value="">Seleccioná una cita...</MenuItem>
                  {citas.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {new Date(c.fecha).toLocaleDateString()} {c.hora} — {c.propietarioId?.nombre} {c.propietarioId?.apellido} ({c.motivo})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField label="Síntomas" fullWidth margin="dense" {...formConsulta.register("sintomas")} />
            <TextField label="Diagnóstico" fullWidth margin="dense" {...formConsulta.register("diagnostico")} />
            <TextField label="Observaciones" fullWidth margin="dense" {...formConsulta.register("observaciones")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDialogoAbierto(false)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained" disabled={formConsulta.formState.isSubmitting}>
              {formConsulta.formState.isSubmitting ? "Guardando..." : "Crear consulta"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ---- Diálogo: agregar tratamiento ---- */}
      <Dialog open={Boolean(consultaTratamiento)} onClose={() => setConsultaTratamiento(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar tratamiento</DialogTitle>
        <Box component="form" onSubmit={formTratamiento.handleSubmit(onSubmitTratamiento)} noValidate>
          <DialogContent>
            <TextField label="Nombre" fullWidth margin="dense" {...formTratamiento.register("nombre")} error={Boolean(formTratamiento.formState.errors.nombre)} helperText={formTratamiento.formState.errors.nombre?.message} />
            <TextField label="Frecuencia" fullWidth margin="dense" {...formTratamiento.register("frecuencia")} placeholder="Cada 12 horas" />
            <TextField label="Duración" fullWidth margin="dense" {...formTratamiento.register("duracion")} placeholder="7 días" />
            <TextField label="Indicaciones" fullWidth margin="dense" {...formTratamiento.register("indicaciones")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConsultaTratamiento(null)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ---- Diálogo: actualizar receta ---- */}
      <Dialog open={Boolean(consultaReceta)} onClose={() => setConsultaReceta(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Actualizar receta</DialogTitle>
        <Box component="form" onSubmit={formReceta.handleSubmit(onSubmitReceta)} noValidate>
          <DialogContent>
            <TextField label="Observaciones" fullWidth margin="dense" {...formReceta.register("observaciones")} />
            <Divider sx={{ my: 1 }} />
            <TextField label="Medicamento" fullWidth margin="dense" {...formReceta.register("nombreMed")} error={Boolean(formReceta.formState.errors.nombreMed)} helperText={formReceta.formState.errors.nombreMed?.message} />
            <TextField label="Dosis" fullWidth margin="dense" {...formReceta.register("dosis")} />
            <TextField label="Instrucciones" fullWidth margin="dense" {...formReceta.register("instrucciones")} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setConsultaReceta(null)} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Consultas;
