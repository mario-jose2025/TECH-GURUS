/* =========================================================
   VITALIS TECH — pages/recuperar-password.js
   Recuperación de contraseña en 2 pasos:
   1) Identificar la cuenta por usuario o correo.
   2) Establecer una nueva contraseña.
   ========================================================= */

(function () {
  const CUENTAS_PACIENTES_KEY = "vitalis_cuentas_pacientes";

  function obtenerCuentasPacientes() {
    const raw = localStorage.getItem(CUENTAS_PACIENTES_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer las cuentas guardadas.", e);
      return [];
    }
  }

  function guardarCuentasPacientes(lista) {
    localStorage.setItem(CUENTAS_PACIENTES_KEY, JSON.stringify(lista));
  }

  // ---------- Paso 1: Buscar la cuenta ----------

  const pasoBuscarCuenta = document.getElementById("pasoBuscarCuenta");
  const pasoNuevaPassword = document.getElementById("pasoNuevaPassword");
  const formBuscarCuenta = document.getElementById("form-buscar-cuenta");
  const identificadorInput = document.getElementById("identificador");
  const identificadorGroup = document.getElementById("identificadorGroup");

  const nombrePacienteEncontrado = document.getElementById("nombrePacienteEncontrado");
  const usuarioPacienteEncontrado = document.getElementById("usuarioPacienteEncontrado");

  let usuarioEnRecuperacion = null; // guarda qué cuenta se está restableciendo

  formBuscarCuenta.addEventListener("submit", function (event) {
    event.preventDefault();

    const valor = identificadorInput.value.trim().toLowerCase();
    if (!valor) {
      identificadorGroup.classList.add("has-error");
      return;
    }

    const cuentas = obtenerCuentasPacientes();
    const cuenta = cuentas.find(
      (c) => c.usuario.toLowerCase() === valor || c.correo.toLowerCase() === valor
    );

    if (!cuenta) {
      identificadorGroup.classList.add("has-error");
      return;
    }

    identificadorGroup.classList.remove("has-error");
    usuarioEnRecuperacion = cuenta.usuario;

    // Mostrar el paso 2 con los datos reales de la cuenta encontrada
    nombrePacienteEncontrado.textContent = cuenta.nombres;
    usuarioPacienteEncontrado.textContent = `@${cuenta.usuario}`;

    pasoBuscarCuenta.style.display = "none";
    pasoNuevaPassword.style.display = "block";
  });

  identificadorInput.addEventListener("input", function () {
    identificadorGroup.classList.remove("has-error");
  });

  // ---------- Paso 2: Establecer nueva contraseña ----------

  const formNuevaPassword = document.getElementById("form-nueva-password");
  const nuevaPasswordInput = document.getElementById("nuevaPassword");
  const confirmarPasswordInput = document.getElementById("confirmarPassword");
  const nuevaPasswordGroup = document.getElementById("nuevaPasswordGroup");
  const confirmarPasswordGroup = document.getElementById("confirmarPasswordGroup");
  const cambiarCuentaLink = document.getElementById("cambiarCuentaLink");

  formNuevaPassword.addEventListener("submit", function (event) {
    event.preventDefault();

    let esValido = true;

    if (nuevaPasswordInput.value.length < 6) {
      nuevaPasswordGroup.classList.add("has-error");
      esValido = false;
    } else {
      nuevaPasswordGroup.classList.remove("has-error");
    }

    if (
      confirmarPasswordInput.value !== nuevaPasswordInput.value ||
      confirmarPasswordInput.value === ""
    ) {
      confirmarPasswordGroup.classList.add("has-error");
      esValido = false;
    } else {
      confirmarPasswordGroup.classList.remove("has-error");
    }

    if (!esValido || !usuarioEnRecuperacion) return;

    // Actualizar la contraseña de verdad en la cuenta guardada
    const cuentas = obtenerCuentasPacientes();
    const indice = cuentas.findIndex(
      (c) => c.usuario.toLowerCase() === usuarioEnRecuperacion.toLowerCase()
    );

    if (indice === -1) {
      alert("No pudimos encontrar tu cuenta. Intenta de nuevo.");
      return;
    }

    cuentas[indice].password = nuevaPasswordInput.value;
    guardarCuentasPacientes(cuentas);

    alert("¡Tu contraseña se restableció exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña.");

    // Dejamos el usuario listo para que login.js lo precargue
    sessionStorage.setItem("vitalis_ultimo_usuario_registrado", cuentas[indice].usuario);
    window.location.href = "login.html";
  });

  [nuevaPasswordInput, confirmarPasswordInput].forEach(function (input) {
    input.addEventListener("input", function () {
      input.closest(".form-group").classList.remove("has-error");
    });
  });

  // Volver al paso 1 por si la persona buscó la cuenta equivocada
  cambiarCuentaLink.addEventListener("click", function (event) {
    event.preventDefault();
    usuarioEnRecuperacion = null;
    formNuevaPassword.reset();
    identificadorInput.value = "";
    pasoNuevaPassword.style.display = "none";
    pasoBuscarCuenta.style.display = "block";
    identificadorInput.focus();
  });
})();
