/* =========================================================
   VITALIS TECH — components/navbar.js
   Comportamiento del navbar: sombra al hacer scroll y botón
   de "Iniciar sesión". Se incluye en TODAS las páginas del sitio.
   ========================================================= */

(function () {
  const navbar = document.getElementById("navbar");
  const btnLogin = document.getElementById("btnLogin");

  if (!navbar) return; // esta página no tiene navbar

  // Sombra en el navbar al hacer scroll
  function handleScroll() {
    if (window.scrollY > 8) {
      navbar.classList.add("is-scrolled");
    } else {
      navbar.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", handleScroll, { passive: true });

  // Placeholder de navegación — se conecta a la pantalla real de login
  // cuando exista.
  if (btnLogin) {
    btnLogin.addEventListener("click", function () {
      console.log("[Vitalis Tech] Ir a: Iniciar sesión");
      // window.location.href = "pages/login.html";
    });
  }
})();
