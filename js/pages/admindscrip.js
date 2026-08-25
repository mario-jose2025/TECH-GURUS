function mostrarSeccion(idSeccion, idNav) {
  // 1. Ocultar todas las secciones de contenido
  const secciones = document.querySelectorAll('.content-section');
  secciones.forEach(sec => sec.style.display = 'none');

  // 2. Desactivar todos los ítems activos del menú lateral
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  // 3. Mostrar la sección seleccionada
  const seccionObjetivo = document.getElementById(`sec-${idSeccion}`);
  if (seccionObjetivo) {
    seccionObjetivo.style.display = 'block';
  }

  // 4. Marcar el menú como activo
  const navObjetivo = document.getElementById(idNav);
  if (navObjetivo) {
    navObjetivo.classList.add('active');
  }
}
