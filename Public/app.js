// Capturar el formulario de registro
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
        // Evita que la página se recargue inmediatamente
        event.preventDefault();

        // Aquí iría la lógica para enviar datos al servidor/backend

        // Redirige al usuario a la pantalla de inicio de sesión (index.html)
        // O si tienes una pantalla principal (dashboard.html), cambia 'index.html' por 'dashboard.html'
        window.location.href = 'index.html';
    });
}
