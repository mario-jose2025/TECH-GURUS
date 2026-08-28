// ==========================================
// LÓGICA DE INICIO DE SESIÓN - VITALIS TECH
// ==========================================

// URL del backend — cámbiala aquí si tu servidor corre en otro puerto
// o cuando lo subas a un servidor real (ej. Render, Railway, Azure).
const API_BASE_URL = "http://localhost:3000/api";

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

  // Clave donde queda "quién es el paciente logueado ahora mismo" —
  // pacientes.js la lee para precargar el nombre real en Mi Perfil.
  const SESION_PACIENTE_KEY = "vitalis_sesion_paciente";

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
    formLogin.addEventListener("submit", async (e) => {
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
        // ✅ Ya NO hay credenciales escritas en el código — el navegador
        // le pregunta al backend, y el backend compara contra la tabla
        // `usuarios` de SQL Server usando bcrypt. Ver README >
        // "Consideraciones de seguridad" para el detalle de este cambio.
        try {
          const respuesta = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, password, rol: "admin" }),
          });

          const datos = await respuesta.json();

          if (!respuesta.ok) {
            mostrarErrorCredenciales(datos.mensaje || "Usuario o contraseña de administrador incorrectos.");
            return;
          }

          // Guardamos los datos reales del admin que inició sesión, para
          // cuando conectemos "Mi Perfil" del admin a estos datos reales
          // en vez de los de ejemplo que usa admindscrip.js hoy.
          localStorage.setItem("vitalis_sesion_admin", JSON.stringify(datos.usuario));
          window.location.href = "admind.html";
        } catch (error) {
          console.error("Error al conectar con el backend:", error);
          mostrarErrorCredenciales("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
        }
        return;
      }

      // Acceso para Paciente — ahora sí contra el backend real, ya que
      // registro.js guarda las cuentas en la tabla `usuarios` de SQL Server.
      try {
        const respuesta = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, password, rol: "paciente" }),
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
          mostrarErrorCredenciales(datos.mensaje || "Usuario o contraseña incorrectos.");
          return;
        }

        // Guardamos quién inició sesión (para las citas nuevas) y el
        // perfil completo que devolvió el backend (para "Mi Perfil").
        localStorage.setItem(SESION_PACIENTE_KEY, datos.usuario.usuario);
        localStorage.setItem("vitalis_perfil_paciente_backend", JSON.stringify(datos.usuario));
        window.location.href = "pacientes.html";
      } catch (error) {
        console.error("Error al conectar con el backend:", error);
        mostrarErrorCredenciales("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
      }
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

  // 4. "¿Olvidaste tu contraseña?" — solo aplica a pacientes, ya que
  // las cuentas de personal de salud las administra el centro, no se
  // autogestionan desde aquí.
  const forgotPasswordLink = document.getElementById("forgotPassword");
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();

      const rolActual = inputRolOculto ? inputRolOculto.value : "paciente";
      if (rolActual === "admin") {
        alert("Para restablecer tu acceso administrativo, contacta al equipo técnico de tu centro de salud.");
        return;
      }

      window.location.href = "recuperar-password.html";
    });
  }
});