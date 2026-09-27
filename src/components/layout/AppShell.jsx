import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { obtenerSesion, cerrarSesion } from "../../utils/authStorage";

const ANCHO_DRAWER = 240;

// Layout compartido por el panel de staff y el portal de clientes.
// Recibe qué menú mostrar y el título de la barra lateral, para no duplicar código.
const AppShell = ({ menu, tituloSidebar, tituloBarra }) => {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [anchorEl, setAnchorEl] = useState(null);

  const nombreMostrado =
    sesion?.datos?.nombreUsuario || sesion?.datos?.nombre || "Usuario";

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  const itemsVisibles = menu.filter((item) => {
    if (item.soloAdmin) {
      return sesion?.datos?.rol?.nombre === "Administrador";
    }
    return true;
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            {tituloBarra}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {nombreMostrado}
            </Typography>
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.dark" }}>
                <AccountCircleIcon fontSize="small" />
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: ANCHO_DRAWER,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: ANCHO_DRAWER, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {tituloSidebar}
          </Typography>
        </Box>
        <Divider />
        <List>
          {itemsVisibles.map((item) => {
            const Icono = item.icono;
            return (
              <ListItemButton
                key={item.ruta}
                component={NavLink}
                to={item.ruta}
                end={item.ruta === "/"}
                sx={{
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "& .MuiListItemIcon-root": { color: "#fff" },
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ListItemIcon>
                  <Icono />
                </ListItemIcon>
                <ListItemText primary={item.texto} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
