# Vitalis Tech

Plataforma web que conecta a pacientes con centros de salud en Nicaragua, permitiendo agendar citas, consultar resultados de laboratorio, dar seguimiento a tratamientos y gestionar la atención médica desde un solo lugar.

**Equipo:** TECH GURUS
**Proyecto desarrollado para:** Hackatón 2026

---

## 📋 Descripción general

Vitalis Tech resuelve un problema real del sistema de salud nicaragüense: la falta de digitalización en la gestión de citas médicas, expedientes clínicos y resultados de laboratorio, lo que genera filas, papeleo y pérdida de información.

La plataforma tiene dos roles principales:

| Rol | Descripción |
|---|---|
| **Paciente (Usuario)** | Se registra, agenda citas en línea, consulta su historial médico, ve resultados de laboratorio, recibe recordatorios de medicamentos y administra su perfil. |
| **Personal de Salud (Admin)** | Registra y gestiona médicos, confirma/atiende citas, registra consultas con diagnóstico y receta, sube resultados de laboratorio, y consulta estadísticas del centro de salud. |

### Flujo principal del sistema

```
Paciente se registra → Inicia sesión → Agenda una cita (queda "Pendiente")
        ↓
Admin confirma la cita → Atiende la consulta → Registra diagnóstico y receta
        ↓
Paciente ve la cita "Atendida" con el diagnóstico y receta reales en su historial
```

---

## 🚀 Funcionalidades implementadas

**Autenticación y cuentas**
- Registro de pacientes con validación de campos y usuario único
- Inicio de sesión con validación real contra las cuentas registradas
- Recuperación de contraseña en 2 pasos
- Perfil de usuario editable, con foto de perfil (paciente y admin)

**Panel del Paciente**
- Dashboard general con accesos rápidos
- Agendar cita en línea (selección de especialidad, médico disponible, fecha y hora)
- Historial de citas con estados (Pendiente, Confirmada, Atendida, Cancelada) y filtro
- Ver detalle de consulta (diagnóstico y receta reales, registrados por el médico)
- Resultados de laboratorio con buscador
- Recordatorios de medicamentos con seguimiento de cumplimiento
- Chatbot básico de ayuda (preguntas frecuentes)

**Panel del Personal de Salud (Admin)**
- Dashboard con métricas en tiempo real y gráfica de distribución de citas
- Gestión de médicos (crear, editar, activar/desactivar)
- Agenda médica: confirmar, cancelar o atender citas de pacientes
- Registrar consulta médica (signos vitales, diagnóstico, receta) vinculada a la cita
- Subir resultados de laboratorio (se reflejan automáticamente en el panel del paciente)
- Registro de pacientes y creación de expediente clínico
- Estadísticas de salud con gráficas (Chart.js)
- Chatbot básico de ayuda

**Experiencia técnica**
- Actualización en tiempo real entre pestañas del navegador (si el admin confirma una cita, el paciente la ve actualizada sin recargar)
- Estados vacíos manejados correctamente (sin datos de ejemplo permanentes)
- Diseño responsive

---

## 🛠️ Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Páginas públicas (landing, login, registro, recuperar contraseña) | HTML5, CSS3 (sistema de diseño propio), JavaScript vanilla |
| Paneles internos (paciente y admin) | Bootstrap 4.6, plantilla SB Admin 2, jQuery, Font Awesome 6 |
| Gráficas | Chart.js |
| Persistencia de datos (temporal, sin backend) | `localStorage` del navegador |
| Control de versiones | Git y GitHub |

> **Nota importante:** este proyecto es actualmente **100% frontend**. No existe un backend ni base de datos real todavía — todos los datos (usuarios, citas, médicos, consultas, resultados de laboratorio) se guardan en el `localStorage` del navegador para poder demostrar el flujo completo de la aplicación sin depender de un servidor. Ver la sección [Diagrama de base de datos](#-diagrama-de-base-de-datos-planeado) para el modelo planeado cuando se conecte el backend.

---

## 📂 Estructura del proyecto

```
TECH GURUS/
├── index.html                  # Landing page (pantalla de carga + bienvenida)
├── pages/
│   ├── login.html              # Inicio de sesión (paciente / personal de salud)
│   ├── registro.html           # Registro de nuevo paciente
│   ├── recuperar-password.html # Recuperación de contraseña
│   ├── pacientes.html          # Panel del paciente
│   └── admind.html             # Panel del personal de salud / admin
├── css/
│   ├── base/                   # Variables de diseño y reset
│   ├── components/             # Componentes reutilizables (navbar, botones, modal, chatbot...)
│   └── pages/                  # Estilos específicos de cada página
├── js/
│   ├── components/             # Lógica reutilizable (navbar, carrusel, loader)
│   └── pages/                  # Lógica específica de cada página
└── assets/
    ├── logo/                   # Logo del proyecto (SVG)
    └── images/carousel/        # Imágenes del carrusel de la landing
```

---

## ⚙️ Instalación y ejecución

Este proyecto **no requiere instalación de dependencias** (no usa Node.js, npm, ni ningún framework con build step). Sin embargo, **debe ejecutarse a través de un servidor local** — no abrir los archivos directamente con doble clic — porque usa `localStorage` y rutas relativas que funcionan mejor sobre HTTP.

### Opción 1: VS Code + Live Server (recomendado)

1. Clona o descarga este repositorio.
2. Ábrelo en Visual Studio Code.
3. Instala la extensión **Live Server** (si no la tienes).
4. Clic derecho sobre `index.html` → **"Open with Live Server"**.
5. Se abrirá automáticamente en `http://127.0.0.1:5500` (o similar).

### Opción 2: Servidor local con Python

Si tienes Python instalado, desde la carpeta raíz del proyecto:

```bash
python3 -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador.

---

## 🔑 Credenciales de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Personal de Salud (Admin) | `admin` | `admin123` |
| Paciente | *(crear cuenta propia en "Registrarse")* | *(la que definas al registrarte)* |

---

## 🗄️ Diagrama de base de datos (planeado)

Actualmente los datos viven en `localStorage` del navegador, organizados como las siguientes "colecciones" (equivalentes a tablas en una futura base de datos relacional):

- `vitalis_cuentas_pacientes` — cuentas de pacientes
- `vitalis_medicos` — médicos registrados
- `vitalis_citas_paciente` — citas agendadas
- `vitalis_consultas` — consultas médicas (diagnóstico, receta)
- `vitalis_laboratorios` — resultados de laboratorio
- `vitalis_recordatorios` — recordatorios de medicamentos

El modelo entidad-relación (ER) propuesto para la base de datos relacional se encuentra en [`docs/diagrama-er.md`](docs/diagrama-er.md).

---

## 🔒 Roles y permisos

| Rol | Permisos |
|---|---|
| **Usuario (Paciente)** | Agendar/cancelar sus propias citas, ver su propio historial, resultados y perfil. No puede ver información de otros pacientes ni acceder a módulos administrativos. |
| **Admin (Personal de Salud)** | Gestionar médicos, confirmar/atender citas de cualquier paciente, registrar consultas y resultados de laboratorio, ver estadísticas generales. |
| **Auditor** | *(rol planeado)* Acceso de solo lectura a citas, consultas y estadísticas, sin permisos de creación/edición — pensado para supervisión y control de calidad del centro de salud. |

---

## 🎥 Video de navegación

*(Agregar aquí el enlace al video una vez grabado)*

---

## 👥 Equipo

Desarrollado por **TECH GURUS** para el Hackatón 2026.
