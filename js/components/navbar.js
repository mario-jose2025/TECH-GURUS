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

  // Navegación real a la pantalla de login.
  if (btnLogin) {
    btnLogin.addEventListener("click", function () {
      window.location.href = "pages/login.html";
    });
  }
})();
