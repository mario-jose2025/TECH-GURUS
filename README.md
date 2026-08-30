## Vitalis Tech

Plataforma web que conecta a pacientes con centros de salud en Nicaragua, permitiendo agendar citas, consultar resultados de laboratorio, dar seguimiento a tratamientos y gestionar la atención médica desde un solo lugar.

## Equipo: TECH GURUS

## Proyecto desarrollado para:Hackatón 2026

## Descripción general

Vitalis Tech resuelve un problema real del sistema de salud nicaragüense: la falta de digitalización en la gestión de citas médicas, expedientes clínicos y resultados de laboratorio, lo que genera filas, papeleo y pérdida de información.

La plataforma tiene dos roles de aplicación web, más un tercer rol de supervisión a nivel de base de datos.

Rol: Descripción
Usuario (Paciente):  Se registra, agenda citas en línea, consulta su historial médico, ve resultados de laboratorio, recibe recordatorios de medicamentos y administra su perfil.

Admin (Personal de Salud): Registra y gestiona médicos, confirma/atiende citas, registra consultas con diagnóstico y receta, sube resultados de laboratorio, y consulta estadísticas del centro de salud.

Auditor: No es un rol de la aplicación web — es un rol de **SQL Server** con acceso de solo lectura, pensado para supervisar quién hizo qué cambios directamente en la base de datos.

## Flujo principal del sistema

Paciente se registra → Inicia sesión → Agenda una cita (queda "Pendiente")
        ↓
Admin confirma la cita → Atiende la consulta → Registra diagnóstico y receta
        ↓
Paciente ve la cita "Atendida" con el diagnóstico y receta reales en su historial


##  Funcionalidades implementadas

Autenticación y cuentas.
- Registro de pacientes con validación de campos y usuario único
- Inicio de sesión con validación real contra la base de datos (contraseñas con hash `bcrypt`, nunca en texto plano)
- Recuperación de contraseña en 2 pasos
- Perfil de usuario editable, con foto de perfil (paciente y admin)

Panel del Paciente.
- Dashboard general con accesos rápidos
- Agendar cita en línea (selección de especialidad, médico disponible, fecha y hora)
- Historial de citas con estados (Pendiente, Confirmada, Atendida, Cancelada) y filtro
- Ver detalle de consulta (diagnóstico y receta reales, registrados por el médico)
- Resultados de laboratorio con buscador
- Recordatorios de medicamentos con seguimiento de cumplimiento
- Chatbot básico de ayuda (preguntas frecuentes)

Panel del Personal de Salud (Admin).
- Dashboard con métricas en tiempo real y gráfica de distribución de citas
- Gestión de médicos (crear, editar, activar/desactivar) — **conectado al backend real**
- Agenda médica: confirmar, cancelar o atender citas de pacientes
- Registrar consulta médica (signos vitales, diagnóstico, receta) vinculada a la cita
- Subir resultados de laboratorio
- Registro de pacientes y creación de expediente clínico
- Estadísticas de salud con gráficas (Chart.js)
- Chatbot básico de ayuda

## Experiencia técnica.
- Actualización en tiempo real entre pestañas del navegador
- Estados vacíos manejados correctamente (sin datos de ejemplo permanentes)
- Diseño responsive

---

## Tecnologías utilizadas.

 Capa Tecnología.
-Páginas públicas (landing, login, registro, recuperar contraseña) | HTML5, CSS3 (sistema de diseño propio), JavaScript vanilla 
- Paneles internos (paciente y admin) | Bootstrap 4.6, plantilla SB Admin 2, jQuery, Font Awesome 6.
- Gráficas | Chart.js 
-Backend Node.js + Express. 
-Base de datos Microsoft SQL Server.
-Autenticación `bcrypt` (hash de contraseñas).
-Conexión a la base de datos  Paquete `mssql` de Node.js.
-Control de versiones  Git y GitHub.


## Backend

El backend es una API REST construida con Node.js y Express, que se conecta a una base de datos real de SQL Server.(`VitalisTechApp`). Vive en la carpeta `Backend/` del proyecto.

### Rutas disponibles

Módulo, Rutas, Descripción:

Autenticación  `POST /api/login`<br>`POST /api/registro` | Inicio de sesión (admin y paciente) y creación de cuentas nuevas |
Médicos `GET /api/medicos`<br>`POST /api/medicos`<br>`PUT /api/medicos/:id`<br>`PATCH /api/medicos/:id/estado` | CRUD completo de médicos — **totalmente conectado**, frontend y backend |
Citas  `GET /api/citas`<br>`POST /api/citas`<br>`PATCH /api/citas/:id/estado` | Agendar, confirmar, cancelar y atender citas |
Consultas  `GET /api/consultas`<br>`POST /api/consultas` | Registrar diagnóstico y receta — usa una transacción SQL para que la consulta y el cambio de estado de la cita se guarden juntos, o ninguno de los dos |
Laboratorios `GET /api/laboratorios`<br>`POST /api/laboratorios` | Subir y consultar resultados de exámenes |
Recordatorios `GET /api/recordatorios`<br>`POST /api/recordatorios`<br>`PATCH /api/recordatorios/:id/tomado` | Recordatorios de medicamentos del paciente |
Expedientes  `GET /api/expedientes/:paciente_id`<br>`POST /api/expedientes`<br>`PUT /api/expedientes/:paciente_id` | Historial clínico base del paciente (alergias, tipo de sangre, etc.) |

### Estado de conexión frontend ↔ backend

Todas las rutas de arriba ya existen y funcionan contra la base de datos real (se pueden probar directamente, por ejemplo con `Invoke-RestMethod` en PowerShell o Postman). La conexión completa desde la interfaz web está en distintas etapas:

### Estructura del backend

```
Backend/
├── server.js              # Servidor principal (Express)
├── db.js                  # Conexión reutilizable a SQL Server
├── package.json
├── .env.example            # Plantilla de variables de entorno (sin credenciales reales)
├── .gitignore               # Excluye node_modules/ y .env del repositorio
└── routes/
    ├── auth.routes.js
    ├── medicos.routes.js
    ├── citas.routes.js
    ├── consultas.routes.js
    ├── laboratorios.routes.js
    ├── recordatorios.routes.js
    └── expedientes.routes.js
```

---

## Estructura del proyecto

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
├── Backend/                     # API REST (Node.js + Express + SQL Server)
├── docs/                        # Diagrama ER, script SQL, diseño gráfico
└── assets/
    ├── logo/                   # Logo del proyecto (SVG)
    └── images/carousel/        # Imágenes del carrusel de la landing
```

---

## ⚙️ Instalación y ejecución

El proyecto tiene 2 partes que corren por separado: el frontend (estático) y el backend (servidor Node.js). Ambos deben estar corriendo al mismo tiempo para que la aplicación funcione completa.

### 1. Base de datos (SQL Server)

1. Instala SQL Server (o usa una instancia existente) y SQL Server Management Studio (SSMS).
2. Ejecuta el script `docs/schema-sql-server.sql` completo — crea la base `VitalisTechApp` con sus 8 tablas.
3. Habilita **"SQL Server and Windows Authentication mode"** en las propiedades del servidor (Security), y reinicia el servicio.
4. Crea un login de SQL Server (ej. `vitalis_app`) con permisos `db_owner` sobre `VitalisTechApp` — el backend se conecta con este usuario.

### 2. Backend (Node.js)

bash
cd Backend
cp .env.example .env        # Edita .env con tus credenciales reales de SQL Server
npm install
node generar-hash.js        # Genera el hash de la contraseña de prueba del admin
                             # (copia el UPDATE que imprime y córrelo en SSMS)
npm start

Si todo está bien configurado, verás:

Servidor corriendo en http://localhost:3000
Conectado a SQL Server: VitalisTechApp


### 3. Frontend

No abrir los archivos directamente con doble clic — usa un servidor local, porque el proyecto usa rutas relativas y llama al backend por HTTP:

- VS Code + Live Server (recomendado): clic derecho en `index.html` → "Open with Live Server".
- Alternativa con Python: `python3 -m http.server 8000` desde la raíz del proyecto.


## Credenciales de prueba
 Rol, Usuario, Contraseña.
 Personal de Salud (Admin)  `admin` | `admin123` 
 Paciente *(crear cuenta propia en "Registrarse")*  *(la que definas al registrarte)* 


## Roles y permisos

### Roles de la aplicación web

Rol | Permisos 
Usuario (Paciente) Agendar/cancelar sus propias citas, ver su propio historial, resultados y perfil. No puede ver información de otros pacientes ni acceder a módulos administrativos.

Admin (Personal de Salud) Gestionar médicos, confirmar/atender citas de cualquier paciente, registrar consultas y resultados de laboratorio, ver estadísticas generales. |

### Rol Auditor — a nivel de base de datos, no de la aplicación web

El Auditor de este proyecto no es un tercer login de la página web ,es un rol de SQL Server, pensado para que alguien con ese acceso pueda supervisar directamente en la base de datos qué cambios se hicieron, quién los hizo, y cuándo, sin poder modificar nada él mismo.

¿Cómo se implementa?.

1.Permisos de solo lectura: se crea un login de SQL Server (ej. `vitalis_auditor`) con permiso `db_datareader` sobre `VitalisTechApp` — puede ejecutar `SELECT` sobre cualquier tabla, pero no `INSERT`, `UPDATE` ni `DELETE`.


## Consideraciones de seguridad (estado actual y plan de corrección)

 Tema, Estado .
 Contraseñas de usuarios (pacientes y admin) Resuelto. Se guardan con hash `bcrypt` en la base de datos — nunca en texto plano, ni siquiera el backend puede leer la contraseña original. 
 Validación de login Resuelto. Ocurre en el backend contra la base de datos real — el frontend no contiene ninguna credencial escrita en el código. 
 Variables sensibles (contraseña de la base de datos) Resuelto. Viven en `Backend/.env`, excluido del repositorio por `.gitignore`. Solo se sube `.env.example` (sin datos reales). 
 Comunicación frontend↔backend Pendiente para producción. Actualmente es HTTP simple en `localhost` — en un entorno real, debe forzarse HTTPS. 
 Rol Auditor Resuelto según el alcance definido. Implementado como un login de SQL Server de solo lectura, no como parte de la aplicación web.


##  Video de navegación

*()*


## Equipo

Desarrollado por **TECH GURUS** para el Hackatón 2026.