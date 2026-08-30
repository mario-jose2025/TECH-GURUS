// =========================================================
// VITALIS TECH — Backend
// Rutas de recordatorios de medicamentos
// =========================================================

const express = require("express");
const { sql, getPool } = require("../db");

const router = express.Router();

// GET /api/recordatorios?paciente_id=X
router.get("/", async (req, res) => {
  const { paciente_id } = req.query;

  if (!paciente_id) {
    return res.status(400).json({ mensaje: "paciente_id es obligatorio." });
  }

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("paciente_id", sql.Int, paciente_id)
      .query("SELECT * FROM recordatorios WHERE paciente_id = @paciente_id ORDER BY id");

    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error en GET /recordatorios:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// POST /api/recordatorios
router.post("/", async (req, res) => {
  const { paciente_id, medicamento, hora_proxima, frecuencia } = req.body;

  if (!paciente_id || !medicamento) {
    return res.status(400).json({ mensaje: "Paciente y medicamento son obligatorios." });
  }

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("paciente_id", sql.Int, paciente_id)
      .input("medicamento", sql.VarChar, medicamento)
      .input("hora_proxima", sql.VarChar, hora_proxima || null)
      .input("frecuencia", sql.VarChar, frecuencia || null)
      .query(`
        INSERT INTO recordatorios (paciente_id, medicamento, hora_proxima, frecuencia, tomado_hoy)
        OUTPUT INSERTED.*
        VALUES (@paciente_id, @medicamento, @hora_proxima, @frecuencia, 0)
      `);

    res.status(201).json({ mensaje: "Recordatorio creado.", recordatorio: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en POST /recordatorios:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// PATCH /api/recordatorios/:id/tomado
// Marca o desmarca "tomado hoy" — recibe { tomado: true/false }
router.patch("/:id/tomado", async (req, res) => {
  const { tomado } = req.body;

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("tomado", sql.Bit, tomado ? 1 : 0)
      .query("UPDATE recordatorios SET tomado_hoy = @tomado OUTPUT INSERTED.* WHERE id = @id");

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Recordatorio no encontrado." });
    }

    res.json({ mensaje: "Recordatorio actualizado.", recordatorio: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en PATCH /recordatorios/:id/tomado:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

module.exports = router;
