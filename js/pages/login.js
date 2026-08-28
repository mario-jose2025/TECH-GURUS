// ==========================================
// LÓGICA DE INICIO DE SESIÓN - VITALIS TECH
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("loginForm");
  const botonesTab = document.querySelectorAll(".auth-tab");
  const inputRolOculto = document.getElementById("selectedRole");

  const authTitle = document.getElementById("authTitle");
  const authSubtitle = document.getElementById("authSubtitle");
  const registerPrompt = document.getElementById("registerPrompt");

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const usernameGroup = document.getElementById("usernameGroup");
  const passwordGroup = document.getElementById("passwordGroup");
  const usernameError = document.getElementById("usernameError");
  const passwordError = document.getElementById("passwordError");

  // Misma clave que usa registro.js para guardar las cuentas de pacientes
  const CUENTAS_PACIENTES_KEY = "vitalis_cuentas_pacientes";
  // Clave donde queda "quién es el paciente logueado ahora mismo" —
  // pacientes.js la lee para precargar el nombre real en Mi Perfil.
  const SESION_PACIENTE_KEY = "vitalis_sesion_paciente";

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

  function limpiarErroresLogin() {
    usernameGroup.classList.remove("has-error");
    passwordGroup.classList.remove("has-error");
  }

  function mostrarErrorCredenciales(mensaje) {
    usernameError.textContent = mensaje;
    passwordError.textContent = mensaje;
    usernameGroup.classList.add("has-error");
    passwordGroup.classList.add("has-error");
  }

  // Si el paciente acaba de registrarse, le precargamos su usuario
  // para que no tenga que volver a escribirlo.
  const usuarioRecienRegistrado = sessionStorage.getItem("vitalis_ultimo_usuario_registrado");
  if (usuarioRecienRegistrado && usernameInput) {
    usernameInput.value = usuarioRecienRegistrado;
    sessionStorage.removeItem("vitalis_ultimo_usuario_registrado");
    if (passwordInput) passwordInput.focus();
  }

  // 1. Control del selector de pestañas (Paciente / Personal de salud)
  botonesTab.forEach((boton) => {
    boton.addEventListener("click", (e) => {
      e.preventDefault();

      botonesTab.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });

      const tabActual = e.currentTarget;
      tabActual.classList.add("is-active");
      tabActual.setAttribute("aria-selected", "true");

      const rol = tabActual.getAttribute("data-role");
      if (inputRolOculto) inputRolOculto.value = rol;

      limpiarErroresLogin();

      if (rol === "admin") {
        if (authTitle) authTitle.textContent = "Acceso Administrativo";
        if (authSubtitle) authSubtitle.textContent = "Ingresa con tus credenciales de personal de salud o administración.";
        if (registerPrompt) registerPrompt.style.display = "none"; // el personal de salud no se autorregistra
      } else {
        if (authTitle) authTitle.textContent = "Bienvenido de nuevo";
        if (authSubtitle) authSubtitle.textContent = "Ingresa tus datos para ver tus citas, resultados y más.";
        if (registerPrompt) registerPrompt.style.display = "block";
      }
    });
  });

  // 2. Manejo del envío del formulario (Login)
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      limpiarErroresLogin();

      const usuario = usernameInput?.value.trim();
      const password = passwordInput?.value.trim();
      const rolSeleccionado = inputRolOculto ? inputRolOculto.value : "paciente";

      if (!usuario || !password) {
        mostrarErrorCredenciales("Completa usuario y contraseña.");
        return;
      }

      if (rolSeleccionado === "admin") {
        // Credenciales temporales de prueba para Admin — el personal de
        // salud no se autorregistra, sus cuentas las crea el centro
        // (esto se vuelve una validación real contra el backend más adelante).
        if (usuario === "admin" && password === "admin123") {
          window.location.href = "admind.html";
        } else {
          mostrarErrorCredenciales("Usuario o contraseña de administrador incorrectos.");
        }
        return;
      }

      // Acceso para Paciente — validar contra las cuentas reales
      // creadas desde registro.html.
      const cuentas = obtenerCuentasPacientes();
      const cuenta = cuentas.find(
        (c) => c.usuario.toLowerCase() === usuario.toLowerCase() && c.password === password
      );

      if (!cuenta) {
        mostrarErrorCredenciales("Usuario o contraseña incorrectos.");
        return;
      }

      // Guardamos quién inició sesión para que pacientes.js pueda
      // precargar sus datos reales en Mi Perfil y en las citas nuevas.
      localStorage.setItem(SESION_PACIENTE_KEY, cuenta.usuario);
      window.location.href = "pacientes.html";
    });
  }

  // 3. Mostrar / ocultar contraseña
  const togglePasswordBtn = document.getElementById("togglePassword");

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const tipoActual = passwordInput.getAttribute("type");
      if (tipoActual === "password") {
        passwordInput.setAttribute("type", "text");
        togglePasswordBtn.style.opacity = "1";
      } else {
        passwordInput.setAttribute("type", "password");
        togglePasswordBtn.style.opacity = "0.6";
      }
    });
  }

  // Quitar el estado de error apenas el paciente empieza a corregir
  [usernameInput, passwordInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", limpiarErroresLogin);
  });
});
