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

  // 1. Control del selector de pestañas (Paciente / Admind)
  botonesTab.forEach(boton => {
    boton.addEventListener("click", (e) => {
      e.preventDefault();

      // Quitar la clase activa de todos los botones y ponerla en el presionado
      botonesTab.forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      
      const tabActual = e.currentTarget;
      tabActual.classList.add("is-active");
      tabActual.setAttribute("aria-selected", "true");

      // Obtener el rol mediante el atributo data-role ("paciente" o "admin")
      const rol = tabActual.getAttribute("data-role");
      if (inputRolOculto) {
        inputRolOculto.value = rol;
      }

      // Ajustar textos dinámicos según el rol seleccionado para darle mejor UX
      if (rol === "admin") {
        if (authTitle) authTitle.textContent = "Acceso Administrativo";
        if (authSubtitle) authSubtitle.textContent = "Ingresa con tus credenciales de personal de salud o administración.";
        if (registerPrompt) registerPrompt.style.display = "none"; // Los admins no se registran por aquí
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

      const usuario = document.getElementById("username")?.value.trim();
      const password = document.getElementById("password")?.value.trim();
      const rolSeleccionado = inputRolOculto ? inputRolOculto.value : "paciente";

      // Validaciones básicas
      if (!usuario || !password) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      // 3. Simulación de redirección según el rol antes de conectar el backend
      if (rolSeleccionado === "admin") {
        // Credenciales temporales de prueba para Admin
        if (usuario === "admin" && password === "admin123") {
          alert("¡Acceso exitoso al panel de administración!");
          window.location.href = "admind.html"; // O la ruta a tu panel de admin
        } else {
          alert("Usuario o contraseña de administrador incorrectos.");
        }
      } else {
        // Acceso para Paciente
        alert(`¡Bienvenido, ${usuario}!`);
        window.location.href = "pacientes.html"; // Te manda al panel del paciente que diseñamos antes
      }
    });
  }

  // 4. Funcionalidad opcional para mostrar/ocultar contraseña
  const togglePasswordBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  
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
});