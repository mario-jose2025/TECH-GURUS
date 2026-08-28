/* =========================================================
   VITALIS TECH — pages/registro.js
   Comportamiento de la pantalla de registro de paciente:
   mostrar/ocultar contraseña, validación y envío del formulario.
   ========================================================= */

// URL del backend — misma que usa login.js
const API_BASE_URL = "http://localhost:3000/api";

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

  form.addEventListener("submit", async function (event) {
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

    const nuevaCuenta = {
      nombres: firstNameInput.value.trim(),
      apellidos: lastNameInput.value.trim(),
      correo: emailInput.value.trim(),
      usuario: usernameInput.value.trim(),
      telefono: phoneInput.value.trim(),
      password: passwordInput.value,
    };

    // Deshabilitar el botón mientras se procesa, para evitar doble clic
    const botonSubmit = document.getElementById("btnSubmit");
    if (botonSubmit) botonSubmit.disabled = true;

    try {
      const respuesta = await fetch(`${API_BASE_URL}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCuenta),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        // El backend nos dice si fue el usuario o el correo lo que ya existía
        usernameError.textContent = datos.mensaje || "No se pudo crear la cuenta. Intenta de nuevo.";
        setError(usernameGroup, true);
        return;
      }

      alert(`¡Cuenta creada exitosamente, ${nuevaCuenta.nombres}! Ahora inicia sesión con tu usuario y contraseña.`);

      // Dejamos el usuario recién creado listo para que el login lo
      // precargue, así el paciente no tiene que volver a escribirlo.
      sessionStorage.setItem("vitalis_ultimo_usuario_registrado", nuevaCuenta.usuario);

      window.location.href = "login.html";
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("No se pudo conectar con el servidor. ¿Está corriendo el backend? (npm start en la carpeta Backend)");
    } finally {
      if (botonSubmit) botonSubmit.disabled = false;
    }
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