/* =========================================================
   VITALIS TECH — loading.js
   Controla la pantalla de carga que se muestra al abrir el sitio.
   ========================================================= */

(function () {
  const MIN_DISPLAY_TIME = 1400; // ms — tiempo mínimo que se ve el loader

  const loader = document.getElementById("loader");
  const site = document.getElementById("site");
  const startedAt = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(MIN_DISPLAY_TIME - elapsed, 0);

    window.setTimeout(function () {
      loader.classList.add("is-hidden");
      site.classList.add("is-visible");

      // Saca el loader del DOM visual por completo cuando termina la transición
      loader.addEventListener(
        "transitionend",
        function () {
          loader.style.display = "none";
        },
        { once: true }
      );
    }, remaining);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader);
  }
})();
