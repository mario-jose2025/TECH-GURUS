// ==========================================
// PORTAL DEL PACIENTE - LÓGICA E INTERACTIVIDAD
// ==========================================

// Datos simulados del paciente logueado — cuando exista backend, esto
// vendrá de la sesión/API real. Vive aquí arriba (no dentro de un solo
// listener) porque tanto "Mi Perfil" como "Agendar Cita" lo necesitan.
const datosPacienteDemo = {
  nombres: "Paciente",
  apellidos: "Demo",
  correo: "paciente.demo@correo.com",
  telefono: "8888-8888",
  usuario: "paciente.demo",
  fechaRegistro: "15/01/2026",
};

// 1. Navegación entre Secciones del Paciente
window.mostrarSeccionPaciente = function (idSeccion, idNav, event) {
  // Evitar que el navegador salte al inicio de la página (href="#")
  if (event) event.preventDefault();

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

// 2. Cargar Médicos según la Especialidad (dinámico desde el panel de admin)
// -----------------------------------------------------------------------
// Cuando el admin registra médicos en admind.html, los guarda en
// localStorage bajo la clave "vitalis_medicos" (ver admindscrip.js).
// Aquí los leemos para poblar el selector. Si todavía no hay ningún
// médico registrado (localStorage vacío), usamos esta lista de respaldo
// para que el formulario nunca se quede sin opciones durante la demo.
const MEDICOS_STORAGE_KEY = "vitalis_medicos";

const medicosPorEspecialidad = {
  "medicina-general": ["Dr. Roberto Gómez", "Dra. María Lopez"],
  "pediatria": ["Dr. Carlos Ruiz"],
  "ginecologia": ["Dra. Sofia Gutierrez"],
  "odontologia": ["Dr. Mario Duarte"]
};

function obtenerMedicosPorEspecialidad(especialidad) {
  const raw = localStorage.getItem(MEDICOS_STORAGE_KEY);

  if (raw) {
    try {
      const medicos = JSON.parse(raw);
      return medicos
        .filter((m) => m.especialidad === especialidad && m.estado === "Activo")
        .map((m) => `${m.tratamiento} ${m.nombres} ${m.apellidos}`);
    } catch (e) {
      console.warn("No se pudo leer la lista de médicos del admin, usando lista de respaldo.", e);
    }
  }

  return medicosPorEspecialidad[especialidad] || [];
}

document.addEventListener("DOMContentLoaded", () => {
  const selectEsp = document.getElementById("select-especialidad");
  const selectMed = document.getElementById("select-medico");

  if (selectEsp && selectMed) {
    selectEsp.addEventListener("change", (e) => {
      const espSeleccionada = e.target.value;
      
      // Limpiar y resetear el select de médicos
      selectMed.innerHTML = '<option value="">-- Seleccione médico disponible --</option>';

      const medicosDisponibles = obtenerMedicosPorEspecialidad(espSeleccionada);

      if (espSeleccionada && medicosDisponibles.length > 0) {
        // Habilitar el select de médico
        selectMed.disabled = false;
        
        medicosDisponibles.forEach(medico => {
          const option = document.createElement("option");
          option.value = medico;
          option.textContent = medico;
          selectMed.appendChild(option);
        });
      } else {
        selectMed.disabled = true;
        selectMed.innerHTML = espSeleccionada
          ? '<option value="">-- No hay médicos activos en esta especialidad --</option>'
          : '<option value="">-- Seleccione especialidad primero --</option>';
      }
    });
  }
});

// ==========================================
// CITAS DEL PACIENTE (localStorage)
// ==========================================
// Mismo patrón que médicos (admindscrip.js) y recordatorios: mientras
// no exista backend, se guarda en localStorage. Cuando conectes la API,
// obtenerCitas()/guardarCitas() se reemplazan por fetch().
const CITAS_STORAGE_KEY = "vitalis_citas_paciente";
// Se declara aquí arriba (no más abajo, junto a sus funciones) porque
// renderResultadosLaboratorio() se llama al final del archivo, y una
// variable "const" no puede usarse antes de la línea donde se declara.
const LABORATORIOS_STORAGE_KEY = "vitalis_laboratorios";

const ESPECIALIDAD_LABELS = {
  "medicina-general": "Medicina General",
  "pediatria": "Pediatría",
  "ginecologia": "Ginecología",
  "odontologia": "Odontología",
};

const CENTRO_LABELS = {
  "sede-central": "Sede Central (Managua)",
  "sede-norte": "Clínica Norte",
};

function obtenerCitas() {
  const raw = localStorage.getItem(CITAS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer las citas guardadas, usando datos de ejemplo.", e);
    }
  }

  // Datos de ejemplo — solo se usan la primera vez, antes de que exista
  // información real en localStorage.
  const semilla = [
    {
      id: 1,
      nombrePaciente: "Paciente Demo",
      fecha: "2026-01-15",
      hora: "10:00",
      medico: "Dr. Roberto Gómez",
      especialidad: "Medicina General",
      centro: "Sede Central (Managua)",
      consultorio: 4,
      estado: "Atendida",
    },
    {
      id: 2,
      nombrePaciente: "Paciente Demo",
      fecha: "2026-08-28",
      hora: "09:30",
      medico: "Dra. Sofia Gutierrez",
      especialidad: "Ginecología",
      centro: "Clínica Norte",
      consultorio: 2,
      estado: "Confirmada",
    },
  ];
  guardarCitas(semilla);
  return semilla;
}

function guardarCitas(lista) {
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(lista));
}

// Convierte "2026-08-28" en "28/08/2026" para que se vea igual al resto de la tabla
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

function badgeEstadoCita(estado) {
  if (estado === "Atendida") {
    return '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i> Atendida</span>';
  }
  if (estado === "Cancelada") {
    return '<span class="badge badge-danger px-2 py-1"><i class="fas fa-times-circle mr-1"></i> Cancelada</span>';
  }
  if (estado === "Pendiente") {
    return '<span class="badge badge-warning text-dark px-2 py-1"><i class="fas fa-hourglass-half mr-1"></i> Pendiente de confirmación</span>';
  }
  return '<span class="badge badge-primary px-2 py-1"><i class="fas fa-clock mr-1"></i> Confirmada</span>';
}

function accionesCita(cita) {
  if (cita.estado === "Atendida") {
    return `
      <button class="btn btn-sm btn-outline-primary" title="Ver detalles o receta" onclick="verDetalleConsulta('Cita ${cita.medico} - ${formatearFecha(cita.fecha)}')">
        <i class="fas fa-eye"></i> Detalles
      </button>`;
  }
  if (cita.estado === "Pendiente" || cita.estado === "Confirmada") {
    return `
      <button class="btn btn-sm btn-outline-danger" title="Cancelar cita" onclick="cancelarCitaPendiente(${cita.id})">
        <i class="fas fa-times"></i> Cancelar
      </button>`;
  }
  // Cancelada
  return `
    <button class="btn btn-sm btn-outline-secondary" title="Agendar de nuevo" onclick="mostrarSeccionPaciente('agendar', 'nav-pac-agendar')">
      <i class="fas fa-redo"></i> Reagendar
    </button>`;
}

function renderCitasTabla(filtro) {
  const tbody = document.getElementById("tabla-citas-body");
  if (!tbody) return; // esta página no tiene la tabla de citas

  filtro = filtro || (document.getElementById("filtro-estado-citas") || {}).value || "todos";

  const citas = obtenerCitas().filter((c) => {
    if (filtro === "atendido") return c.estado === "Atendida";
    if (filtro === "pendiente") return c.estado === "Pendiente" || c.estado === "Confirmada";
    return true; // "todos"
  });

  if (citas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="fas fa-calendar-times fa-2x mb-2 d-block"></i>
          No hay citas que coincidan con este filtro.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = citas.map((c) => `
    <tr>
      <td class="align-middle font-weight-bold text-gray-800">${formatearFecha(c.fecha)}<br><small class="text-muted font-weight-normal">${c.hora}</small></td>
      <td class="align-middle">${c.medico}</td>
      <td class="align-middle">${c.especialidad}</td>
      <td class="align-middle">Consultorio ${c.consultorio}<br><small class="text-muted">${c.centro}</small></td>
      <td class="align-middle">${badgeEstadoCita(c.estado)}</td>
      <td class="align-middle text-center">${accionesCita(c)}</td>
    </tr>
  `).join("");
}

function renderAlertasCitas() {
  const contenedor = document.getElementById("alertas-citas-container");
  if (!contenedor) return; // esta página no tiene la sección de recordatorios

  const proximas = obtenerCitas().filter((c) => c.estado === "Pendiente" || c.estado === "Confirmada");

  if (proximas.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="text-center text-muted py-4">
          <i class="fas fa-calendar-check fa-2x mb-2"></i>
          <p class="mb-0">No tienes citas próximas programadas.</p>
        </div>
      </div>`;
    return;
  }

  contenedor.innerHTML = proximas.map((c) => {
    const esPendiente = c.estado === "Pendiente";
    const colorBorde = esPendiente ? "warning" : "primary";
    const etiqueta = esPendiente ? "Esperando Confirmación" : "Cita Confirmada";

    return `
    <div class="col-xl-6 col-md-6 mb-4">
      <div class="card border-left-${colorBorde} shadow h-100 py-2">
        <div class="card-body">
          <div class="row no-gutters align-items-center">
            <div class="col mr-2">
              <div class="text-xs font-weight-bold text-${colorBorde} text-uppercase mb-1">${etiqueta}</div>
              <div class="h5 mb-0 font-weight-bold text-gray-800">${c.especialidad} - ${c.medico}</div>
              <p class="text-muted small mt-2 mb-1"><i class="fas fa-calendar-alt mr-1"></i> ${formatearFecha(c.fecha)} a las ${c.hora}</p>
              <span class="badge badge-${colorBorde} ${esPendiente ? 'text-dark' : ''}">Consultorio ${c.consultorio} - ${c.centro}</span>
            </div>
            <div class="col-auto">
              <i class="fas fa-user-md fa-2x text-gray-300"></i>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join("");
}

window.cancelarCitaPendiente = function (id) {
  const confirmado = confirm("¿Seguro que quieres cancelar esta cita? Esta acción no se puede deshacer.");
  if (!confirmado) return;

  const citas = obtenerCitas();
  const cita = citas.find((c) => c.id === id);
  if (!cita) return;

  cita.estado = "Cancelada";
  guardarCitas(citas);
  renderCitasTabla();
  renderAlertasCitas();
};

// Filtro de la tabla (Todos / Atendidos / Próximos-Pendientes)
const filtroEstadoCitas = document.getElementById("filtro-estado-citas");
if (filtroEstadoCitas) {
  filtroEstadoCitas.addEventListener("change", (e) => {
    renderCitasTabla(e.target.value);
  });
}

// 3. Procesar Agendamiento de Cita en Línea
const formAgendar = document.getElementById("form-agendar-cita-linea");
if (formAgendar) {
  formAgendar.addEventListener("submit", (e) => {
    e.preventDefault();

    // Captura de valores adaptada a los campos del formulario
    const centroValue = document.getElementById("select-centro").value;
    const especialidadValue = document.getElementById("select-especialidad").value;
    const medico = document.getElementById("select-medico").value;
    const fecha = document.getElementById("input-fecha-cita").value;
    const hora = document.getElementById("select-horario").value;
    const telefono = document.getElementById("input-telefono").value;
    const tipoAtencion = document.getElementById("select-tipo-atencion").value;
    const motivo = document.getElementById("textarea-motivo").value;

    // Validación rápida de seguridad en cliente
    if (!centroValue || !especialidadValue || !medico || !fecha || !hora || !telefono || !motivo) {
      alert("Por favor, complete todos los campos obligatorios para agendar su cita.");
      return;
    }

    const centro = CENTRO_LABELS[centroValue] || centroValue;
    const especialidad = ESPECIALIDAD_LABELS[especialidadValue] || especialidadValue;

    // Simulación de consultorio asignado aleatorio
    const consultorioAsignado = Math.floor(Math.random() * 5) + 1;

    // Guardar la cita de verdad en localStorage — arranca "Pendiente"
    // hasta que el personal de salud la confirme desde el panel de admin.
    const citas = obtenerCitas();
    const nuevoId = citas.length > 0 ? Math.max(...citas.map((c) => c.id)) + 1 : 1;
    citas.push({
      id: nuevoId,
      nombrePaciente: `${datosPacienteDemo.nombres} ${datosPacienteDemo.apellidos}`,
      fecha,
      hora,
      medico,
      especialidad,
      centro,
      consultorio: consultorioAsignado,
      estado: "Pendiente",
      tipoAtencion,
      motivo,
      telefono,
    });
    guardarCitas(citas);

    alert(`¡Solicitud de Cita Enviada!\n\nSede: ${centro}\nEspecialidad: ${especialidad}\nMédico: ${medico}\nFecha y Hora: ${formatearFecha(fecha)} (${hora})\nConsultorio: #${consultorioAsignado}\nTeléfono de Alerta: ${telefono}\n\nTu cita quedará "Pendiente de confirmación" hasta que el centro de salud la confirme.`);

    // Aquí en el futuro harás el fetch() POST al backend en vez de guardarCitas()
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

    // Refrescar la tabla y las alertas, y llevar al paciente a ver su cita recién creada
    renderCitasTabla();
    renderAlertasCitas();
    mostrarSeccionPaciente('citas', 'nav-pac-citas');
  });
}

// Dibujar la tabla y las alertas apenas carga el panel (las secciones
// pueden estar ocultas, pero ya quedan listas en el DOM)
renderCitasTabla();
renderAlertasCitas();
renderResultadosLaboratorio();

// Si el admin (en otra pestaña del mismo navegador) confirma, atiende o
// cancela una cita, o sube un nuevo resultado de laboratorio,
// refrescamos automáticamente sin que el paciente recargue la página.
window.addEventListener("storage", (e) => {
  if (e.key === CITAS_STORAGE_KEY) {
    renderCitasTabla();
    renderAlertasCitas();
  }
  if (e.key === LABORATORIOS_STORAGE_KEY) {
    renderResultadosLaboratorio();
  }
});

// ==========================================
// RESULTADOS DE LABORATORIO (localStorage)
// ==========================================
// Misma clave que usa admindscrip.js ("vitalis_laboratorios") — cuando
// el admin sube un resultado, aparece aquí automáticamente.
// (La clave en sí, LABORATORIOS_STORAGE_KEY, ya quedó declarada arriba
// del archivo junto a CITAS_STORAGE_KEY.)

function obtenerResultadosLaboratorio() {
  const raw = localStorage.getItem(LABORATORIOS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer los resultados guardados, usando datos de ejemplo.", e);
    }
  }

  // Datos de ejemplo — solo se usan la primera vez, antes de que el
  // admin haya subido algún resultado real.
  const semilla = [
    {
      id: 1,
      examen: "Hemograma Completo",
      detalle: "Biometría hemática y plaquetas",
      sede: "Sede Central (Managua)",
      fecha: "2026-08-20",
      medico: "Dr. Roberto Gómez",
      estado: "Disponible",
    },
    {
      id: 2,
      examen: "Perfil Lipídico",
      detalle: "Colesterol y Triglicéridos",
      sede: "Clínica Norte",
      fecha: "2026-06-10",
      medico: "Dra. Sofia Gutierrez",
      estado: "Disponible",
    },
    {
      id: 3,
      examen: "Urocultivo General",
      detalle: "Bacteriología",
      sede: "Sede Central (Managua)",
      fecha: "2026-08-25",
      medico: "Dr. Roberto Gómez",
      estado: "En Proceso",
    },
  ];
  guardarResultadosLaboratorio(semilla);
  return semilla;
}

function guardarResultadosLaboratorio(lista) {
  localStorage.setItem(LABORATORIOS_STORAGE_KEY, JSON.stringify(lista));
}

function renderResultadosLaboratorio(filtroTexto) {
  const tbody = document.getElementById("tabla-laboratorio-body");
  if (!tbody) return; // esta página no tiene la tabla de laboratorio

  filtroTexto = (filtroTexto || "").trim().toLowerCase();

  let resultados = obtenerResultadosLaboratorio();
  if (filtroTexto) {
    resultados = resultados.filter((r) => r.examen.toLowerCase().includes(filtroTexto));
  }

  if (resultados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="fas fa-flask fa-2x mb-2 d-block"></i>
          ${filtroTexto ? "No se encontró ningún examen con ese nombre." : "Todavía no tienes resultados de laboratorio disponibles."}
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = resultados.map((r) => {
    const disponible = r.estado === "Disponible";
    const badge = disponible
      ? '<span class="badge badge-success px-2 py-1"><i class="fas fa-check-circle mr-1"></i> Disponible</span>'
      : '<span class="badge badge-warning px-2 py-1"><i class="fas fa-clock mr-1"></i> En Proceso</span>';
    const boton = disponible
      ? `<button class="btn btn-sm btn-primary shadow-sm" onclick="descargarResultado(${r.id})">
           <i class="fas fa-file-pdf mr-1"></i> Descargar PDF
         </button>`
      : `<button class="btn btn-sm btn-secondary shadow-sm" disabled title="El resultado aún no está listo">
           <i class="fas fa-spinner mr-1"></i> No disponible
         </button>`;

    return `
      <tr>
        <td class="align-middle font-weight-bold text-gray-800">
          ${r.examen} <br>
          <small class="text-muted font-weight-normal">${r.detalle || ""}</small>
        </td>
        <td class="align-middle">${r.sede}</td>
        <td class="align-middle">${formatearFecha(r.fecha)}</td>
        <td class="align-middle">${r.medico}</td>
        <td class="align-middle">${badge}</td>
        <td class="align-middle text-center">${boton}</td>
      </tr>`;
  }).join("");
}

// Buscador de exámenes — se conecta en vivo mientras el paciente escribe
const inputBuscarExamen = document.getElementById("input-buscar-examen");
if (inputBuscarExamen) {
  inputBuscarExamen.addEventListener("input", (e) => {
    renderResultadosLaboratorio(e.target.value);
  });
}

// 4. Descarga de Exámenes
window.descargarResultado = function (id) {
  const resultado = obtenerResultadosLaboratorio().find((r) => r.id === id);
  const nombreExamen = resultado ? resultado.examen : "el examen solicitado";
  alert(`Descargando el archivo PDF del examen: ${nombreExamen}...`);
  // Aquí en el futuro irá la URL real de descarga provista por el backend
};

// 6. Perfil del Paciente: precargar datos simulados y manejar los formularios
document.addEventListener("DOMContentLoaded", () => {
  const inputNombres = document.getElementById("perfil-nombres");
  if (inputNombres) {
    document.getElementById("perfil-nombres").value = datosPacienteDemo.nombres;
    document.getElementById("perfil-apellidos").value = datosPacienteDemo.apellidos;
    document.getElementById("perfil-correo").value = datosPacienteDemo.correo;
    document.getElementById("perfil-telefono").value = datosPacienteDemo.telefono;
    document.getElementById("perfil-usuario").value = datosPacienteDemo.usuario;

    document.getElementById("perfil-nombre-completo").textContent =
      `${datosPacienteDemo.nombres} ${datosPacienteDemo.apellidos}`;
    document.getElementById("perfil-usuario-actual").textContent = `@${datosPacienteDemo.usuario}`;
    document.getElementById("perfil-fecha-registro").textContent = datosPacienteDemo.fechaRegistro;

    const iniciales =
      datosPacienteDemo.nombres.charAt(0).toUpperCase() +
      datosPacienteDemo.apellidos.charAt(0).toUpperCase();
    document.getElementById("perfil-avatar-iniciales").textContent = iniciales;
  }
});

// ---------- Foto de perfil: subir con vista previa y quitar ----------
const perfilFotoInput = document.getElementById("perfil-foto-input");
const perfilAvatarImg = document.getElementById("perfil-avatar-img");
const perfilAvatarIniciales = document.getElementById("perfil-avatar-iniciales");
const perfilQuitarFotoBtn = document.getElementById("perfil-quitar-foto");
const topbarPacienteAvatar = document.getElementById("topbar-paciente-avatar");

function mostrarFotoPerfilPaciente(dataUrl) {
  // Vista previa grande en la tarjeta de perfil
  if (perfilAvatarImg) {
    perfilAvatarImg.src = dataUrl;
    perfilAvatarImg.style.display = "block";
  }
  if (perfilAvatarIniciales) perfilAvatarIniciales.style.display = "none";

  // Reflejar también en el avatar chiquito del topbar
  if (topbarPacienteAvatar) {
    topbarPacienteAvatar.innerHTML = `<img src="${dataUrl}" alt="" style="width:100%; height:100%; object-fit:cover;">`;
  }
}

function quitarFotoPerfilPaciente() {
  if (perfilAvatarImg) {
    perfilAvatarImg.src = "";
    perfilAvatarImg.style.display = "none";
  }
  if (perfilAvatarIniciales) perfilAvatarIniciales.style.display = "inline";
  if (perfilFotoInput) perfilFotoInput.value = "";

  if (topbarPacienteAvatar) {
    topbarPacienteAvatar.innerHTML = '<i class="fas fa-user-circle fa-2x text-gray-400"></i>';
  }
}

if (perfilFotoInput) {
  perfilFotoInput.addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Validación básica: tipo y tamaño (máx. 3MB para no saturar la vista previa)
    if (!archivo.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen (JPG o PNG).");
      return;
    }
    if (archivo.size > 3 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Elige una de menos de 3MB.");
      return;
    }

    const lector = new FileReader();
    lector.onload = (event) => {
      mostrarFotoPerfilPaciente(event.target.result);
    };
    lector.readAsDataURL(archivo);

    // Aquí en el futuro: subir 'archivo' al backend (FormData + fetch POST)
    // en vez de solo mostrarlo localmente con FileReader.
  });
}

if (perfilQuitarFotoBtn) {
  perfilQuitarFotoBtn.addEventListener("click", quitarFotoPerfilPaciente);
}

// 7. Guardar cambios de datos personales
const formEditarPerfil = document.getElementById("form-editar-perfil");
if (formEditarPerfil) {
  formEditarPerfil.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!formEditarPerfil.checkValidity()) {
      formEditarPerfil.reportValidity();
      return;
    }

    // Actualizar la vista previa (nombre, usuario, iniciales) con los nuevos datos
    const nombres = document.getElementById("perfil-nombres").value.trim();
    const apellidos = document.getElementById("perfil-apellidos").value.trim();
    const usuario = document.getElementById("perfil-usuario").value.trim();

    document.getElementById("perfil-nombre-completo").textContent = `${nombres} ${apellidos}`;
    document.getElementById("perfil-usuario-actual").textContent = `@${usuario}`;
    document.getElementById("perfil-avatar-iniciales").textContent =
      (nombres.charAt(0) + apellidos.charAt(0)).toUpperCase();

    alert("¡Tus datos se actualizaron exitosamente!");

    // Regresar al dashboard general, como corresponde tras guardar
    // (nota: no usamos reset() aquí para que los campos conserven los
    // valores recién guardados si el usuario vuelve a abrir Mi Perfil)
    mostrarSeccionPaciente('inicio', 'nav-pac-inicio');

    // Aquí en el futuro: fetch PUT/PATCH al backend para guardar los cambios reales
    /*
    fetch('/api/pacientes/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombres, apellidos, correo, telefono, usuario })
    });
    */
  });
}

// 8. Cambiar contraseña
const formCambiarPassword = document.getElementById("form-cambiar-password");
if (formCambiarPassword) {
  formCambiarPassword.addEventListener("submit", (e) => {
    e.preventDefault();

    const actual = document.getElementById("perfil-password-actual").value;
    const nueva = document.getElementById("perfil-password-nueva").value;
    const confirmar = document.getElementById("perfil-password-confirmar").value;

    if (!actual || !nueva || !confirmar) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    if (nueva.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nueva !== confirmar) {
      alert("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    alert("¡Contraseña actualizada exitosamente!");
    formCambiarPassword.reset();

    // Aquí en el futuro: fetch POST al backend para validar la contraseña actual
    // y guardar el nuevo hash de forma segura.
  });
}

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

// ==========================================
// RECORDATORIOS DE MEDICAMENTOS (localStorage)
// ==========================================
// Cuando exista backend, obtenerRecordatorios()/guardarRecordatorios()
// se reemplazan por llamadas fetch() a tu API, igual que se hizo con
// los médicos en admindscrip.js.
const RECORDATORIOS_STORAGE_KEY = "vitalis_recordatorios";

function obtenerRecordatorios() {
  const raw = localStorage.getItem(RECORDATORIOS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer los recordatorios guardados, usando datos de ejemplo.", e);
    }
  }

  // Datos de ejemplo — solo se usan la primera vez, antes de que exista
  // información real en localStorage (o cuando venga del backend).
  const semilla = [
    {
      id: 1,
      medicamento: "Losartán 50mg",
      horaProxima: "Hoy a las 8:00 PM",
      frecuencia: "Cada 12 horas",
      colorBorde: "danger",
      icono: "fa-prescription-bottle-alt",
      tomadoHoy: false,
    },
    {
      id: 2,
      medicamento: "Paracetamol 500mg",
      horaProxima: "Mañana a las 8:00 AM",
      frecuencia: "Cada 8 horas (Condicional)",
      colorBorde: "warning",
      icono: "fa-pills",
      tomadoHoy: false,
    },
  ];
  guardarRecordatorios(semilla);
  return semilla;
}

function guardarRecordatorios(lista) {
  localStorage.setItem(RECORDATORIOS_STORAGE_KEY, JSON.stringify(lista));
}

function renderRecordatorios() {
  const contenedor = document.getElementById("recordatorios-medicamentos-container");
  if (!contenedor) return; // esta página no tiene la sección de recordatorios

  const recordatorios = obtenerRecordatorios();

  if (recordatorios.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="text-center text-muted py-4">
          <i class="fas fa-pills fa-2x mb-2"></i>
          <p class="mb-0">No tienes tratamientos activos por el momento.</p>
        </div>
      </div>`;
    return;
  }

  contenedor.innerHTML = recordatorios.map((r) => {
    if (r.tomadoHoy) {
      // Tarjeta en estado "ya tomado"
      return `
        <div class="col-xl-6 col-md-6 mb-4">
          <div class="card border-left-success shadow py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">Toma Registrada</div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">${r.medicamento}</div>
                  <p class="text-muted small mt-2 mb-1"><i class="fas fa-check-circle mr-1 text-success"></i> Marcado como tomado hoy</p>
                  <span class="badge badge-success">Frecuencia: ${r.frecuencia}</span>
                </div>
                <div class="col-auto">
                  <i class="fas fa-check-circle fa-2x text-success"></i>
                </div>
              </div>
              <hr class="my-2">
              <div class="text-right">
                <button class="btn btn-sm btn-link text-muted" onclick="deshacerTomado(${r.id})">
                  <i class="fas fa-undo mr-1"></i> Deshacer
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }

    // Tarjeta en estado pendiente
    return `
      <div class="col-xl-6 col-md-6 mb-4">
        <div class="card border-left-${r.colorBorde} shadow py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-${r.colorBorde} text-uppercase mb-1">Próxima Toma</div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">${r.medicamento}</div>
                <p class="text-muted small mt-2 mb-1"><i class="fas fa-clock mr-1"></i> ${r.horaProxima}</p>
                <span class="badge badge-${r.colorBorde} ${r.colorBorde === 'warning' ? 'text-dark' : ''}">Frecuencia: ${r.frecuencia}</span>
              </div>
              <div class="col-auto">
                <i class="fas ${r.icono} fa-2x text-gray-300"></i>
              </div>
            </div>
            <hr class="my-2">
            <div class="text-right">
              <button class="btn btn-sm btn-outline-success" onclick="marcarTomado(${r.id})">
                <i class="fas fa-check mr-1"></i> Marcar como Tomado
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}

window.marcarTomado = function (id) {
  const recordatorios = obtenerRecordatorios();
  const recordatorio = recordatorios.find((r) => r.id === id);
  if (!recordatorio) return;

  recordatorio.tomadoHoy = true;
  guardarRecordatorios(recordatorios);
  renderRecordatorios();

  // Aquí en el futuro enviarás un registro al backend mediante fetch POST
  // para llevar control clínico real de cumplimiento del tratamiento.
};

window.deshacerTomado = function (id) {
  const recordatorios = obtenerRecordatorios();
  const recordatorio = recordatorios.find((r) => r.id === id);
  if (!recordatorio) return;

  recordatorio.tomadoHoy = false;
  guardarRecordatorios(recordatorios);
  renderRecordatorios();
};

// Dibujar las tarjetas apenas carga el panel (la sección puede estar
// oculta, pero ya queda lista en el DOM para cuando el paciente la abra)
renderRecordatorios();
