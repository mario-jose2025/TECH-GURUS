/* =========================================================
   VITALIS TECH — pages/login.js
   Comportamiento de la pantalla de login:
   - Selector de rol (paciente / personal de salud)
   - Mostrar/ocultar contraseña
   - Validación básica del formulario
   ========================================================= */

(function () {
  const tabPaciente = document.getElementById("tabPaciente");
  const tabAdmin = document.getElementById("tabAdmin");
  const selectedRole = document.getElementById("selectedRole");
  const authTitle = document.getElementById("authTitle");
  const authSubtitle = document.getElementById("authSubtitle");
  const registerPrompt = document.getElementById("registerPrompt");

  const COPY = {
    paciente: {
      title: "Bienvenido de nuevo",
      subtitle: "Ingresa tus datos para ver tus citas, resultados y más.",
    },
    admin: {
      title: "Acceso de personal de salud",
      subtitle: "Ingresa con las credenciales asignadas por tu centro de salud.",
    },
  };

  function setActiveRole(role) {
    selectedRole.value = role;

    const isPaciente = role === "paciente";

    tabPaciente.classList.toggle("is-active", isPaciente);
    tabPaciente.setAttribute("aria-selected", String(isPaciente));

    tabAdmin.classList.toggle("is-active", !isPaciente);
    tabAdmin.setAttribute("aria-selected", String(!isPaciente));

    authTitle.textContent = COPY[role].title;
    authSubtitle.textContent = COPY[role].subtitle;

    // El personal de salud no se autorregistra: sus cuentas
    // las crea el centro, así que ocultamos el link de registro.
    registerPrompt.classList.toggle("is-hidden", !isPaciente);
  }

  tabPaciente.addEventListener("click", function () {
    setActiveRole("paciente");
  });

  tabAdmin.addEventListener("click", function () {
    setActiveRole("admin");
  });

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

  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const usernameGroup = document.getElementById("usernameGroup");
  const passwordGroup = document.getElementById("passwordGroup");

  function isValidUsername(value) {
    return value.trim().length >= 3;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    let isValid = true;

    if (!isValidUsername(usernameInput.value)) {
      usernameGroup.classList.add("has-error");
      isValid = false;
    } else {
      usernameGroup.classList.remove("has-error");
    }

    if (passwordInput.value.length < 6) {
      passwordGroup.classList.add("has-error");
      isValid = false;
    } else {
      passwordGroup.classList.remove("has-error");
    }

    if (!isValid) return;

    // Placeholder — aquí se conectará la llamada real al backend.
    console.log("[Vitalis Tech] Intento de login:", {
      role: selectedRole.value,
      username: usernameInput.value.trim(),
    });

    // Ejemplo de a dónde redirigir una vez exista el backend:
    // const destino = selectedRole.value === "admin"
    //   ? "dashboard-admin.html"
    //   : "dashboard-paciente.html";
    // window.location.href = destino;
  });

  // Quita el estado de error apenas el usuario empieza a corregir
  usernameInput.addEventListener("input", function () {
    usernameGroup.classList.remove("has-error");
  });
  passwordInput.addEventListener("input", function () {
    passwordGroup.classList.remove("has-error");
  });
})();
