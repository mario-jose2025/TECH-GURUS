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
window.mostrarSeccion = function (idSeccion, idNav, event) {
  // 0. Evitar que el navegador salte al inicio de la página (href="#")
  if (event) event.preventDefault();

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

    // Si entramos a Agenda Médica, refrescamos la tabla de citas y el
    // select de médicos por si algo cambió desde la última visita
    if (idSeccion === 'agenda') {
      poblarSelectMedicosAgenda();
      renderCitasAdmin();
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

// ==========================================
// CONSULTAS MÉDICAS (localStorage)
// ==========================================
// Cuando el paciente hace clic en "Ver Detalles" de una cita Atendida
// (pacientes.js), busca aquí el registro real con este mismo citaId.
const CONSULTAS_STORAGE_KEY = "vitalis_consultas";

function obtenerConsultas() {
  const raw = localStorage.getItem(CONSULTAS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo leer las consultas guardadas.", e);
    return [];
  }
}

function guardarConsultas(lista) {
  localStorage.setItem(CONSULTAS_STORAGE_KEY, JSON.stringify(lista));
}

const formConsulta = document.getElementById("form-registrar-consulta");
if (formConsulta) {
  formConsulta.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!formConsulta.checkValidity()) {
      formConsulta.reportValidity();
      return;
    }

    const citaId = document.getElementById("con-cita-id").value;

    const nuevaConsulta = {
      id: Date.now(),
      citaId: citaId ? Number(citaId) : null,
      paciente: document.getElementById("con-paciente").value.trim(),
      especialidad: document.getElementById("con-especialidad").value,
      fecha: document.getElementById("con-fecha").value,
      signosVitales: {
        presionArterial: document.getElementById("con-pa").value.trim(),
        frecuenciaCardiaca: document.getElementById("con-fc").value.trim(),
        temperatura: document.getElementById("con-temp").value.trim(),
        peso: document.getElementById("con-peso").value.trim(),
        talla: document.getElementById("con-talla").value.trim(),
      },
      motivo: document.getElementById("con-motivo").value.trim(),
      diagnostico: document.getElementById("con-diagnostico").value.trim(),
      tipoDiagnostico: document.getElementById("con-tipodiag").value,
      receta: document.getElementById("con-receta").value.trim(),
      indicaciones: document.getElementById("con-indicaciones").value.trim(),
      medico: `${datosAdminDemo.cargo} ${datosAdminDemo.apellidos}`,
    };

    const consultas = obtenerConsultas();
    consultas.push(nuevaConsulta);
    guardarConsultas(consultas);

    // Si esta consulta viene de una cita real, ahora sí la marcamos
    // "Atendida" — recién que hay un diagnóstico de verdad guardado.
    if (nuevaConsulta.citaId) {
      const citas = obtenerCitasAdmin();
      const cita = citas.find((c) => c.id === nuevaConsulta.citaId);
      if (cita) {
        cita.estado = "Atendida";
        guardarCitasAdmin(citas);
      }
    }

    alert("¡Consulta registrada exitosamente!");
    formConsulta.reset();
    document.getElementById("con-cita-id").value = "";

    const alertaVinculada = document.getElementById("alerta-consulta-vinculada");
    if (alertaVinculada) alertaVinculada.classList.add("d-none");

    // Volver a Agenda Médica para ver el estado actualizado de la cita
    mostrarSeccion("agenda", "nav-agenda");
  });
}

// ==========================================
// RESULTADOS DE LABORATORIO (localStorage)
// ==========================================
// Misma clave que pacientes.js ("vitalis_laboratorios") — al subir un
// resultado aquí, aparece automáticamente en el panel del paciente.
const LABORATORIOS_STORAGE_KEY = "vitalis_laboratorios";

function obtenerResultadosAdmin() {
  const raw = localStorage.getItem(LABORATORIOS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer los resultados guardados.", e);
    }
  }
  return []; // si el paciente nunca ha entrado, empieza vacío
}

function guardarResultadosAdmin(lista) {
  localStorage.setItem(LABORATORIOS_STORAGE_KEY, JSON.stringify(lista));
}

const formLaboratorio = document.getElementById("form-subir-laboratorio");
if (formLaboratorio) {
  formLaboratorio.addEventListener("submit", (e) => {
    e.preventDefault();

    const pacienteNombre = document.getElementById("lab-paciente").value.trim();
    const tipoExamen = document.getElementById("lab-tipo").value;
    const fecha = document.getElementById("lab-fecha").value;
    const archivoInput = document.getElementById("lab-archivo");
    const estadoResultado = document.getElementById("lab-estado").value;
    const observaciones = document.getElementById("lab-observaciones").value.trim();

    if (!pacienteNombre || !tipoExamen || !fecha || !archivoInput.files[0]) {
      alert("Por favor completa los campos obligatorios: Paciente, Tipo de Examen, Fecha y el Archivo.");
      return;
    }

    const resultados = obtenerResultadosAdmin();
    const nuevoId = resultados.length > 0 ? Math.max(...resultados.map((r) => r.id)) + 1 : 1;

    // Traducimos el resultado clínico (Normal/Alterado/Crítico) al detalle
    // que ve el paciente, y el médico que lo solicita es quien tiene la
    // sesión abierta en el admin (su perfil ya vive en datosAdminDemo).
    const detallePorEstado = {
      Normal: "Valores dentro de rango normal",
      Alterado: "Valores alterados — requiere seguimiento",
      Critico: "Resultado crítico — contactar al paciente",
    };

    resultados.push({
      id: nuevoId,
      examen: tipoExamen,
      detalle: observaciones || detallePorEstado[estadoResultado] || "",
      sede: "Sede Central (Managua)",
      fecha,
      medico: `${datosAdminDemo.cargo} ${datosAdminDemo.apellidos}`,
      estado: "Disponible", // se sube ya con el archivo listo, no queda "En Proceso"
      archivoNombre: archivoInput.files[0].name,
      resultadoClinico: estadoResultado,
    });
    guardarResultadosAdmin(resultados);

    alert("¡Resultado de laboratorio subido exitosamente!");
    formLaboratorio.reset();

    // El reset() del formulario no dispara el 'change' del input de
    // archivo, así que regresamos el texto del label a mano.
    const label = document.getElementById("lab-archivo-label");
    if (label) label.textContent = "Examinar y adjuntar resultado...";
  });
}

// Si el paciente (en otra pestaña) descarga o el admin sube algo nuevo
// desde otra pestaña, no hay nada que refrescar visualmente aquí todavía
// (esta sección no tiene una tabla de "resultados ya subidos"), pero
// dejamos la función disponible por si se agrega esa tabla más adelante.

// ==========================================
// AGENDA MÉDICA: CITAS DE PACIENTES (localStorage)
// ==========================================
// Usa la MISMA clave que pacientes.js ("vitalis_citas_paciente") — como
// ambos paneles viven en el mismo origen, comparten localStorage. Así,
// una cita que agenda el paciente aparece aquí para que el admin la
// confirme, y una cita creada aquí por el admin aparece en el panel
// del paciente. Cuando exista backend, todo esto se vuelve fetch().
const CITAS_STORAGE_KEY = "vitalis_citas_paciente";

const ESPECIALIDAD_LABELS_AGENDA = {
  "medicina-general": "Medicina General",
  "pediatria": "Pediatría",
  "ginecologia": "Ginecología",
  "odontologia": "Odontología",
};

function obtenerCitasAdmin() {
  const raw = localStorage.getItem(CITAS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer las citas guardadas.", e);
    }
  }
  return []; // si el paciente nunca ha entrado, empieza vacío — no hay nada que inventar aquí
}

function guardarCitasAdmin(lista) {
  localStorage.setItem(CITAS_STORAGE_KEY, JSON.stringify(lista));
}

function formatearFechaAdmin(fechaISO) {
  if (!fechaISO) return "—";
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

function badgeEstadoCitaAdmin(estado) {
  if (estado === "Pendiente") {
    return '<span class="badge badge-warning text-dark">Pendiente</span>';
  }
  if (estado === "Confirmada") {
    return '<span class="badge badge-info">Confirmada</span>';
  }
  if (estado === "Atendida") {
    return '<span class="badge badge-success">Atendida</span>';
  }
  return '<span class="badge badge-danger">Cancelada</span>';
}

function accionesCitaAdmin(cita) {
  if (cita.estado === "Pendiente") {
    return `
      <button class="btn btn-sm btn-light text-success" title="Confirmar cita" onclick="confirmarCitaAdmin(${cita.id})">
        <i class="fas fa-check"></i>
      </button>
      <button class="btn btn-sm btn-light text-danger" title="Cancelar" onclick="cancelarCitaAdmin(${cita.id})">
        <i class="fas fa-xmark"></i>
      </button>`;
  }
  if (cita.estado === "Confirmada") {
    return `
      <button class="btn btn-sm btn-light text-success" title="Iniciar Consulta" onclick="iniciarConsultaCitaAdmin(${cita.id})">
        <i class="fas fa-play"></i>
      </button>
      <button class="btn btn-sm btn-light text-danger" title="Cancelar" onclick="cancelarCitaAdmin(${cita.id})">
        <i class="fas fa-xmark"></i>
      </button>`;
  }
  if (cita.estado === "Atendida") {
    return `
      <button class="btn btn-sm btn-light text-info" title="Ver detalle" onclick="alert('${cita.nombrePaciente} — ${cita.especialidad} con ${cita.medico}, ${formatearFechaAdmin(cita.fecha)}.')">
        <i class="fas fa-eye"></i>
      </button>`;
  }
  // Cancelada
  return `
    <button class="btn btn-sm btn-light text-secondary" title="Reagendar" onclick="document.getElementById('form-programar-cita').scrollIntoView({behavior:'smooth'})">
      <i class="fas fa-rotate"></i>
    </button>`;
}

window.renderCitasAdmin = function () {
  const tbody = document.getElementById("tabla-citas-admin-body");
  if (!tbody) return;

  const citas = obtenerCitasAdmin();

  if (citas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="fas fa-calendar-times fa-2x mb-2 d-block"></i>
          Todavía no hay citas registradas por pacientes.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = citas.map((c) => `
    <tr>
      <td class="font-weight-bold text-primary">${formatearFechaAdmin(c.fecha)}<br><small class="text-muted font-weight-normal">${c.hora}</small></td>
      <td>${c.nombrePaciente || "—"}</td>
      <td>${c.medico}</td>
      <td>${c.especialidad}</td>
      <td>${badgeEstadoCitaAdmin(c.estado)}</td>
      <td class="text-center">${accionesCitaAdmin(c)}</td>
    </tr>
  `).join("");
};

window.confirmarCitaAdmin = function (id) {
  const citas = obtenerCitasAdmin();
  const cita = citas.find((c) => c.id === id);
  if (!cita) return;

  cita.estado = "Confirmada";
  guardarCitasAdmin(citas);
  renderCitasAdmin();
};

window.iniciarConsultaCitaAdmin = function (id) {
  const citas = obtenerCitasAdmin();
  const cita = citas.find((c) => c.id === id);
  if (!cita) return;

  // Precargar el formulario de "Registrar Consulta" con los datos de
  // esta cita — la cita pasa a "Atendida" hasta que se GUARDE la
  // consulta, no antes (así no queda "atendida" sin diagnóstico real).
  document.getElementById("con-cita-id").value = cita.id;
  document.getElementById("con-paciente").value = cita.nombrePaciente || "";
  document.getElementById("con-fecha").value = cita.fecha;

  const selectEspecialidad = document.getElementById("con-especialidad");
  const opcionCoincide = Array.from(selectEspecialidad.options).find(
    (o) => o.value === cita.especialidad
  );
  selectEspecialidad.value = opcionCoincide ? cita.especialidad : "";

  const alertaVinculada = document.getElementById("alerta-consulta-vinculada");
  const textoVinculada = document.getElementById("texto-consulta-vinculada");
  if (alertaVinculada && textoVinculada) {
    textoVinculada.textContent = `Esta consulta se vinculará a la cita de ${cita.nombrePaciente} con ${cita.medico} (${formatearFechaAdmin(cita.fecha)}). Al guardar, la cita quedará marcada como "Atendida".`;
    alertaVinculada.classList.remove("d-none");
  }

  mostrarSeccion("consultas", "nav-consultas");
};

window.cancelarCitaAdmin = function (id) {
  const confirmado = confirm("¿Seguro que quieres cancelar esta cita?");
  if (!confirmado) return;

  const citas = obtenerCitasAdmin();
  const cita = citas.find((c) => c.id === id);
  if (!cita) return;

  cita.estado = "Cancelada";
  guardarCitasAdmin(citas);
  renderCitasAdmin();
};

// Poblar el select de médicos de "Programar Nueva Cita" con los médicos
// REALES registrados en "Gestionar Médicos" (no una lista inventada)
function poblarSelectMedicosAgenda() {
  const select = document.getElementById("age-medico");
  if (!select) return;

  const medicosActivos = obtenerMedicos().filter((m) => m.estado === "Activo");
  const valorPrevio = select.value;

  select.innerHTML = '<option value="">Seleccionar Médico...</option>';

  if (medicosActivos.length === 0) {
    select.innerHTML += '<option value="" disabled>No hay médicos activos registrados</option>';
    return;
  }

  medicosActivos.forEach((m) => {
    const nombreCompleto = `${m.tratamiento} ${m.nombres} ${m.apellidos}`;
    const especialidadTexto = ESPECIALIDAD_LABELS_AGENDA[m.especialidad] || m.especialidad;
    const option = document.createElement("option");
    option.value = nombreCompleto;
    option.dataset.especialidad = especialidadTexto;
    option.textContent = `${nombreCompleto} (${especialidadTexto})`;
    select.appendChild(option);
  });

  // Conservar la selección previa si el médico sigue disponible
  if (valorPrevio) select.value = valorPrevio;
}

const formCita = document.getElementById("form-programar-cita");
if (formCita) {
  formCita.addEventListener("submit", (e) => {
    e.preventDefault();

    const pacienteNombre = document.getElementById("age-paciente").value.trim();
    const selectMedico = document.getElementById("age-medico");
    const medico = selectMedico.value;
    const especialidad = (selectMedico.selectedOptions[0] && selectMedico.selectedOptions[0].dataset.especialidad) || "General";
    const fecha = document.getElementById("age-fecha").value;
    const hora = document.getElementById("age-hora").value;
    const tipo = document.getElementById("age-tipo").value;
    const notas = document.getElementById("age-notas").value.trim();

    if (!pacienteNombre || !medico || !fecha || !hora) {
      alert("Por favor completa los campos obligatorios: Paciente, Médico, Fecha y Hora.");
      return;
    }

    const citas = obtenerCitasAdmin();
    const nuevoId = citas.length > 0 ? Math.max(...citas.map((c) => c.id)) + 1 : 1;
    citas.push({
      id: nuevoId,
      nombrePaciente: pacienteNombre,
      fecha,
      hora,
      medico,
      especialidad,
      centro: "Sede Central (Managua)",
      consultorio: Math.floor(Math.random() * 5) + 1,
      // Una cita creada directamente por el admin ya queda confirmada
      // (no necesita el paso de "Pendiente" como sí lo requiere el
      // autoagendamiento del paciente).
      estado: "Confirmada",
      tipoAtencion: tipo,
      motivo: notas,
    });
    guardarCitasAdmin(citas);
    renderCitasAdmin();

    alert("¡Cita agendada exitosamente!");
    formCita.reset();
  });
}

// Si el paciente (en otra pestaña del mismo navegador) agenda o modifica
// una cita, refrescamos la tabla automáticamente sin que el admin tenga
// que darle clic a "Refrescar" manualmente.
window.addEventListener("storage", (e) => {
  if (e.key === CITAS_STORAGE_KEY) {
    renderCitasAdmin();
  }
});

// ==========================================
// 6. PERFIL DEL ADMINISTRADOR / PERSONAL DE SALUD
// ==========================================

// Datos simulados — cuando exista backend, esto vendrá de la sesión/API real
const datosAdminDemo = {
  nombres: "Roberto",
  apellidos: "Gómez",
  correo: "roberto.gomez@vitalistech.com",
  telefono: "8888-8888",
  usuario: "rgomez",
  cargo: "Médico General",
  fechaIngreso: "10/01/2026",
};

function actualizarVistaPerfilAdmin(datos) {
  const nombreCompleto = `${datos.nombres} ${datos.apellidos}`;
  const iniciales = (datos.nombres.charAt(0) + datos.apellidos.charAt(0)).toUpperCase();

  const elNombreTarjeta = document.getElementById("perfil-admin-nombre-completo");
  const elUsuarioTarjeta = document.getElementById("perfil-admin-usuario-actual");
  const elCargoTarjeta = document.getElementById("perfil-admin-cargo-resumen");
  const elIniciales = document.getElementById("perfil-admin-avatar-iniciales");
  const elNombreTopbar = document.getElementById("topbar-admin-nombre");

  if (elNombreTarjeta) elNombreTarjeta.textContent = nombreCompleto;
  if (elUsuarioTarjeta) elUsuarioTarjeta.textContent = `@${datos.usuario}`;
  if (elCargoTarjeta) elCargoTarjeta.textContent = datos.cargo;
  if (elIniciales) elIniciales.textContent = iniciales;
  if (elNombreTopbar) elNombreTopbar.textContent = `${datos.cargo} ${datos.apellidos}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const inputNombres = document.getElementById("perfil-admin-nombres");
  if (!inputNombres) return; // esta página no tiene el formulario de perfil

  document.getElementById("perfil-admin-nombres").value = datosAdminDemo.nombres;
  document.getElementById("perfil-admin-apellidos").value = datosAdminDemo.apellidos;
  document.getElementById("perfil-admin-correo").value = datosAdminDemo.correo;
  document.getElementById("perfil-admin-telefono").value = datosAdminDemo.telefono;
  document.getElementById("perfil-admin-usuario").value = datosAdminDemo.usuario;
  document.getElementById("perfil-admin-cargo").value = datosAdminDemo.cargo;
  document.getElementById("perfil-admin-fecha-ingreso").textContent = datosAdminDemo.fechaIngreso;

  actualizarVistaPerfilAdmin(datosAdminDemo);
});

// ---------- Foto de perfil: subir con vista previa y quitar ----------
const perfilFotoInput = document.getElementById("perfil-admin-foto-input");
const perfilAvatarImg = document.getElementById("perfil-admin-avatar-img");
const perfilAvatarIniciales = document.getElementById("perfil-admin-avatar-iniciales");
const perfilQuitarFotoBtn = document.getElementById("perfil-admin-quitar-foto");
const topbarAvatar = document.getElementById("topbar-admin-avatar");

function mostrarFotoPerfil(dataUrl) {
  // Vista previa grande en la tarjeta de perfil
  if (perfilAvatarImg) {
    perfilAvatarImg.src = dataUrl;
    perfilAvatarImg.style.display = "block";
  }
  if (perfilAvatarIniciales) perfilAvatarIniciales.style.display = "none";

  // Reflejar también en el avatar chiquito del topbar
  if (topbarAvatar) {
    topbarAvatar.innerHTML = `<img src="${dataUrl}" alt="" style="width:100%; height:100%; object-fit:cover;">`;
  }
}

function quitarFotoPerfil() {
  if (perfilAvatarImg) {
    perfilAvatarImg.src = "";
    perfilAvatarImg.style.display = "none";
  }
  if (perfilAvatarIniciales) perfilAvatarIniciales.style.display = "inline";
  if (perfilFotoInput) perfilFotoInput.value = "";

  if (topbarAvatar) {
    topbarAvatar.innerHTML = '<i class="fas fa-user-doctor"></i>';
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
      mostrarFotoPerfil(event.target.result);
    };
    lector.readAsDataURL(archivo);

    // Aquí en el futuro: subir 'archivo' al backend (FormData + fetch POST)
    // en vez de solo mostrarlo localmente con FileReader.
  });
}

if (perfilQuitarFotoBtn) {
  perfilQuitarFotoBtn.addEventListener("click", quitarFotoPerfil);
}

// ---------- Guardar cambios de datos personales ----------
const formEditarPerfilAdmin = document.getElementById("form-editar-perfil-admin");
if (formEditarPerfilAdmin) {
  formEditarPerfilAdmin.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!formEditarPerfilAdmin.checkValidity()) {
      formEditarPerfilAdmin.reportValidity();
      return;
    }

    const datosActualizados = {
      nombres: document.getElementById("perfil-admin-nombres").value.trim(),
      apellidos: document.getElementById("perfil-admin-apellidos").value.trim(),
      usuario: document.getElementById("perfil-admin-usuario").value.trim(),
      cargo: document.getElementById("perfil-admin-cargo").value,
    };

    actualizarVistaPerfilAdmin(datosActualizados);
    alert("¡Tus datos se actualizaron exitosamente!");

    // Regresar al dashboard general, como corresponde tras guardar
    // (no usamos reset() para conservar los valores recién guardados
    // si el usuario vuelve a abrir Mi Perfil)
    mostrarSeccion('resumen', 'nav-resumen');

    // Aquí en el futuro: fetch PUT/PATCH al backend para guardar los cambios reales
    /*
    fetch('/api/personal/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...datosActualizados, correo, telefono })
    });
    */
  });
}

// ---------- Cambiar contraseña ----------
const formCambiarPasswordAdmin = document.getElementById("form-cambiar-password-admin");
if (formCambiarPasswordAdmin) {
  formCambiarPasswordAdmin.addEventListener("submit", (e) => {
    e.preventDefault();

    const actual = document.getElementById("perfil-admin-password-actual").value;
    const nueva = document.getElementById("perfil-admin-password-nueva").value;
    const confirmar = document.getElementById("perfil-admin-password-confirmar").value;

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
    formCambiarPasswordAdmin.reset();

    // Aquí en el futuro: fetch POST al backend para validar la contraseña actual
    // y guardar el nuevo hash de forma segura.
  });
}

// ==========================================
// 6. GESTIÓN DE MÉDICOS (registrar / editar / dar de baja)
// ==========================================
// Se guarda en localStorage bajo esta clave. El formulario de "Agendar Cita"
// del paciente (pacientes.js) lee esta misma clave para mostrar los médicos
// disponibles por especialidad. Cuando conectes el backend, reemplaza
// obtenerMedicos()/guardarMedicos() por llamadas fetch() a tu API.
const MEDICOS_STORAGE_KEY = "vitalis_medicos";

function obtenerMedicos() {
  const raw = localStorage.getItem(MEDICOS_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn("No se pudo leer la lista de médicos guardada, se reinicia.", e);
    }
  }
  // Semilla inicial la primera vez que se abre el panel (para que la demo
  // no arranque vacía). Coincide con los médicos que antes estaban
  // hardcodeados en pacientes.js.
  const semilla = [
    { id: 1, tratamiento: "Dr.", nombres: "Roberto", apellidos: "Gómez", cedula: "", telefono: "8888-0001", correo: "", especialidad: "medicina-general", licencia: "", horario: "Lunes a Viernes, 8:00am - 4:00pm", estado: "Activo" },
    { id: 2, tratamiento: "Dra.", nombres: "María", apellidos: "López", cedula: "", telefono: "8888-0002", correo: "", especialidad: "medicina-general", licencia: "", horario: "Lunes a Viernes, 8:00am - 4:00pm", estado: "Activo" },
    { id: 3, tratamiento: "Dr.", nombres: "Carlos", apellidos: "Ruiz", cedula: "", telefono: "8888-0003", correo: "", especialidad: "pediatria", licencia: "", horario: "Martes y Jueves, 9:00am - 1:00pm", estado: "Activo" },
    { id: 4, tratamiento: "Dra.", nombres: "Sofía", apellidos: "Gutiérrez", cedula: "", telefono: "8888-0004", correo: "", especialidad: "ginecologia", licencia: "", horario: "Lunes, Miércoles y Viernes, 8:00am - 12:00pm", estado: "Activo" },
    { id: 5, tratamiento: "Dr.", nombres: "Mario", apellidos: "Duarte", cedula: "", telefono: "8888-0005", correo: "", especialidad: "odontologia", licencia: "", horario: "Lunes a Viernes, 1:00pm - 5:00pm", estado: "Activo" },
  ];
  guardarMedicos(semilla);
  return semilla;
}

function guardarMedicos(listaMedicos) {
  localStorage.setItem(MEDICOS_STORAGE_KEY, JSON.stringify(listaMedicos));
}

const NOMBRES_ESPECIALIDAD = {
  "medicina-general": "Medicina General",
  "pediatria": "Pediatría",
  "ginecologia": "Ginecología",
  "odontologia": "Odontología",
};

function renderTablaMedicos() {
  const tbody = document.getElementById("tabla-medicos-body");
  if (!tbody) return;

  const medicos = obtenerMedicos();

  if (medicos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Todavía no hay médicos registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = medicos.map((m) => {
    const badgeClase = m.estado === "Activo" ? "badge-success" : "badge-secondary";
    const especialidadTexto = NOMBRES_ESPECIALIDAD[m.especialidad] || m.especialidad;
    return `
      <tr>
        <td class="font-weight-bold">${m.tratamiento} ${m.nombres} ${m.apellidos}</td>
        <td>${especialidadTexto}</td>
        <td>${m.telefono}</td>
        <td><span class="badge ${badgeClase}">${m.estado}</span></td>
        <td class="text-center">
          <button class="btn btn-sm btn-light text-primary" title="Editar" onclick="editarMedico(${m.id})">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-light text-danger" title="Eliminar" onclick="eliminarMedico(${m.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function limpiarFormMedico() {
  document.getElementById("form-registrar-medico").reset();
  document.getElementById("medico-edit-id").value = "";
  document.getElementById("tituloFormMedico").innerHTML = '<i class="fas fa-user-doctor mr-2"></i>Registrar Nuevo Médico';
  document.getElementById("btn-guardar-medico").innerHTML = '<i class="fas fa-save mr-2"></i> Guardar Médico';
  document.getElementById("btn-cancelar-edicion-medico").style.display = "none";
}

window.cancelarEdicionMedico = function () {
  limpiarFormMedico();
};

window.editarMedico = function (id) {
  const medicos = obtenerMedicos();
  const medico = medicos.find((m) => m.id === id);
  if (!medico) return;

  document.getElementById("medico-edit-id").value = medico.id;
  document.getElementById("med-tratamiento").value = medico.tratamiento;
  document.getElementById("med-nombres").value = medico.nombres;
  document.getElementById("med-apellidos").value = medico.apellidos;
  document.getElementById("med-cedula").value = medico.cedula || "";
  document.getElementById("med-telefono").value = medico.telefono;
  document.getElementById("med-correo").value = medico.correo || "";
  document.getElementById("med-especialidad").value = medico.especialidad;
  document.getElementById("med-licencia").value = medico.licencia || "";
  document.getElementById("med-estado").value = medico.estado;
  document.getElementById("med-horario").value = medico.horario || "";

  document.getElementById("tituloFormMedico").innerHTML = '<i class="fas fa-user-pen mr-2"></i>Editando: ' + medico.tratamiento + " " + medico.nombres + " " + medico.apellidos;
  document.getElementById("btn-guardar-medico").innerHTML = '<i class="fas fa-save mr-2"></i> Actualizar Médico';
  document.getElementById("btn-cancelar-edicion-medico").style.display = "inline-block";

  // Llevar la vista al formulario para que el usuario vea que entró en modo edición
  document.getElementById("form-registrar-medico").scrollIntoView({ behavior: "smooth", block: "start" });
};

window.eliminarMedico = function (id) {
  const medicos = obtenerMedicos();
  const medico = medicos.find((m) => m.id === id);
  if (!medico) return;

  const confirmado = confirm(
    `¿Seguro que quieres eliminar a ${medico.tratamiento} ${medico.nombres} ${medico.apellidos}?\n\n` +
    `Tip: si el médico solo está de baja temporalmente, mejor edítalo y cambia su Estado a "Inactivo" en vez de eliminarlo — así conservas su historial.`
  );
  if (!confirmado) return;

  const actualizados = medicos.filter((m) => m.id !== id);
  guardarMedicos(actualizados);
  renderTablaMedicos();
};

const formMedico = document.getElementById("form-registrar-medico");
if (formMedico) {
  formMedico.addEventListener("submit", (e) => {
    e.preventDefault();

    const idEnEdicion = document.getElementById("medico-edit-id").value;
    const medicos = obtenerMedicos();

    const datosMedico = {
      tratamiento: document.getElementById("med-tratamiento").value,
      nombres: document.getElementById("med-nombres").value.trim(),
      apellidos: document.getElementById("med-apellidos").value.trim(),
      cedula: document.getElementById("med-cedula").value.trim(),
      telefono: document.getElementById("med-telefono").value.trim(),
      correo: document.getElementById("med-correo").value.trim(),
      especialidad: document.getElementById("med-especialidad").value,
      licencia: document.getElementById("med-licencia").value.trim(),
      estado: document.getElementById("med-estado").value,
      horario: document.getElementById("med-horario").value.trim(),
    };

    if (!datosMedico.nombres || !datosMedico.apellidos || !datosMedico.telefono || !datosMedico.especialidad) {
      alert("Por favor completa los campos obligatorios: Nombres, Apellidos, Teléfono y Especialidad.");
      return;
    }

    if (idEnEdicion) {
      // Actualizar médico existente
      const index = medicos.findIndex((m) => m.id === Number(idEnEdicion));
      if (index !== -1) {
        medicos[index] = { ...medicos[index], ...datosMedico };
      }
      guardarMedicos(medicos);
      alert("¡Médico actualizado exitosamente!");
    } else {
      // Registrar médico nuevo
      const nuevoId = medicos.length > 0 ? Math.max(...medicos.map((m) => m.id)) + 1 : 1;
      medicos.push({ id: nuevoId, ...datosMedico });
      guardarMedicos(medicos);
      alert("¡Médico registrado exitosamente!");
    }

    renderTablaMedicos();
    limpiarFormMedico();
  });
}

// Dibujar la tabla apenas carga el panel (la sección puede estar oculta,
// pero la tabla ya vive en el DOM lista para cuando el admin entre a verla)
renderTablaMedicos();

// ==========================================
// CHATBOT BÁSICO DE AYUDA (reglas, sin IA real)
// ==========================================
// Mismo motor que el del panel de paciente, con preguntas frecuentes
// propias del personal de salud.
(function () {
  const chatbotToggle = document.getElementById("chatbotToggle");
  const chatbotWindow = document.getElementById("chatbotWindow");
  const chatbotClose = document.getElementById("chatbotClose");
  const chatbotBody = document.getElementById("chatbotBody");
  const chatbotForm = document.getElementById("chatbotForm");
  const chatbotInput = document.getElementById("chatbotInput");
  const chatbotQuickReplies = document.getElementById("chatbotQuickReplies");

  if (!chatbotToggle) return; // esta página no tiene el widget

  const FAQ = [
    {
      etiqueta: "¿Cómo registro un médico?",
      palabras: ["registrar médico", "médico nuevo", "agregar médico", "medico"],
      respuesta: "Ve a \"Gestionar Médicos\" y llena el formulario con sus datos y especialidad. Aparecerá disponible para que los pacientes lo elijan al agendar.",
      seccion: "medicos",
      nav: "nav-medicos",
    },
    {
      etiqueta: "¿Cómo confirmo una cita?",
      palabras: ["confirmar", "cita pendiente", "aprobar cita"],
      respuesta: "En \"Agenda Médica\" verás las citas \"Pendiente\" de pacientes. Haz clic en el ✓ para confirmarlas.",
      seccion: "agenda",
      nav: "nav-agenda",
    },
    {
      etiqueta: "¿Cómo subo un resultado de laboratorio?",
      palabras: ["laboratorio", "resultado", "examen", "subir"],
      respuesta: "En \"Subir Laboratorio\" completa el paciente, tipo de examen y adjunta el archivo. Se refleja de inmediato en el panel del paciente.",
      seccion: "laboratorio",
      nav: "nav-laboratorio",
    },
    {
      etiqueta: "¿Cómo registro una consulta?",
      palabras: ["consulta", "diagnostico", "diagnóstico", "receta"],
      respuesta: "Desde \"Agenda Médica\", en una cita Confirmada, haz clic en ▶ \"Iniciar Consulta\" — te lleva directo al formulario con los datos precargados.",
      seccion: "consultas",
      nav: "nav-consultas",
    },
    {
      etiqueta: "Editar mi perfil",
      palabras: ["perfil", "mi cuenta", "foto de perfil"],
      respuesta: "Puedes editar tus datos, tu cargo y subir una foto desde \"Mi Perfil\".",
      seccion: "perfil",
      nav: "nav-admin-perfil",
    },
  ];

  const MENSAJE_BIENVENIDA =
    "¡Hola! Soy el asistente de Vitalis Tech. Elige una pregunta rápida o escribe la tuya.";
  const MENSAJE_SIN_COINCIDENCIA =
    "No encontré una respuesta exacta para eso. Prueba con una de estas opciones:";

  let chatIniciado = false;

  function agregarMensaje(texto, tipo, accion) {
    const burbuja = document.createElement("div");
    burbuja.className = `chatbot-msg chatbot-msg--${tipo}`;
    burbuja.textContent = texto;

    if (accion) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "chatbot-msg-action";
      boton.innerHTML = '<i class="fas fa-arrow-right"></i> Llévame ahí';
      boton.addEventListener("click", function (event) {
        mostrarSeccion(accion.seccion, accion.nav, event);
        chatbotWindow.classList.add("d-none");
      });
      burbuja.appendChild(document.createElement("br"));
      burbuja.appendChild(boton);
    }

    chatbotBody.appendChild(burbuja);
    chatbotBody.scrollTop = chatbotBody.scrollHeight;
  }

  function renderQuickReplies() {
    chatbotQuickReplies.innerHTML = "";
    FAQ.forEach(function (item) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "chatbot-quick-reply";
      boton.textContent = item.etiqueta;
      boton.addEventListener("click", function () {
        responderPregunta(item.etiqueta, item);
      });
      chatbotQuickReplies.appendChild(boton);
    });
  }

  function buscarEnFAQ(texto) {
    const textoNormalizado = texto.toLowerCase();
    return FAQ.find(function (item) {
      return item.palabras.some(function (palabra) {
        return textoNormalizado.includes(palabra);
      });
    });
  }

  function responderPregunta(textoUsuario, itemEncontrado) {
    agregarMensaje(textoUsuario, "user");

    if (itemEncontrado) {
      agregarMensaje(itemEncontrado.respuesta, "bot", {
        seccion: itemEncontrado.seccion,
        nav: itemEncontrado.nav,
      });
    } else {
      agregarMensaje(MENSAJE_SIN_COINCIDENCIA, "bot");
    }
  }

  function iniciarChatSiHaceFalta() {
    if (chatIniciado) return;
    chatIniciado = true;
    agregarMensaje(MENSAJE_BIENVENIDA, "bot");
    renderQuickReplies();
  }

  chatbotToggle.addEventListener("click", function () {
    chatbotWindow.classList.toggle("d-none");
    if (!chatbotWindow.classList.contains("d-none")) {
      iniciarChatSiHaceFalta();
      chatbotInput.focus();
    }
  });

  chatbotClose.addEventListener("click", function () {
    chatbotWindow.classList.add("d-none");
  });

  chatbotForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const texto = chatbotInput.value.trim();
    if (!texto) return;

    const coincidencia = buscarEnFAQ(texto);
    responderPregunta(texto, coincidencia);
    chatbotInput.value = "";
  });
})();
