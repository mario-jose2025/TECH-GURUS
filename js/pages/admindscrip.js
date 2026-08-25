// ==========================================
// 1. VARIABLES GLOBALES DE INSTANCIA
// ==========================================
let miGraficoConsultas = null;
let miGraficoEnfermedades = null;

// ==========================================
// 2. FUNCIÓN DE RENDERIZADO DE GRÁFICOS
// ==========================================
function inicializarGraficos() {
  const elCanvasConsultas = document.getElementById('graficoConsultas');
  const elCanvasEnfermedades = document.getElementById('graficoEnfermedades');

  // Destruir instancias previas para evitar conflictos de renderizado
  if (miGraficoConsultas) {
    miGraficoConsultas.destroy();
    miGraficoConsultas = null;
  }
  if (miGraficoEnfermedades) {
    miGraficoEnfermedades.destroy();
    miGraficoEnfermedades = null;
  }

  // Gráfico de Líneas (Consultas Médicas)
  if (elCanvasConsultas) {
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

  // Gráfico de Pastel (Distribución por Enfermedades)
  if (elCanvasEnfermedades) {
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
// 3. NAVEGACIÓN Y CAMBIO DE SECCIONES
// ==========================================
window.mostrarSeccion = function (idSeccion, idNav) {
  // 1. Ocultar todas las secciones
  const secciones = document.querySelectorAll('.content-section');
  secciones.forEach(sec => {
    sec.style.display = 'none';
  });

  // 2. Mostrar la sección seleccionada
  const seccionActiva = document.getElementById('sec-' + idSeccion);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';

    // Si entramos a la sección de estadísticas, esperamos un instante a que el DOM aplique 'display: block' y dibujamos los gráficos con dimensiones reales
    if (idSeccion === 'estadisticas') {
      setTimeout(() => {
        inicializarGraficos();
      }, 50);
    }
  }

  // 3. Actualizar la clase 'active' en el menú lateral
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
// 4. INICIALIZACIÓN DEL DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Cargar Vista General por defecto al abrir la página
  window.mostrarSeccion('resumen', 'nav-resumen');
});

// ==========================================
// 5. EVENTOS DE FORMULARIOS Y COMPONENTES
// ==========================================
document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "lab-archivo") {
    const fileName = e.target.files[0]?.name || "Examinar y adjuntar resultado...";
    const label = document.getElementById("lab-archivo-label");
    if (label) label.textContent = fileName;
  }
});

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
