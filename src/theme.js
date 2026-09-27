import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },      // azul de la barra superior, como en la captura
    secondary: { main: "#2e7d32" },
    error: { main: "#c62828" },
    background: { default: "#f4f6f8" },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiAppBar: {
      styleOverrides: { root: { boxShadow: "none" } },
    },
  },
});

export default theme;
