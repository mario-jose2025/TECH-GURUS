// =========================================================
// VITALIS TECH — Backend
// Servidor principal
// =========================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors()); // permite que el frontend (en otro puerto) le hable a esta API
app.use(express.json()); // permite leer JSON en el body de las peticiones

// Todas las rutas de autenticación viven bajo /api (ej. /api/login)
app.use("/api", authRoutes);

// Ruta de prueba, para confirmar rápido que el servidor está vivo
app.get("/", (req, res) => {
  res.send("API de Vitalis Tech funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
