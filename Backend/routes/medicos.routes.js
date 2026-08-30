// =========================================================
// VITALIS TECH — Backend
// Rutas de médicos
// =========================================================

const express = require("express");
const { sql, getPool } = require("../db");

const router = express.Router();

// GET /api/medicos
// Lista todos los médicos. Admite ?estado=Activo para filtrar
// (usado por el select de "Agenda Médica" y "Agendar Cita" del paciente).
router.get("/", async (req, res) => {
  const { estado } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = "SELECT * FROM medicos";
    if (estado) {
      request.input("estado", sql.VarChar, estado);
      query += " WHERE estado = @estado";
    }
    query += " ORDER BY apellidos, nombres";

    const resultado = await request.query(query);
    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error en GET /medicos:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// GET /api/medicos/:id
router.get("/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM medicos WHERE id = @id");

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }

    res.json(resultado.recordset[0]);
  } catch (error) {
    console.error("Error en GET /medicos/:id:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// POST /api/medicos
// Registrar un médico nuevo (formulario "Gestionar Médicos" del admin)
router.post("/", async (req, res) => {
  const { tratamiento, nombres, apellidos, cedula, telefono, correo, especialidad, licencia, horario, estado } = req.body;

  if (!nombres || !apellidos || !especialidad) {
    return res.status(400).json({ mensaje: "Nombres, apellidos y especialidad son obligatorios." });
  }

  try {
    const pool = await getPool();

    // Solo verificamos cédula duplicada si de verdad mandaron una —
    // varios médicos pueden no tener cédula registrada (NULL), eso no
    // choca con la restricción UNIQUE de la base de datos.
    if (cedula) {
      const existente = await pool
        .request()
        .input("cedula", sql.VarChar, cedula)
        .query("SELECT id FROM medicos WHERE cedula = @cedula");

      if (existente.recordset.length > 0) {
        return res.status(409).json({ mensaje: "Ya existe un médico registrado con esa cédula." });
      }
    }

    const resultado = await pool
      .request()
      .input("tratamiento", sql.VarChar, tratamiento || "Dr.")
      .input("nombres", sql.VarChar, nombres)
      .input("apellidos", sql.VarChar, apellidos)
      .input("cedula", sql.VarChar, cedula)
      .input("telefono", sql.VarChar, telefono || null)
      .input("correo", sql.VarChar, correo || null)
      .input("especialidad", sql.VarChar, especialidad)
      .input("licencia", sql.VarChar, licencia || null)
      .input("horario", sql.VarChar, horario || null)
      .input("estado", sql.VarChar, estado || "activo")
      .query(`
        INSERT INTO medicos (tratamiento, nombres, apellidos, cedula, telefono, correo, especialidad, licencia, horario, estado)
        OUTPUT INSERTED.*
        VALUES (@tratamiento, @nombres, @apellidos, @cedula, @telefono, @correo, @especialidad, @licencia, @horario, @estado)
      `);

    res.status(201).json({ mensaje: "Médico registrado exitosamente.", medico: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en POST /medicos:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// PUT /api/medicos/:id
// Editar un médico existente
router.put("/:id", async (req, res) => {
  const { tratamiento, nombres, apellidos, cedula, telefono, correo, especialidad, licencia, horario, estado } = req.body;

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("tratamiento", sql.VarChar, tratamiento)
      .input("nombres", sql.VarChar, nombres)
      .input("apellidos", sql.VarChar, apellidos)
      .input("cedula", sql.VarChar, cedula)
      .input("telefono", sql.VarChar, telefono || null)
      .input("correo", sql.VarChar, correo || null)
      .input("especialidad", sql.VarChar, especialidad)
      .input("licencia", sql.VarChar, licencia || null)
      .input("horario", sql.VarChar, horario || null)
      .input("estado", sql.VarChar, estado)
      .query(`
        UPDATE medicos SET
          tratamiento = @tratamiento, nombres = @nombres, apellidos = @apellidos,
          cedula = @cedula, telefono = @telefono, correo = @correo,
          especialidad = @especialidad, licencia = @licencia, horario = @horario, estado = @estado
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }

    res.json({ mensaje: "Médico actualizado exitosamente.", medico: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en PUT /medicos/:id:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// PATCH /api/medicos/:id/estado
// Activar/desactivar un médico (en vez de borrarlo — mismo criterio que ya usa el frontend)
router.patch("/:id/estado", async (req, res) => {
  const { estado } = req.body;

  if (!["activo", "inactivo"].includes(estado)) {
    return res.status(400).json({ mensaje: "Estado inválido. Usa 'activo' o 'inactivo'." });
  }

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("estado", sql.VarChar, estado)
      .query("UPDATE medicos SET estado = @estado OUTPUT INSERTED.* WHERE id = @id");

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Médico no encontrado." });
    }

    res.json({ mensaje: "Estado actualizado.", medico: resultado.recordset[0] });
  } catch (error) {
    console.error("Error en PATCH /medicos/:id/estado:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

module.exports = router;
