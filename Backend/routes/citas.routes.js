// =========================================================
// VITALIS TECH — Backend
// Rutas de citas
// =========================================================

const express = require("express");
const { sql, getPool } = require("../db");

const router = express.Router();

// Query base reutilizada — trae el nombre del paciente y del médico ya
// armados como texto legible (evita que el frontend tenga que hacer
// otra consulta aparte solo para mostrar nombres).
const SELECT_CITAS_CON_NOMBRES = `
  SELECT
    c.*,
    u.nombres + ' ' + u.apellidos AS nombrePaciente,
    m.tratamiento + ' ' + m.nombres + ' ' + m.apellidos AS medico
  FROM citas c
  INNER JOIN usuarios u ON c.paciente_id = u.id
  INNER JOIN medicos m ON c.medico_id = m.id
`;

// GET /api/citas
// Admite ?paciente_id=X (panel del paciente) o sin filtro (Agenda Médica del admin)
router.get("/", async (req, res) => {
  const { paciente_id, estado } = req.query;

  try {
    const pool = await getPool();
    const request = pool.request();

    let query = SELECT_CITAS_CON_NOMBRES;
    const condiciones = [];

    if (paciente_id) {
      request.input("paciente_id", sql.Int, paciente_id);
      condiciones.push("c.paciente_id = @paciente_id");
    }
    if (estado) {
      request.input("estado", sql.VarChar, estado);
      condiciones.push("c.estado = @estado");
    }
    if (condiciones.length > 0) {
      query += " WHERE " + condiciones.join(" AND ");
    }
    query += " ORDER BY c.fecha DESC, c.hora DESC";

    const resultado = await request.query(query);
    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error en GET /citas:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// POST /api/citas
// Crear una cita nueva. Si la crea el paciente (agendar cita en línea),
// arranca "pendiente". Si la crea el admin directamente, se le puede
// mandar estado "confirmada" desde el body.
router.post("/", async (req, res) => {
  const {
    paciente_id, medico_id, fecha, hora, especialidad,
    centro, consultorio, tipo_atencion, motivo, telefono_contacto, estado,
  } = req.body;

  if (!paciente_id || !medico_id || !fecha || !hora) {
    return res.status(400).json({ mensaje: "Paciente, médico, fecha y hora son obligatorios." });
  }

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("paciente_id", sql.Int, paciente_id)
      .input("medico_id", sql.Int, medico_id)
      .input("fecha", sql.Date, fecha)
      .input("hora", sql.VarChar, hora)
      .input("especialidad", sql.VarChar, especialidad || null)
      .input("centro", sql.VarChar, centro || "Sede Central (Managua)")
      .input("consultorio", sql.Int, consultorio || Math.floor(Math.random() * 5) + 1)
      .input("tipo_atencion", sql.VarChar, tipo_atencion || null)
      .input("motivo", sql.VarChar, motivo || null)
      .input("telefono_contacto", sql.VarChar, telefono_contacto || null)
      .input("estado", sql.VarChar, estado || "pendiente")
      .query(`
        INSERT INTO citas (paciente_id, medico_id, fecha, hora, especialidad, centro, consultorio, tipo_atencion, motivo, telefono_contacto, estado)
        OUTPUT INSERTED.id
        VALUES (@paciente_id, @medico_id, @fecha, @hora, @especialidad, @centro, @consultorio, @tipo_atencion, @motivo, @telefono_contacto, @estado)
      `);

    const nuevoId = resultado.recordset[0].id;

    // Volvemos a consultarla con los JOIN para devolver los nombres legibles
    const citaCompleta = await pool
      .request()
      .input("id", sql.Int, nuevoId)
      .query(SELECT_CITAS_CON_NOMBRES + " WHERE c.id = @id");

    res.status(201).json({ mensaje: "Cita creada exitosamente.", cita: citaCompleta.recordset[0] });
  } catch (error) {
    console.error("Error en POST /citas:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

// PATCH /api/citas/:id/estado
// Confirmar, cancelar, o marcar como atendida una cita
router.patch("/:id/estado", async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ["pendiente", "confirmada", "atendida", "cancelada"];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ mensaje: `Estado inválido. Usa uno de: ${estadosValidos.join(", ")}.` });
  }

  try {
    const pool = await getPool();
    const resultado = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("estado", sql.VarChar, estado)
      .query("UPDATE citas SET estado = @estado OUTPUT INSERTED.id WHERE id = @id");

    if (resultado.recordset.length === 0) {
      return res.status(404).json({ mensaje: "Cita no encontrada." });
    }

    const citaActualizada = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(SELECT_CITAS_CON_NOMBRES + " WHERE c.id = @id");

    res.json({ mensaje: "Estado de la cita actualizado.", cita: citaActualizada.recordset[0] });
  } catch (error) {
    console.error("Error en PATCH /citas/:id/estado:", error);
    res.status(500).json({ mensaje: "Error del servidor." });
  }
});

module.exports = router;
