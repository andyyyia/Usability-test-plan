# Historias de Usuario — Usability Test Plan Dashboard

**Proyecto:** Usability Test Plan Dashboard  
**Equipo:** Joseph Chachalo  
**Curso:** Interacción Humano-Computadora  
**Fecha:** Junio 2026

---

## Perfiles de Usuario

### P1 — Investigador UX
**Descripción:** Profesional o estudiante que planifica y ejecuta estudios de usabilidad.  
**Objetivo principal:** Organizar múltiples proyectos de prueba y revisar resultados consolidados.  
**Nivel técnico:** Medio-alto. Familiarizado con metodologías UX.

### P2 — Moderador de Sesión
**Descripción:** Persona que conduce las sesiones de prueba con participantes.  
**Objetivo principal:** Tener a mano el guión y registrar observaciones en tiempo real.  
**Nivel técnico:** Medio. Necesita interfaz clara y de acceso rápido durante sesiones.

### P3 — Observador/Analista
**Descripción:** Miembro del equipo que registra comportamientos y toma notas.  
**Objetivo principal:** Documentar hallazgos y generar reportes accionables.  
**Nivel técnico:** Medio. Necesita formularios claros y métricas visuales.

---

## Épicas

| Épica | Descripción |
|-------|-------------|
| E1 — Gestión de Proyectos | Crear, editar y eliminar proyectos de prueba |
| E2 — Planificación | Definir parámetros, tareas y guión del test |
| E3 — Ejecución | Registrar observaciones durante sesiones |
| E4 — Análisis | Sintetizar hallazgos y revisar métricas |
| E5 — Accesibilidad y UX | Garantizar acceso universal y experiencia de calidad |

---

## Historias de Usuario

### Épica E1 — Gestión de Proyectos

---

**HU-01**  
**Como** investigador UX,  
**Quiero** crear un nuevo proyecto de prueba con nombre y descripción,  
**Para** organizar las sesiones y datos de un estudio específico.

**Criterios de Aceptación:**
- [ ] El formulario de creación solicita nombre (requerido) y descripción (opcional)
- [ ] Al guardar, el proyecto aparece en el listado con nombre, fecha de creación y estado
- [ ] Se puede seleccionar el proyecto activo desde el sidebar
- [ ] El nombre del proyecto activo se muestra en el breadcrumb de todos los módulos

**Estimación:** 5 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

**HU-02**  
**Como** investigador UX,  
**Quiero** eliminar un proyecto de prueba,  
**Para** mantener el listado limpio y sin proyectos obsoletos.

**Criterios de Aceptación:**
- [ ] Aparece un modal de confirmación antes de eliminar
- [ ] El modal indica claramente que se borrarán todos los datos asociados
- [ ] Tras eliminar, el sistema selecciona automáticamente otro proyecto disponible

**Estimación:** 3 puntos  
**Prioridad:** Media  
**Estado:** Done ✓

---

### Épica E2 — Planificación

---

**HU-03**  
**Como** moderador,  
**Quiero** definir el plan de prueba con objetivo, perfil de usuario y método,  
**Para** tener documentados todos los parámetros del estudio antes de iniciar sesiones.

**Criterios de Aceptación:**
- [ ] El formulario incluye: producto, pantalla, objetivo, perfil, método, fecha, lugar, duración
- [ ] El campo "Método" ofrece opciones: Presencial, Remoto, Híbrido, Guerrilla
- [ ] La fecha acepta solo valores desde hoy hasta 1 año en el futuro
- [ ] Todos los campos requeridos muestran error si se intenta guardar vacíos
- [ ] Se puede alternar entre modo vista y modo edición
- [ ] El sistema advierte al navegar si hay cambios no guardados

**Estimación:** 8 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

**HU-04**  
**Como** moderador,  
**Quiero** añadir tareas al plan de prueba con escenario, resultado esperado y criterio de éxito,  
**Para** definir qué se pedirá a los participantes durante el test.

**Criterios de Aceptación:**
- [ ] Se pueden añadir múltiples filas de tarea con botón "+ Añadir tarea"
- [ ] Cada fila incluye: ID auto-generado, Escenario, Resultado Esperado, Métrica Principal, Criterio de Éxito
- [ ] Se puede eliminar una fila con el ícono de papelera (con confirmación)
- [ ] Las filas completamente vacías se ignoran al guardar
- [ ] Las filas parcialmente llenas muestran error de validación

**Estimación:** 5 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

**HU-05**  
**Como** moderador,  
**Quiero** tener el guión de la sesión disponible durante el test,  
**Para** no omitir instrucciones importantes al conducir la sesión.

**Criterios de Aceptación:**
- [ ] El módulo Tareas y Guión muestra el texto de apertura pre-configurado
- [ ] El moderador puede editar el texto de cada tarea (qué leerle al participante)
- [ ] El módulo muestra el texto de cierre pre-configurado con preguntas de reflexión
- [ ] En modo vista, no se puede editar accidentalmente (protección contra toques involuntarios)

**Estimación:** 6 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

### Épica E3 — Ejecución

---

**HU-06**  
**Como** observador,  
**Quiero** registrar observaciones por participante y tarea durante la sesión,  
**Para** capturar el comportamiento real de los usuarios de forma estructurada.

**Criterios de Aceptación:**
- [ ] Se puede añadir una fila de observación con: participante, perfil, tarea, éxito, tiempo, errores, comentarios, problema, severidad, mejora
- [ ] El campo "Éxito" tiene opciones: Sí, Con ayuda, No
- [ ] El campo "Severidad" tiene opciones: Alta, Media, Baja con colores semánticos
- [ ] El tiempo acepta solo valores 0-36000 (segundos) y errores 0-100
- [ ] Las filas se pueden expandir para ver todos los campos
- [ ] La tabla muestra paginación de 5 observaciones por página

**Estimación:** 10 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

### Épica E4 — Análisis

---

**HU-07**  
**Como** analista UX,  
**Quiero** ver las métricas consolidadas del test en un dashboard,  
**Para** identificar patrones y problemas de usabilidad de forma rápida.

**Criterios de Aceptación:**
- [ ] El dashboard muestra: tasa de éxito %, tiempo promedio, total de errores, hallazgos críticos
- [ ] Gráfica de barras: errores por tarea
- [ ] Gráfica de dona: distribución de severidades (Alta/Media/Baja)
- [ ] Tabla de observaciones recientes (últimas 5)
- [ ] Los datos se actualizan automáticamente al añadir observaciones/hallazgos

**Estimación:** 8 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

**HU-08**  
**Como** equipo de diseño,  
**Quiero** documentar hallazgos con problema, evidencia, frecuencia y recomendación,  
**Para** crear un plan de mejora accionable basado en los datos del test.

**Criterios de Aceptación:**
- [ ] Se puede añadir un hallazgo con: problema, evidencia, frecuencia (formato X/Y), severidad, recomendación, prioridad, estado
- [ ] El estado puede ser: Pendiente, En progreso, Resuelto
- [ ] Las tarjetas de resumen al final muestran conteos por severidad
- [ ] Los hallazgos de estado "Resuelto" se muestran con badge verde

**Estimación:** 8 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

### Épica E5 — Accesibilidad y UX

---

**HU-09**  
**Como** usuario con discapacidad motora,  
**Quiero** navegar por toda la aplicación usando solo el teclado,  
**Para** poder usar el sistema sin depender del mouse.

**Criterios de Aceptación:**
- [ ] Todos los elementos interactivos son alcanzables con Tab/Shift+Tab
- [ ] Los modales atrapan el foco (focus trap) mientras están abiertos
- [ ] Al cerrar un modal, el foco regresa al elemento que lo abrió
- [ ] Los dropdowns se operan con teclas de flecha
- [ ] Los botones se activan con Enter y Space

**Estimación:** 6 puntos  
**Prioridad:** Alta  
**Estado:** Done ✓

---

**HU-10**  
**Como** usuario,  
**Quiero** alternar entre modo claro y modo oscuro,  
**Para** reducir la fatiga visual según las condiciones de iluminación.

**Criterios de Aceptación:**
- [ ] El toggle de modo oscuro está visible en el header/sidebar
- [ ] El cambio se aplica inmediatamente a todos los módulos
- [ ] La preferencia se persiste en localStorage y se recuerda entre sesiones
- [ ] El contraste en modo oscuro cumple WCAG 2.1 AA (≥ 4.5:1)

**Estimación:** 5 puntos  
**Prioridad:** Media  
**Estado:** Done ✓

---

**HU-11** *(mejora propuesta)*  
**Como** investigador,  
**Quiero** exportar los resultados del test en formato CSV o PDF,  
**Para** compartirlos con el cliente o equipo sin necesidad de acceso al sistema.

**Criterios de Aceptación:**
- [ ] Botón "Exportar" en el Dashboard con opciones: CSV completo, PDF de reporte
- [ ] El CSV incluye todas las observaciones y hallazgos con encabezados descriptivos
- [ ] El PDF incluye las gráficas del dashboard y las tablas de datos

**Estimación:** 8 puntos  
**Prioridad:** Baja  
**Estado:** Pendiente (propuesta de mejora M2)

---

**HU-12** *(mejora propuesta)*  
**Como** usuario nuevo,  
**Quiero** ver ayuda contextual sobre cómo usar cada módulo,  
**Para** aprender el flujo de trabajo sin necesidad de documentación externa.

**Criterios de Aceptación:**
- [ ] Tooltips informativos en campos complejos (como el campo Frecuencia)
- [ ] Un panel lateral "?" que explica el propósito del módulo actual
- [ ] Tour guiado opcional en el primer uso del sistema

**Estimación:** 10 puntos  
**Prioridad:** Media  
**Estado:** Pendiente (propuesta de mejora M1)

---

## Velocidad del Equipo y Resumen de Sprints

| Sprint | Historias completadas | Puntos totales | Duración |
|--------|----------------------|----------------|----------|
| Sprint 1 — Infraestructura | HU-01, HU-02, setup técnico | 20 pts | 2 semanas |
| Sprint 2 — Módulos principales | HU-03, HU-04, HU-05, HU-06, HU-07, HU-08 | 45 pts | 3 semanas |
| Sprint 3 — Accesibilidad y calidad | HU-09, HU-10 + mejoras UX | 25 pts | 2 semanas |
| **Total implementado** | **10 historias** | **90 pts** | **7 semanas** |
| Backlog pendiente | HU-11, HU-12 | 18 pts | — |
