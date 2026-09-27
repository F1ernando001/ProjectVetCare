import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmDialog = ({ abierto, titulo = "Confirmar", mensaje, onConfirmar, onCancelar, cargando }) => (
  <Dialog open={abierto} onClose={onCancelar} maxWidth="xs" fullWidth>
    <DialogTitle>{titulo}</DialogTitle>
    <DialogContent>
      <Typography color="text.secondary">{mensaje}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onCancelar} color="inherit">
        Cancelar
      </Button>
      <Button onClick={onConfirmar} color="error" variant="contained" disabled={cargando}>
        {cargando ? "Eliminando..." : "Eliminar"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
