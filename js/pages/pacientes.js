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

  // Cambiar clase active en el menú lateral
  const navItems = document.querySelectorAll('#accordionSidebar .nav-item');
  navItems.forEach(item => {
    item.classList.remove('active');
  });

  const navActivo = document.getElementById(idNav);
  if (navActivo) {
    navActivo.classList.add('active');
  }
};

// 2. Cargar Médicos según la Especialidad y Sede (Simulación/Filtro dinámico)
const medicosPorEspecialidad = {
  "medicina-general": ["Dr. Roberto Gómez", "Dra. María Lopez"],
  "pediatria": ["Dr. Carlos Ruiz"],
  "ginecologia": ["Dra. Sofia Gutierrez"],
  "odontologia": ["Dr. Mario Duarte"]
};

document.addEventListener("DOMContentLoaded", () => {
  const selectEsp = document.getElementById("select-especialidad");
  const selectMed = document.getElementById("select-medico");

  if (selectEsp && selectMed) {
    selectEsp.addEventListener("change", (e) => {
      const espSeleccionada = e.target.value;
      
      // Limpiar y resetear el select de médicos
      selectMed.innerHTML = '<option value="">-- Seleccione médico disponible --</option>';

      if (espSeleccionada && medicosPorEspecialidad[espSeleccionada]) {
        // Habilitar el select de médico
        selectMed.disabled = false;
        
        medicosPorEspecialidad[espSeleccionada].forEach(medico => {
          const option = document.createElement("option");
          option.value = medico;
          option.textContent = medico;
          selectMed.appendChild(option);
        });
      } else {
        selectMed.disabled = true;
        selectMed.innerHTML = '<option value="">-- Seleccione especialidad primero --</option>';
      }
    });
  }
});

// 3. Procesar Agendamiento de Cita en Línea
const formAgendar = document.getElementById("form-agendar-cita-linea");
if (formAgendar) {
  formAgendar.addEventListener("submit", (e) => {
    e.preventDefault();

    // Captura de valores adaptada a los campos nuevos del formulario
    const centro = document.getElementById("select-centro").value;
    const especialidad = document.getElementById("select-especialidad").value;
    const medico = document.getElementById("select-medico").value;
    const fecha = document.getElementById("input-fecha-cita").value;
    const hora = document.getElementById("select-horario").value;
    const telefono = document.getElementById("input-telefono").value;
    const tipoAtencion = document.getElementById("select-tipo-atencion").value;
    const motivo = document.getElementById("textarea-motivo").value;

    // Validación rápida de seguridad en cliente
    if (!centro || !especialidad || !medico || !fecha || !hora || !telefono || !motivo) {
      alert("Por favor, complete todos los campos obligatorios para agendar su cita.");
      return;
    }

    // Simulación de consultorio asignado aleatorio
    const consultorioAsignado = Math.floor(Math.random() * 5) + 1;

    alert(`¡Cita en Línea Agendada con Éxito!\n\nSede: ${centro}\nEspecialidad: ${especialidad}\nMédico: ${medico}\nFecha y Hora: ${fecha} (${hora})\nConsultorio: #${consultorioAsignado}\nTeléfono de Alerta: ${telefono}`);

    // Aquí en el futuro harás el fetch() POST al backend para guardar en la base de datos
    /*
    fetch('/api/citas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centro, especialidad, medico, fecha, hora, telefono, tipoAtencion, motivo })
    })
    .then(response => response.json())
    .then(data => { ... });
    */

    formAgendar.reset();
    // Regresar al dashboard general de inicio
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
  sessionStorage.clear();
  window.location.href = "../index.html";
};

window.verDetalleConsulta = function(infoCita) {
    // Aquí más adelante harás un fetch al backend para traer los datos reales por ID de consulta
    // Por ahora, disparamos el modal de Bootstrap de forma limpia:
    $('#modalDetalleConsulta').modal('show');
};

window.descargarRecetaPDF = function() {
    alert("Generando y descargando receta médica oficial en formato PDF...");
};

window.marcarTomado = function(nombreMedicamento) {
    alert(`¡Excelente! Has registrado la toma de: ${nombreMedicamento}. El sistema ha actualizado tu bitácora de cumplimiento.`);
    // Aquí en el futuro enviarás un registro al backend mediante fetch POST para llevar control clínico
};
