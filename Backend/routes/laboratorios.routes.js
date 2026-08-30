// =========================================================
// VITALIS TECH — Backend
// Rutas de resultados de laboratorio
// =========================================================

const express = require("express");
const { sql, getPool } = require("../db");

const router = express.Router();

// GET /api/laboratorios?paciente_id=X
router.get("/", async (req, res) => {
  const { paciente_id } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = "SELECT * FROM laboratorios";
    if (paciente_id) {
      request.input("paciente_id", sql.Int, paciente_id);
      query += " WHERE paciente_id = @paciente_id";
    }
    query += " ORDER BY fecha DESC";

    const resultado = await request.query(query);
    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error en GET /laboratorios:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// POST /api/laboratorios
// El admin sube un resultado nuevo (formulario "Subir Laboratorio")
router.post("/", async (req, res) => {
  const { paciente_id, medico_id, tipo_examen, detalle, sede, fecha, archivo_nombre, resultado_clinico } = req.body;

  if (!paciente_id || !medico_id || !tipo_examen || !fecha) {
    return res.status(400).json({ mensaje: "Paciente, médico, tipo de examen y fecha son obligatorios." });
  }

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("paciente_id", sql.Int, paciente_id)
      .input("medico_id", sql.Int, medico_id)
      .input("tipo_examen", sql.VarChar, tipo_examen)
      .input("detalle", sql.VarChar, detalle || null)
      .input("sede", sql.VarChar, sede || "Sede Central (Managua)")
      .input("fecha", sql.Date, fecha)
      .input("estado", sql.VarChar, "disponible") // se sube ya con archivo listo
      .input("archivo_nombre", sql.VarChar, archivo_nombre || null)
      .input("resultado_clinico", sql.VarChar, resultado_clinico || null)
      .query(`
        INSERT INTO laboratorios (paciente_id, medico_id, tipo_examen, detalle, sede, fecha, estado, archivo_nombre, resultado_clinico)
        OUTPUT INSERTED.*
        VALUES (@paciente_id, @medico_id, @tipo_examen, @detalle, @sede, @fecha, @estado, @archivo_nombre, @resultado_clinico)
      `);

    res.status(201).json({ mensaje: "Resultado de laboratorio subido exitosamente.", resultado: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en POST /laboratorios:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

module.exports = router;
