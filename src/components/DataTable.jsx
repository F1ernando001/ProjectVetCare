import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// columnas: [{ key, label, render? }]
// filas: array de objetos. Cada fila necesita un campo _id.
// onEditar / onEliminar: opcionales. Si se omiten, no se muestra ese ícono.
const DataTable = ({ columnas, filas, cargando, onEditar, onEliminar, mensajeVacio = "No hay registros." }) => {
  if (cargando) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!filas || filas.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">{mensajeVacio}</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.50" }}>
            {columnas.map((col) => (
              <TableCell key={col.key} sx={{ fontWeight: 600, color: "text.secondary" }}>
                {col.label}
              </TableCell>
            ))}
            {(onEditar || onEliminar) && (
              <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>
                Acciones
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {filas.map((fila) => (
            <TableRow key={fila._id} hover>
              {columnas.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(fila) : fila[col.key]}
                </TableCell>
              ))}
              {(onEditar || onEliminar) && (
                <TableCell align="right">
                  {onEditar && (
                    <IconButton size="small" color="primary" onClick={() => onEditar(fila)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onEliminar && (
                    <IconButton size="small" color="error" onClick={() => onEliminar(fila)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Chip de estado reutilizable (Pendiente/Confirmada/Pagada/etc, con color)
export const EstadoChip = ({ estado, colores = {} }) => {
  const colorPorDefecto = {
    Pendiente: "warning",
    Confirmada: "info",
    Completada: "success",
    Pagada: "success",
    Cancelada: "error",
    Anulada: "error",
    Activo: "success",
    Inactivo: "default",
  };
  const color = colores[estado] || colorPorDefecto[estado] || "default";
  return <Chip label={estado} color={color} size="small" />;
};

export default DataTable;
