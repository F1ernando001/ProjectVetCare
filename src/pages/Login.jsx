import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Card, TextField, Button, Typography, Alert, Tabs, Tab } from "@mui/material";
import { loginStaff, loginPropietario, registrarPropietario } from "../services/auth.service";
import { guardarSesion } from "../utils/authStorage";

const loginSchema = z.object({
  correo: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const registroSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellido: z.string().min(1, "El apellido es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  correo: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  direccion: z.string().optional(),
});

// Un único formulario de ingreso: primero intenta como personal de la clínica
// y, si esas credenciales no corresponden, intenta como cliente (propietario).
const FormularioLogin = ({ aviso, correoInicial }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { correo: correoInicial || "", password: "" } });

  const onSubmit = (datos) => {
    setError("");
    loginStaff(datos.correo, datos.password)
      .then((data) => {
        guardarSesion(data.token, data.usuario, "usuario");
        navigate("/");
      })
      .catch((errStaff) => {
        loginPropietario(datos.correo, datos.password)
          .then((data) => {
            guardarSesion(data.token, data.propietario, "propietario");
            navigate("/portal/mascotas");
          })
          .catch((errCliente) => {
            setError(
              errCliente.response?.data?.mensaje ||
              errStaff.response?.data?.mensaje ||
              "No se pudo conectar con el servidor"
            );
          });
      });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {aviso && <Alert severity="success" sx={{ mb: 2 }}>{aviso}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Correo"
        type="email"
        fullWidth
        margin="normal"
        {...register("correo")}
        error={Boolean(errors.correo)}
        helperText={errors.correo?.message}
      />
      <TextField
        label="Contraseña"
        type="password"
        fullWidth
        margin="normal"
        {...register("password")}
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
      />
      <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 3, py: 1.2 }}>
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </Button>
    </Box>
  );
};

// Registro: solo para clientes (propietarios). El personal se crea desde el panel de Usuarios.
const FormularioRegistro = ({ onExito }) => {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registroSchema) });

  const onSubmit = (datos) => {
    setError("");
    registrarPropietario(datos)
      .then(() => onExito(datos.correo))
      .catch((err) => setError(err.response?.data?.mensaje || "No se pudo completar el registro"));
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField label="Nombre" fullWidth margin="dense" {...register("nombre")} error={Boolean(errors.nombre)} helperText={errors.nombre?.message} />
      <TextField label="Apellido" fullWidth margin="dense" {...register("apellido")} error={Boolean(errors.apellido)} helperText={errors.apellido?.message} />
      <TextField label="Teléfono" fullWidth margin="dense" {...register("telefono")} error={Boolean(errors.telefono)} helperText={errors.telefono?.message} />
      <TextField label="Correo" fullWidth margin="dense" {...register("correo")} error={Boolean(errors.correo)} helperText={errors.correo?.message} />
      <TextField label="Contraseña" type="password" fullWidth margin="dense" {...register("password")} error={Boolean(errors.password)} helperText={errors.password?.message} />
      <TextField label="Dirección (opcional)" fullWidth margin="dense" {...register("direccion")} />
      <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 2, py: 1.2 }}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </Box>
  );
};

const Login = () => {
  const [tab, setTab] = useState(0);
  const [avisoLogin, setAvisoLogin] = useState("");
  const [correoRegistrado, setCorreoRegistrado] = useState("");

  const cambiarTab = (e, v) => {
    setTab(v);
    setAvisoLogin("");
  };

  const onRegistroExitoso = (correo) => {
    setCorreoRegistrado(correo || "");
    setAvisoLogin("Cuenta creada con éxito. Iniciá sesión con tus datos.");
    setTab(0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        p: 3,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400, p: 4 }}>
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          SystemVetCare
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Iniciá sesión con tu cuenta
        </Typography>

        <Tabs value={tab} onChange={cambiarTab} sx={{ mb: 2 }}>
          <Tab label="Ingresar" />
          <Tab label="Crear cuenta" />
        </Tabs>

        {tab === 0 && <FormularioLogin aviso={avisoLogin} correoInicial={correoRegistrado} />}
        {tab === 1 && <FormularioRegistro onExito={onRegistroExitoso} />}
      </Card>
    </Box>
  );
};

export default Login;
