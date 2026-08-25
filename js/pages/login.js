// ==========================================
// 1. NAVEGACIÓN Y CAMBIO DE SECCIONES (MENU)
// ==========================================
function mostrarSeccion(idSeccion, idNav) {
  // Ocultar todas las secciones con la clase .content-section
  const secciones = document.querySelectorAll('.content-section');
  secciones.forEach(sec => {
    sec.style.display = 'none';
  });

  // Mostrar únicamente la sección seleccionada
  const seccionActiva = document.getElementById('sec-' + idSeccion);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';
  }

  // Actualizar la clase 'active' en el menú lateral
  const itemsNav = document.querySelectorAll('.sidebar .nav-item');
  itemsNav.forEach(item => {
    item.classList.remove('active');
  });

  const navActivo = document.getElementById(idNav);
  if (navActivo) {
    navActivo.classList.add('active');
  }
}

// Inicializar vista por defecto y gráficos al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  // Cargar Dashboard Resumen como vista inicial
  mostrarSeccion('resumen', 'nav-resumen');
  
  // Inicializar gráficos estadísticas
  inicializarGraficosSalud();
});


// ==========================================
// 2. ACTUALIZAR INPUT FILE BOOTSTRAP
// ==========================================
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "lab-archivo") {
    const fileName = e.target.files[0]?.name || "Examinar y adjuntar resultado...";
    const label = document.getElementById("lab-archivo-label");
    if (label) label.textContent = fileName;
  }
});


// ==========================================
// 3. EVENTOS DE FORMULARIOS
// ==========================================

// Formulario: Registrar Paciente
const formPaciente = document.getElementById("form-registrar-paciente");
if (formPaciente) {
  formPaciente.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Paciente registrado exitosamente!");
    formPaciente.reset();
  });
}

// Formulario: Crear Expediente
const formExpediente = document.getElementById("form-crear-expediente");
if (formExpediente) {
  formExpediente.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Expediente clínico generado exitosamente!");
    formExpediente.reset();
  });
}

// Formulario: Consultas Médicas
const formConsulta = document.getElementById("form-registrar-consulta");
if (formConsulta) {
  formConsulta.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Consulta médica guardada exitosamente!");
    formConsulta.reset();
  });
}

// Formulario: Subir Resultados de Laboratorio
const formLaboratorio = document.getElementById("form-subir-laboratorio");
if (formLaboratorio) {
  formLaboratorio.addEventListener("submit", (e) => {
    e.preventDefault();

    const archivoInput = document.getElementById("lab-archivo");
    const datosLaboratorio = {
      paciente: document.getElementById("lab-paciente").value,
      tipoExamen: document.getElementById("lab-tipo").value,
      fecha: document.getElementById("lab-fecha").value,
      estado: document.getElementById("lab-estado").value,
      observaciones: document.getElementById("lab-observaciones").value,
      nombreArchivo: archivoInput.files[0]?.name || "Ningún archivo seleccionado"
    };

    if (!datosLaboratorio.paciente || !datosLaboratorio.tipoExamen || !archivoInput.files.length) {
      alert("Por favor completa todos los campos obligatorios (*) y adjunta un archivo.");
      return;
    }

    console.log("Examen cargado listo para enviar al servidor:", datosLaboratorio);
    alert(`¡Resultado de laboratorio subido exitosamente para el paciente!`);

    formLaboratorio.reset();
    const label = document.getElementById("lab-archivo-label");
    if (label) label.textContent = "Examinar y adjuntar resultado...";
  });
}

// Formulario: Programar Cita Médica
const formAgenda = document.getElementById("form-programar-cita");
if (formAgenda) {
  formAgenda.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevaCita = {
      paciente: document.getElementById("age-paciente").value,
      medico: document.getElementById("age-medico").value,
      fecha: document.getElementById("age-fecha").value,
      hora: document.getElementById("age-hora").value,
      tipo: document.getElementById("age-tipo").value,
      notas: document.getElementById("age-notas").value
    };

    if (!nuevaCita.paciente || !nuevaCita.medico || !nuevaCita.fecha || !nuevaCita.hora) {
      alert("Por favor completa los campos obligatorios (*) de la cita.");
      return;
    }

    console.log("Cita agendada para guardar:", nuevaCita);
    alert(`¡Cita programada con éxito para el ${nuevaCita.fecha} a las ${nuevaCita.hora}!`);

    formAgenda.reset();
  });
}


// ==========================================
// 4. GRÁFICOS INTERACTIVOS (CHART.JS)
// ==========================================
function inicializarGraficosSalud() {
  // Gráfico de Barras: Enfermedades Frecuentes
  const ctxBar = document.getElementById("chartEnfermedades");
  if (ctxBar) {
    new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: ["IRA (Infecc. Resp.)", "Hipertensión", "Diabetes T2", "Gastritis", "Dengue"],
        datasets: [{
          label: "Número de Casos",
          data: [98, 75, 60, 33, 24],
          backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Gráfico Circular: Grupos Etarios
  const ctxPie = document.getElementById("chartEdad");
  if (ctxPie) {
    new Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: ["Pediatría (0-14)", "Jóvenes (15-29)", "Adultos (30-59)", "Adulto Mayor (60+)"],
        datasets: [{
          data: [25, 20, 35, 20],
          backgroundColor: ["#36b9cc", "#1cc88a", "#4e73df", "#f6c23e"]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }
}
// Función para alternar entre las secciones del panel de administración
function mostrarSeccion(idSeccion, idNav) {
  // 1. Ocultar todas las secciones de contenido
  const secciones = document.querySelectorAll('.content-section');
  secciones.forEach(seccion => {
    seccion.style.display = 'none';
  });

  // 2. Mostrar únicamente la sección seleccionada
  const seccionActiva = document.getElementById('sec-' + idSeccion);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';
  }

  // 3. Remover la clase 'active' de todos los elementos del menú lateral
  const navItems = document.querySelectorAll('.sidebar .nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
  });

  // 4. Agregar la clase 'active' al menú correspondiente
  const navActivo = document.getElementById(idNav);
  if (navActivo) {
    navActivo.classList.add('active');
  }
}