// =========================================================
// Script de UNA SOLA VEZ — genera un hash bcrypt para tus
// contraseñas de prueba. Ejecuta con: node generar-hash.js
// =========================================================

const bcrypt = require("bcrypt");

const passwordEnTextoPlano = "admin123"; // cámbiala si quieres otra

bcrypt.hash(passwordEnTextoPlano, 10).then((hash) => {
  console.log("\nContraseña original:", passwordEnTextoPlano);
  console.log("Hash generado:", hash);
  console.log("\nCopia este UPDATE y córrelo en SSMS:\n");
  console.log(
    `UPDATE usuarios SET password_hash = '${hash}' WHERE usuario = 'admin';`
  );
});
