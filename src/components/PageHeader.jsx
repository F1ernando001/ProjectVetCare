import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const PageHeader = ({ titulo, subtitulo, textoBoton, onClickBoton }) => (
  <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 3 }}>
    <Box>
      <Typography variant="h5">{titulo}</Typography>
      {subtitulo && (
        <Typography variant="body2" color="text.secondary">
          {subtitulo}
        </Typography>
      )}
    </Box>
    {textoBoton && (
      <Button variant="contained" startIcon={<AddIcon />} onClick={onClickBoton}>
        {textoBoton}
      </Button>
    )}
  </Box>
);

export default PageHeader;
