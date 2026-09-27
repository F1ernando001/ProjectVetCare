import "dotenv/config";
import app from "./src/app.js";
import { conectarDB } from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Healthcheck: http://localhost:${PORT}/api/health`);
  });
});
