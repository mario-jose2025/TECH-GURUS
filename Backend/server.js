// =========================================================
// VITALIS TECH — Backend
// Servidor principal
// =========================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const medicosRoutes = require("./routes/medicos.routes");
const citasRoutes = require("./routes/citas.routes");
const consultasRoutes = require("./routes/consultas.routes");
const laboratoriosRoutes = require("./routes/laboratorios.routes");
const recordatoriosRoutes = require("./routes/recordatorios.routes");
const expedientesRoutes = require("./routes/expedientes.routes");

const app = express();

app.use(cors()); // permite que el frontend (en otro puerto) le hable a esta API
app.use(express.json()); // permite leer JSON en el body de las peticiones

// Todas las rutas viven bajo /api (ej. /api/login, /api/medicos, /api/citas...)
app.use("/api", authRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/consultas", consultasRoutes);
app.use("/api/laboratorios", laboratoriosRoutes);
app.use("/api/recordatorios", recordatoriosRoutes);
app.use("/api/expedientes", expedientesRoutes);

// Ruta de prueba, para confirmar rápido que el servidor está vivo
app.get("/", (req, res) => {
  res.send("API de Vitalis Tech funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
