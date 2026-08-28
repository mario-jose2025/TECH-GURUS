/* =========================================================
   VITALIS TECH — pages/registro.js
   Comportamiento de la pantalla de registro de paciente:
   mostrar/ocultar contraseña, validación y envío del formulario.
   ========================================================= */

(function () {
  // ---------- Mostrar / ocultar contraseña ----------

  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  togglePassword.addEventListener("click", function () {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    togglePassword.setAttribute(
      "aria-label",
      isVisible ? "Mostrar contraseña" : "Ocultar contraseña"
    );
  });

  // ---------- Validación y envío ----------

  const form = document.getElementById("registerForm");

  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const usernameInput = document.getElementById("username");
  const phoneInput = document.getElementById("phone");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const termsInput = document.getElementById("terms");

  const firstNameGroup = document.getElementById("firstNameGroup");
  const lastNameGroup = document.getElementById("lastNameGroup");
  const emailGroup = document.getElementById("emailGroup");
  const usernameGroup = document.getElementById("usernameGroup");
  const phoneGroup = document.getElementById("phoneGroup");
  const passwordGroup = document.getElementById("passwordGroup");
  const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
  const usernameError = document.getElementById("usernameError");

  // ---------- Cuentas de pacientes (localStorage) ----------
  // Misma clave que usará login.js para validar credenciales y
  // pacientes.js para precargar "Mi Perfil" con los datos reales.
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

  function fechaHoyFormateada() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${hoy.getFullYear()}`;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidUsername(value) {
    // Al menos 4 caracteres, sin espacios (letras, números, puntos, guiones, guion bajo)
    return /^[a-zA-Z0-9._-]{4,}$/.test(value.trim());
  }

  function isValidPhone(value) {
    // Acepta números de 8 dígitos (formato nicaragüense), con o sin espacios/guiones
    return /^[\d\s-]{8,}$/.test(value.trim());
  }

  function setError(group, hasError) {
    group.classList.toggle("has-error", hasError);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;

    if (firstNameInput.value.trim().length < 2) {
      setError(firstNameGroup, true);
      isValid = false;
    } else {
      setError(firstNameGroup, false);
    }

    if (lastNameInput.value.trim().length < 2) {
      setError(lastNameGroup, true);
      isValid = false;
    } else {
      setError(lastNameGroup, false);
    }

    if (!isValidEmail(emailInput.value.trim())) {
      setError(emailGroup, true);
      isValid = false;
    } else {
      setError(emailGroup, false);
    }

    if (!isValidUsername(usernameInput.value)) {
      usernameError.textContent = "El usuario debe tener al menos 4 caracteres, sin espacios.";
      setError(usernameGroup, true);
      isValid = false;
    } else if (
      obtenerCuentasPacientes().some(
        (cuenta) => cuenta.usuario.toLowerCase() === usernameInput.value.trim().toLowerCase()
      )
    ) {
      usernameError.textContent = "Ese usuario ya está en uso. Elige otro.";
      setError(usernameGroup, true);
      isValid = false;
    } else {
      setError(usernameGroup, false);
    }

    if (!isValidPhone(phoneInput.value)) {
      setError(phoneGroup, true);
      isValid = false;
    } else {
      setError(phoneGroup, false);
    }

    if (passwordInput.value.length < 6) {
      setError(passwordGroup, true);
      isValid = false;
    } else {
      setError(passwordGroup, false);
    }

    if (confirmPasswordInput.value !== passwordInput.value || confirmPasswordInput.value === "") {
      setError(confirmPasswordGroup, true);
      isValid = false;
    } else {
      setError(confirmPasswordGroup, false);
    }

    if (!termsInput.checked) {
      isValid = false;
      termsInput.focus();
    }

    if (!isValid) return;

    // Guardar la cuenta de verdad — esto es lo que login.js va a
    // validar, y lo que pacientes.js va a mostrar en "Mi Perfil".
    const nuevaCuenta = {
      nombres: firstNameInput.value.trim(),
      apellidos: lastNameInput.value.trim(),
      correo: emailInput.value.trim(),
      usuario: usernameInput.value.trim(),
      telefono: phoneInput.value.trim(),
      password: passwordInput.value, // demo sin backend — en producción esto se hashea en el servidor, nunca se guarda en texto plano
      fechaRegistro: fechaHoyFormateada(),
    };

    const cuentas = obtenerCuentasPacientes();
    cuentas.push(nuevaCuenta);
    guardarCuentasPacientes(cuentas);

    alert(`¡Cuenta creada exitosamente, ${nuevaCuenta.nombres}! Ahora inicia sesión con tu usuario y contraseña.`);

    // Dejamos el usuario recién creado listo para que el login lo
    // precargue, así el paciente no tiene que volver a escribirlo.
    sessionStorage.setItem("vitalis_ultimo_usuario_registrado", nuevaCuenta.usuario);

    window.location.href = "login.html";
  });

  // Quita el estado de error apenas el usuario empieza a corregir
  [
    firstNameInput,
    lastNameInput,
    emailInput,
    usernameInput,
    phoneInput,
    passwordInput,
    confirmPasswordInput,
  ].forEach(function (input) {
    input.addEventListener("input", function () {
      input.closest(".form-group").classList.remove("has-error");
    });
  });

  // ---------- Modal de Términos y Condiciones ----------

  const linkTerminos = document.getElementById("linkTerminos");
  const modalTerminos = document.getElementById("modalTerminos");
  const cerrarModalTerminos = document.getElementById("cerrarModalTerminos");
  const entendidoModalTerminos = document.getElementById("entendidoModalTerminos");

  function abrirModalTerminos(event) {
    event.preventDefault();
    modalTerminos.classList.add("is-open");
    modalTerminos.setAttribute("aria-hidden", "false");
  }

  function cerrarModal() {
    modalTerminos.classList.remove("is-open");
    modalTerminos.setAttribute("aria-hidden", "true");
  }

  linkTerminos.addEventListener("click", abrirModalTerminos);
  cerrarModalTerminos.addEventListener("click", cerrarModal);
  entendidoModalTerminos.addEventListener("click", cerrarModal);

  // Cerrar al hacer clic fuera de la tarjeta (en el fondo oscuro)
  modalTerminos.addEventListener("click", function (event) {
    if (event.target === modalTerminos) cerrarModal();
  });

  // Cerrar con la tecla Escape
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modalTerminos.classList.contains("is-open")) {
      cerrarModal();
    }
  });
})();
