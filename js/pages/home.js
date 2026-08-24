/* =========================================================
   VITALIS TECH — pages/home.js
   Comportamiento específico de la pantalla de inicio (index.html).
   ========================================================= */

(function () {
  const btnRegister = document.getElementById("btnRegister");

  if (btnRegister) {
    btnRegister.addEventListener("click", function () {
      console.log("[Vitalis Tech] Ir a: Crear cuenta");
      // window.location.href = "pages/registro.html";
    });
  }
})();
