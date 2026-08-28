// =========================================================
// VITALIS TECH — Backend
// Rutas de autenticación
// =========================================================

const express = require("express");
const bcrypt = require("bcrypt");
const { sql, getPool } = require("../db");

const router = express.Router();

// POST /api/login
// Recibe: { usuario, password, rol }  (rol es opcional: "paciente" o "admin")
router.post("/login", async (req, res) => {
  const { usuario, password, rol } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: "Usuario y contraseña son obligatorios." });
  }

  try {
    const pool = await getPool();

    const resultado = await pool
      .request()
      .input("usuario", sql.VarChar, usuario)
      .query("SELECT * FROM usuarios WHERE usuario = @usuario");

    const cuenta = resultado.recordset[0];

    // Mismo mensaje genérico tanto si el usuario no existe como si la
    // contraseña está mal — no le damos pistas a quien intenta adivinar.
    if (!cuenta) {
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos." });
    }

    const passwordValida = await bcrypt.compare(password, cuenta.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos." });
    }

    if (cuenta.estado !== "activo") {
      return res.status(403).json({ mensaje: "Esta cuenta está inactiva. Contacta al centro de salud." });
    }

    // Si el frontend especificó un rol (pestaña "Paciente" / "Personal de salud"),
    // confirmamos que la cuenta encontrada de verdad tenga ese rol.
    if (rol && cuenta.rol !== rol) {
      return res.status(403).json({ mensaje: "Esta cuenta no corresponde a ese tipo de acceso." });
    }

    // Nunca se devuelve el hash de la contraseña al frontend
    delete cuenta.password_hash;

    res.json({
      mensaje: "Login exitoso",
      usuario: cuenta,
    });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ mensaje: "Error del servidor. Intenta de nuevo." });
  }
});

// POST /api/registro
// Crea una cuenta nueva de paciente. El personal de salud no se
// autorregistra por aquí — sus cuentas las crea el centro directamente
// en la base de datos (rol = 'admin').
router.post("/registro", async (req, res) => {
  const { nombres, apellidos, correo, usuario, telefono, password } = req.body;

  if (!nombres || !apellidos || !correo || !usuario || !telefono || !password) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
  }

  if (password.length < 6) {
    return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres." });
  }

  try {
    const pool = await getPool();

    // Verificar que el usuario o correo no estén ya registrados
    const existente = await pool
      .request()
      .input("usuario", sql.VarChar, usuario)
      .input("correo", sql.VarChar, correo)
      .query("SELECT id, usuario, correo FROM usuarios WHERE usuario = @usuario OR correo = @correo");

    if (existente.recordset.length > 0) {
      const coincidencia = existente.recordset[0];
      const campo = coincidencia.usuario.toLowerCase() === usuario.toLowerCase() ? "usuario" : "correo";
      return res.status(409).json({ mensaje: `Ese ${campo} ya está registrado. Elige otro.` });
    }

    // La contraseña NUNCA se guarda en texto plano — se hashea con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const resultado = await pool
      .request()
      .input("nombres", sql.VarChar, nombres)
      .input("apellidos", sql.VarChar, apellidos)
      .input("correo", sql.VarChar, correo)
      .input("usuario", sql.VarChar, usuario)
      .input("password_hash", sql.VarChar, passwordHash)
      .input("telefono", sql.VarChar, telefono)
      .query(`
        INSERT INTO usuarios (nombres, apellidos, correo, usuario, password_hash, telefono, rol, estado)
        OUTPUT INSERTED.id, INSERTED.nombres, INSERTED.apellidos, INSERTED.correo,
               INSERTED.usuario, INSERTED.telefono, INSERTED.fecha_registro
        VALUES (@nombres, @apellidos, @correo, @usuario, @password_hash, @telefono, 'paciente', 'activo')
      `);

    res.status(201).json({
      mensaje: "Cuenta creada exitosamente",
      usuario: resultado.recordset[0],
    });
  } catch (error) {
    console.error("Error en /registro:", error);
    res.status(500).json({ mensaje: "Error del servidor. Intenta de nuevo." });
  }
});

module.exports = router;