// =========================================================
// VITALIS TECH — Backend
// Rutas de consultas médicas
// =========================================================

const express = require("express");
const { sql, getPool } = require("../db");

const router = express.Router();

// GET /api/consultas?cita_id=X
// Usado por "Ver Detalles" del paciente para traer el diagnóstico real
router.get("/", async (req, res) => {
  const { cita_id, paciente_id } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = "SELECT * FROM consultas";
    const condiciones = [];

    if (cita_id) {
      request.input("cita_id", sql.Int, cita_id);
      condiciones.push("cita_id = @cita_id");
    }
    if (paciente_id) {
      request.input("paciente_id", sql.Int, paciente_id);
      condiciones.push("paciente_id = @paciente_id");
    }
    if (condiciones.length > 0) {
      query += " WHERE " + condiciones.join(" AND ");
    }
    query += " ORDER BY fecha DESC";

    const resultado = await request.query(query);
    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error en GET /consultas:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// POST /api/consultas
// Registra el diagnóstico/receta. Si viene ligada a una cita (cita_id),
// esa cita pasa a "atendida" — las dos cosas ocurren juntas en una
// transacción: si algo falla, NINGUNA de las dos se guarda a medias.
router.post("/", async (req, res) => {
  const {
    cita_id, paciente_id, medico_id, especialidad, fecha,
    presion_arterial, frecuencia_cardiaca, temperatura, peso, talla,
    motivo, diagnostico, tipo_diagnostico, receta, indicaciones,
  } = req.body;

  if (!paciente_id || !medico_id || !fecha || !motivo || !diagnostico) {
    return res.status(400).json({ mensaje: "Paciente, médico, fecha, motivo y diagnóstico son obligatorios." });
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const requestInsert = new sql.Request(transaction);
    const resultadoConsulta = await requestInsert
      .input("cita_id", sql.Int, cita_id || null)
      .input("paciente_id", sql.Int, paciente_id)
      .input("medico_id", sql.Int, medico_id)
      .input("especialidad", sql.VarChar, especialidad || null)
      .input("fecha", sql.Date, fecha)
      .input("presion_arterial", sql.VarChar, presion_arterial || null)
      .input("frecuencia_cardiaca", sql.Int, frecuencia_cardiaca || null)
      .input("temperatura", sql.Decimal(4, 1), temperatura || null)
      .input("peso", sql.Decimal(5, 2), peso || null)
      .input("talla", sql.Int, talla || null)
      .input("motivo", sql.VarChar, motivo)
      .input("diagnostico", sql.VarChar, diagnostico)
      .input("tipo_diagnostico", sql.VarChar, tipo_diagnostico || null)
      .input("receta", sql.VarChar, receta || null)
      .input("indicaciones", sql.VarChar, indicaciones || null)
      .query(`
        INSERT INTO consultas (cita_id, paciente_id, medico_id, especialidad, fecha, presion_arterial, frecuencia_cardiaca, temperatura, peso, talla, motivo, diagnostico, tipo_diagnostico, receta, indicaciones)
        OUTPUT INSERTED.*
        VALUES (@cita_id, @paciente_id, @medico_id, @especialidad, @fecha, @presion_arterial, @frecuencia_cardiaca, @temperatura, @peso, @talla, @motivo, @diagnostico, @tipo_diagnostico, @receta, @indicaciones)
      `);

    // Si esta consulta viene de una cita real, la marcamos "atendida"
    // DENTRO de la misma transacción.
    if (cita_id) {
      const requestUpdate = new sql.Request(transaction);
      await requestUpdate
        .input("cita_id", sql.Int, cita_id)
        .query("UPDATE citas SET estado = 'atendida' WHERE id = @cita_id");
    }

    await transaction.commit();

    res.status(201).json({
      mensaje: "Consulta registrada exitosamente.",
      consulta: resultadoConsulta.recordset[0],
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error en POST /consultas:", error);
    res.status(500).json({ mensaje: "Error del servidor. No se guardó nada." });
  }
});

module.exports = router;
