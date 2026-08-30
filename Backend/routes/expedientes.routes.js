// =========================================================
// VITALIS TECH — Backend
// Rutas de expedientes clínicos
// (Bonus: este módulo del frontend todavía no estaba conectado
// ni siquiera a localStorage — es la primera vez que persiste.)
// =========================================================

const express = require("express");
const { sql, getPool } = require("../db");

const router = express.Router();

// GET /api/expedientes/:paciente_id
router.get("/:paciente_id", async (req, res) => {
  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("paciente_id", sql.Int, req.params.paciente_id)
      .query("SELECT * FROM expedientes_clinicos WHERE paciente_id = @paciente_id");

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Este paciente todavía no tiene expediente clínico." });
    }

    res.json(resultado.recordset[0]);
  } catch (error) {
    console.error("Error en GET /expedientes/:paciente_id:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// POST /api/expedientes
// Crea el expediente (uno solo por paciente — la tabla tiene un UNIQUE)
router.post("/", async (req, res) => {
  const {
    paciente_id, tipo_sangre, alergias, enfermedades_cronicas,
    cirugias_previas, antecedentes_familiares, fuma, consume_alcohol,
  } = req.body;

  if (!paciente_id) {
    return res.status(400).json({ mensaje: "paciente_id es obligatorio." });
  }

  try {
    const pool = await getPool();

    const existente = await pool
      .request()
      .input("paciente_id", sql.Int, paciente_id)
      .query("SELECT id FROM expedientes_clinicos WHERE paciente_id = @paciente_id");

    if (existente.recordset.length > 0) {
      return res.status(409).json({ mensaje: "Este paciente ya tiene un expediente. Usa PUT para actualizarlo." });
    }

    const resultado = await pool
      .request()
      .input("paciente_id", sql.Int, paciente_id)
      .input("tipo_sangre", sql.VarChar, tipo_sangre || null)
      .input("alergias", sql.VarChar, alergias || null)
      .input("enfermedades_cronicas", sql.VarChar, enfermedades_cronicas || null)
      .input("cirugias_previas", sql.VarChar, cirugias_previas || null)
      .input("antecedentes_familiares", sql.VarChar, antecedentes_familiares || null)
      .input("fuma", sql.Bit, fuma ? 1 : 0)
      .input("consume_alcohol", sql.Bit, consume_alcohol ? 1 : 0)
      .query(`
        INSERT INTO expedientes_clinicos (paciente_id, tipo_sangre, alergias, enfermedades_cronicas, cirugias_previas, antecedentes_familiares, fuma, consume_alcohol)
        OUTPUT INSERTED.*
        VALUES (@paciente_id, @tipo_sangre, @alergias, @enfermedades_cronicas, @cirugias_previas, @antecedentes_familiares, @fuma, @consume_alcohol)
      `);

    res.status(201).json({ mensaje: "Expediente clínico creado.", expediente: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en POST /expedientes:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// PUT /api/expedientes/:paciente_id
// Actualizar el expediente existente
router.put("/:paciente_id", async (req, res) => {
  const {
    tipo_sangre, alergias, enfermedades_cronicas,
    cirugias_previas, antecedentes_familiares, fuma, consume_alcohol,
  } = req.body;

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("paciente_id", sql.Int, req.params.paciente_id)
      .input("tipo_sangre", sql.VarChar, tipo_sangre || null)
      .input("alergias", sql.VarChar, alergias || null)
      .input("enfermedades_cronicas", sql.VarChar, enfermedades_cronicas || null)
      .input("cirugias_previas", sql.VarChar, cirugias_previas || null)
      .input("antecedentes_familiares", sql.VarChar, antecedentes_familiares || null)
      .input("fuma", sql.Bit, fuma ? 1 : 0)
      .input("consume_alcohol", sql.Bit, consume_alcohol ? 1 : 0)
      .query(`
        UPDATE expedientes_clinicos SET
          tipo_sangre = @tipo_sangre, alergias = @alergias,
          enfermedades_cronicas = @enfermedades_cronicas, cirugias_previas = @cirugias_previas,
          antecedentes_familiares = @antecedentes_familiares, fuma = @fuma, consume_alcohol = @consume_alcohol
        OUTPUT INSERTED.*
        WHERE paciente_id = @paciente_id
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Este paciente no tiene expediente todavía. Usa POST para crearlo." });
    }

    res.json({ mensaje: "Expediente actualizado.", expediente: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en PUT /expedientes/:paciente_id:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

module.exports = router;
