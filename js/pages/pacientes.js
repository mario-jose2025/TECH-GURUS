// ==========================================
// PORTAL DEL PACIENTE - LÓGICA E INTERACTIVIDAD
// ==========================================

// 1. Navegación entre Secciones del Paciente
window.mostrarSeccionPaciente = function (idSeccion, idNav) {
  // Ocultar todas las secciones del paciente
  const secciones = document.querySelectorAll('.content-section-paciente');
  secciones.forEach(sec => {
    sec.style.display = 'none';
  });

  // Mostrar la sección seleccionada
  const seccionActiva = document.getElementById('sec-pac-' + idSeccion);
  if (seccionActiva) {
    seccionActiva.style.display = 'block';
  }

  // Cambiar clase active en el menú
  const navItems = document.querySelectorAll('#accordionSidebar .nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
  });

  const navActivo = document.getElementById(idNav);
  if (navActivo) {
    navActivo.classList.add('active');
  }
};

// 2. Cargar Médicos según la Especialidad (Simulación/Filtro dinamico)
const medicosPorEspecialidad = {
  "Medicina General": ["Dr. Roberto Gómez", "Dra. María Lopez"],
  "Pediatría": ["Dr. Carlos Ruiz"],
  "Cardiología": ["Dra. Ana Martinez"],
  "Ginecología": ["Dra. Sofia Gutierrez"]
};

document.addEventListener("DOMContentLoaded", () => {
  const selectEsp = document.getElementById("select-especialidad");
  const selectMed = document.getElementById("select-medico");

  if (selectEsp && selectMed) {
    selectEsp.addEventListener("change", (e) => {
      const espSeleccionada = e.target.value;
      selectMed.innerHTML = '<option value="">-- Seleccionar Médico --</option>';

      if (espSeleccionada && medicosPorEspecialidad[espSeleccionada]) {
        medicosPorEspecialidad[espSeleccionada].forEach(medico => {
          const option = document.createElement("option");
          option.value = medico;
          option.textContent = medico;
          selectMed.appendChild(option);
        });
      }
    });
  }
});

// 3. Procesar Agendamiento de Cita
const formAgendar = document.getElementById("form-agendar-cita-paciente");
if (formAgendar) {
  formAgendar.addEventListener("submit", (e) => {
    e.preventDefault();

    const especialidad = document.getElementById("select-especialidad").value;
    const medico = document.getElementById("select-medico").value;
    const fecha = document.getElementById("input-fecha-cita").value;
    const hora = document.getElementById("select-hora-cita").value;

    const consultorioAsignado = Math.floor(Math.random() * 5) + 1;

    alert(`¡Cita Agendada Exitosamente!\n\nEspecialidad: ${especialidad}\nMédico: ${medico}\nFecha y Hora: ${fecha} a las ${hora}\nConsultorio Asignado: #${consultorioAsignado}`);

    // Aquí irá el fetch() POST al backend para guardar en la base de datos
    formAgendar.reset();
    mostrarSeccionPaciente('inicio', 'nav-pac-inicio');
  });
}

// 4. Descarga de Exámenes
window.descargarResultado = function (nombreExamen) {
  alert(`Descargando el archivo PDF del examen: ${nombreExamen}...`);
  // Aquí irá la URL de descarga provista por el backend
};

// 5. Cerrar Sesión
window.cerrarSesion = function () {
  localStorage.clear();
  window.location.href = "../index.html";
};