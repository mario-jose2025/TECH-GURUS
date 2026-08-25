// ==========================================
// 1. CONTROLADORES GLOBAL DE GRÁFICOS
// ==========================================
let miGraficoConsultas = null;
let miGraficoEnfermedades = null;

function inicializarGraficos() {
  const elCanvasConsultas = document.getElementById('graficoConsultas');
  const elCanvasEnfermedades = document.getElementById('graficoEnfermedades');

  // Gráfico de Líneas (Consultas)
  if (elCanvasConsultas && !miGraficoConsultas) {
    const ctxLine = elCanvasConsultas.getContext('2d');
    miGraficoConsultas = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Consultas Médicas',
          data: [65, 80, 95, 110, 105, 128],
          borderColor: '#4e73df',
          backgroundColor: 'rgba(78, 115, 223, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // Gráfico de Pastel (Distribución)
  if (elCanvasEnfermedades && !miGraficoEnfermedades) {
    const ctxPie = elCanvasEnfermedades.getContext('2d');
    miGraficoEnfermedades = new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels: ['Hipertensión', 'Diabetes', 'Gripe/IRA', 'Otros'],
        datasets: [{
          data: [40, 25, 20, 15],
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

// ==========================================
// 2. NAVEGACIÓN (ASIGNADA A WINDOW)
// ==========================================
window.mostrarSeccion = function (idSeccion, idNav) {
  // Ocultar todas las secciones
  const secciones = document.querySelectorAll('.content-section');
  secciones.forEach(sec => {
    sec.style.display = 'none';
  });

  // Mostrar la sección activa
  const seccionActiva = document.getElementById('sec-' + idSeccion);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';

    // Redibujar gráficos si se entra a estadísticas
    if (idSeccion === 'estadisticas') {
      setTimeout(() => {
        inicializarGraficos();
        if (miGraficoConsultas) miGraficoConsultas.resize();
        if (miGraficoEnfermedades) miGraficoEnfermedades.resize();
      }, 100);
    }
  }

  // Actualizar ítem activo en el menú
  const navItems = document.querySelectorAll('#accordionSidebar .nav-item, .sidebar .nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
  });

  const navActivo = document.getElementById(idNav);
  if (navActivo) {
    navActivo.classList.add('active');
  }
};

// ==========================================
// 3. INICIALIZACIÓN DEL DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Cargar vista por defecto
  window.mostrarSeccion('resumen', 'nav-resumen');
  inicializarGraficos();
});

// ==========================================
// 4. ACTUALIZAR INPUT FILE BOOTSTRAP
// ==========================================
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "lab-archivo") {
    const fileName = e.target.files[0]?.name || "Examinar y adjuntar resultado...";
    const label = document.getElementById("lab-archivo-label");
    if (label) label.textContent = fileName;
  }
});

// ==========================================
// 5. EVENTOS DE FORMULARIOS
// ==========================================
const formPaciente = document.getElementById("form-registrar-paciente");
if (formPaciente) {
  formPaciente.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Paciente registrado exitosamente!");
    formPaciente.reset();
  });
}

const formExpediente = document.getElementById("form-crear-expediente");
if (formExpediente) {
  formExpediente.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Expediente clínico generado exitosamente!");
    formExpediente.reset();
  });
}

const formConsulta = document.getElementById("form-registrar-consulta");
if (formConsulta) {
  formConsulta.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Consulta médica guardada exitosamente!");
    formConsulta.reset();
  });
}

const formLaboratorio = document.getElementById("form-subir-laboratorio");
if (formLaboratorio) {
  formLaboratorio.addEventListener("submit", (e) => {
    e.preventDefault();

    const archivoInput = document.getElementById("lab-archivo");
    const datosLaboratorio = {
      paciente: document.getElementById("lab-paciente")?.value,
      tipoExamen: document.getElementById("lab-tipo")?.value,
      fecha: document.getElementById("lab-fecha")?.value,
      estado: document.getElementById("lab-estado")?.value,
      observaciones: document.getElementById("lab-observaciones")?.value,
      nombreArchivo: archivoInput?.files[0]?.name || "Ningún archivo seleccionado"
    };

    if (!datosLaboratorio.paciente || !datosLaboratorio.tipoExamen || !archivoInput?.files.length) {
      alert("Por favor completa todos los campos obligatorios (*) y adjunta un archivo.");
      return;
    }

    alert("¡Resultado de laboratorio subido exitosamente!");
    formLaboratorio.reset();
    const label = document.getElementById("lab-archivo-label");
    if (label) label.textContent = "Examinar y adjuntar resultado...";
  });
}

const formAgenda = document.getElementById("form-programar-cita");
if (formAgenda) {
  formAgenda.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevaCita = {
      paciente: document.getElementById("age-paciente")?.value,
      medico: document.getElementById("age-medico")?.value,
      fecha: document.getElementById("age-fecha")?.value,
      hora: document.getElementById("age-hora")?.value
    };

    if (!nuevaCita.paciente || !nuevaCita.medico || !nuevaCita.fecha || !nuevaCita.hora) {
      alert("Por favor completa los campos obligatorios (*) de la cita.");
      return;
    }

    alert(`¡Cita programada con éxito para el ${nuevaCita.fecha} a las ${nuevaCita.hora}!`);
    formAgenda.reset();
  });
}