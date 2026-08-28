// =========================================================
// VITALIS TECH — Backend
// Conexión a SQL Server (una sola vez, reutilizada en todas las rutas)
// =========================================================

require("dotenv").config();
const sql = require("mssql");

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // poner en true si usas Azure SQL
    trustServerCertificate: true, // necesario para desarrollo local
  },
};

let poolPromise;

// Reutiliza la misma conexión en vez de abrir una nueva en cada petición
function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log("✅ Conectado a SQL Server:", process.env.DB_DATABASE);
        return pool;
      })
      .catch((err) => {
        console.error("❌ Error conectando a SQL Server:", err.message);
        poolPromise = null; // permite reintentar en la siguiente petición
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
