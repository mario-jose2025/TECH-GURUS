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

    // Placeholder — aquí se conectará la llamada real al backend.
    console.log("[Vitalis Tech] Registro de paciente:", {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      username: usernameInput.value.trim(),
      phone: phoneInput.value.trim(),
    });

    // Una vez exista el backend: registrar al usuario y mandarlo a
    // iniciar sesión con el usuario que acaba de crear.
    // window.location.href = "login.html";
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
})();
