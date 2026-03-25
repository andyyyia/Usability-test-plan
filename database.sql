-- Script de Base de Datos para Gestor de Pruebas de Usabilidad
-- Para ejecutar en XAMPP (phpMyAdmin)

CREATE DATABASE IF NOT EXISTS `usability_tests` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `usability_tests`;

-- 1. Tabla de Proyectos (Agrupa todo)
CREATE TABLE IF NOT EXISTS `proyectos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Tabla de Planes de Prueba (1 a 1 con Proyecto)
CREATE TABLE IF NOT EXISTS `planes_prueba` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `proyecto_id` INT NOT NULL,
  `producto` VARCHAR(255),
  `pantalla` VARCHAR(255),
  `objetivo` TEXT,
  `perfil` VARCHAR(255),
  `metodo` VARCHAR(100),
  `fecha` DATE,
  `lugar` VARCHAR(255),
  `duracion` VARCHAR(100),
  `moderador` VARCHAR(255),
  `observador` VARCHAR(255),
  `herramienta` VARCHAR(255),
  `enlace` VARCHAR(500),
  `notas` TEXT,
  FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabla de Tareas del Plan (1 Proyecto tiene muchas Tareas en el plan)
CREATE TABLE IF NOT EXISTS `tareas_plan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `proyecto_id` INT NOT NULL,
  `identificador` VARCHAR(10) NOT NULL, -- Ej: T1, T2
  `escenario` TEXT,
  `resultado_esperado` TEXT,
  `metrica_principal` VARCHAR(255),
  `criterio_exito` TEXT,
  FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3.5. Tabla de Tareas del Guion (Speech para la sesión)
CREATE TABLE IF NOT EXISTS `tareas_guion` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `proyecto_id` INT NOT NULL,
  `identificador` VARCHAR(10) NOT NULL, -- Ej: T1, T2
  `texto` TEXT,
  `pregunta` TEXT,
  `exito_esperado` TEXT,
  FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabla de Observaciones (1 Proyecto tiene muchas observaciones de participantes en tareas)
CREATE TABLE IF NOT EXISTS `observaciones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `proyecto_id` INT NOT NULL,
  `participante` VARCHAR(255),
  `perfil` VARCHAR(255),
  `tarea_id` VARCHAR(10),
  `exito` VARCHAR(100),
  `tiempo` VARCHAR(50),
  `errores` VARCHAR(50),
  `comentarios` TEXT,
  `problema` TEXT,
  `severidad` VARCHAR(50) DEFAULT 'Baja',
  `mejora` TEXT,
  FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla de Hallazgos y Problemas (1 Proyecto tiene muchos hallazgos)
CREATE TABLE IF NOT EXISTS `hallazgos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `proyecto_id` INT NOT NULL,
  `problema` TEXT NOT NULL,
  `evidencia` TEXT,
  `frecuencia` VARCHAR(50), 
  `severidad` VARCHAR(50) DEFAULT 'Media',
  `recomendacion` TEXT,
  `prioridad` VARCHAR(50),
  `estado` VARCHAR(50),
  FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Datos de prueba iniciales (Contexto: Auditoría del propio Dashboard de Pruebas UX)
INSERT INTO `proyectos` (`nombre`, `descripcion`) VALUES ('Auditoría interna: Usability Test Dashboard', 'Pruebas de usabilidad y accesibilidad ejecutadas sobre el propio dashboard y formularios.');
SET @last_project_id = LAST_INSERT_ID();

INSERT INTO `planes_prueba` (`proyecto_id`, `producto`, `pantalla`, `objetivo`, `perfil`, `metodo`, `fecha`, `lugar`, `duracion`, `moderador`, `observador`) 
VALUES (@last_project_id, 'Usability Test Plan Dashboard', 'Dashboard y Componentes Forms', 'Identificar cuellos de botella por falta de validaciones en formularios y violaciones de accesibilidad (WCAG).', 'Usuarios Básicos', 'Remoto', '2026-03-22', 'Google Meet', '40 min', 'UX Lead', 'Stakeholders');

INSERT INTO `tareas_plan` (`proyecto_id`, `identificador`, `escenario`, `metrica_principal`) VALUES 
(@last_project_id, 'T1', 'Crear proyecto y guardar observaciones con todos los campos vacíos', 'Errores de Integridad / Validación'),
(@last_project_id, 'T2', 'Interpretar y navegar los Gráficos de Estadísticas usando Lector de Pantalla', 'Estándares Inclusivos (SVG)'),
(@last_project_id, 'T3', 'Auditar Menú Estructural, Selectores y Tablas de Observaciones', 'Semántica DOM (WCAG)'),
(@last_project_id, 'T4', 'Lectura distante de Botones de Interfaz (Ej: Nuevo Proyecto) y Footer', 'Ratio Contraste Visual');

INSERT INTO `tareas_guion` (`proyecto_id`, `identificador`, `texto`, `pregunta`, `exito_esperado`) VALUES 
(@last_project_id, 'T1', 'Crea un hallazgo o proyecto y pulsa guardar sin escribir una sola letra.', '¿El sistema te detuvo y avisó del error?', 'Front-end frena el guardado con un Alert / Back-end devuelve Error 400.'),
(@last_project_id, 'T2', 'Activa tu Screen Reader (Lector de Pantalla) y examina los Pie Charts de barras.', '¿El lector detectó los gráficos visuales puros?', 'El lector no debe atascarse anunciando "Unlabelled Graphics" de Recharts.'),
(@last_project_id, 'T3', 'Verifica el <aside> del Menú Lateral y la Tabla principal de hallazgos en código.', '¿El auditor reporta violaciones en relaciones ID/Label o Tablas?', 'La tabla requiere Caption y el Selector debe tener ID para ser admitidos.'),
(@last_project_id, 'T4', 'Evalúa el área principal buscando fondos oscuros con letras tenues.', '¿Tuviste que forzar la vista para leer los títulos?', 'El botón y footer deben aprobar holgadamente la ratio 7:1 de Stark.');

-- Observaciones
INSERT INTO `observaciones` (`proyecto_id`, `participante`, `perfil`, `tarea_id`, `exito`, `tiempo`, `errores`, `comentarios`, `problema`, `severidad`, `mejora`) VALUES 
-- Jhon Jiron
(@last_project_id, 'Jhon Jiron', 'Usuario Básico', 'T1', 'No', '2.5', '1', 'El sistema le dejó guardar el registro completamente vacío.', 'Sistema permite guardar data en blanco', 'Alta', 'Añadir validaciones Javascript'),
(@last_project_id, 'Jhon Jiron', 'Usuario Básico', 'T2', 'No', '3.0', '1', 'Screen Reader dijo "Unlabelled Graphic" múltiples veces en SVG Recharts.', 'SVGs vacíos generados', 'Media', 'Inyectar aria-hidden="true"'),
(@last_project_id, 'Jhon Jiron', 'Usuario Básico', 'T3', 'Con ayuda', '1.0', '1', 'A nivel de código la tabla fallaba en Stark.', 'Tabla sin Description/Caption', 'Media', 'Añadir <caption> oculto'),
(@last_project_id, 'Jhon Jiron', 'Usuario Básico', 'T4', 'Sí', '1.5', '0', 'Notó que el azul del botón era claro sobre oscuro.', 'Contraste bajo en botón', 'Baja', 'Ajustar color a text-white'),

-- Jessica Jiron
(@last_project_id, 'Jessica Jiron', 'Usuario Básico', 'T1', 'No', '1.5', '2', 'Pulsó doble "Guardar" y metió dos tareas vacías.', 'Ausencia de front-end validation', 'Alta', 'Colocar if(!campo) alerts'),
(@last_project_id, 'Jessica Jiron', 'Usuario Básico', 'T2', 'Con ayuda', '2.0', '1', 'Auditor Stark marcó error 1.1.1 Non-text Content.', 'SVG no es interpretado', 'Alta', 'Engañar DOM a favor de Accesibilidad'),
(@last_project_id, 'Jessica Jiron', 'Usuario Básico', 'T3', 'No', '2.5', '1', 'Stark dictó que falta vinculación For y Roles en panel.', 'Estructura semántica rota', 'Media', 'Añadir atributos Semánticos WCAG'),
(@last_project_id, 'Jessica Jiron', 'Usuario Básico', 'T4', 'Sí', '1.2', '0', 'Texto de footer visible pero gris miniatura tenue.', 'Footer falla WCAG ratio', 'Baja', 'Oscurecer gray-500 a gray-700'),

-- Anahí Silva
(@last_project_id, 'Anahí Silva', 'Usuario Básico', 'T1', 'No', '1.0', '1', 'Ingresó un plan de prueba con strings vacíos (null).', 'Backend no rechaza blancos', 'Alta', 'Parchar Endpoint Server 400'),
(@last_project_id, 'Anahí Silva', 'Usuario Básico', 'T2', 'No', '1.8', '1', 'Warnings en consola por SVGs sin alt.', 'Accesibilidad SVG defectuosa', 'Media', 'SetTimeout DOM en Dashboard'),
(@last_project_id, 'Anahí Silva', 'Usuario Básico', 'T3', 'Con ayuda', '2.0', '1', 'Stark Bypass Blocks: Identificó "More than 1 Header".', 'Headings duplicados genéricos', 'Baja', 'Cambiar <header> anidado por <div>'),
(@last_project_id, 'Anahí Silva', 'Usuario Básico', 'T4', 'Sí', '2.0', '0', 'Sin problemas leyendo títulos mayores.', 'Ninguno', 'Baja', 'N/A'),

-- Blanca Martinez
(@last_project_id, 'Blanca Martinez', 'Usuario Básico', 'T1', 'No', '0.8', '1', 'Logs con blancos que crashearon DB al listar historial.', 'Peligro integridad UX/Backend', 'Alta', 'Frenar todo insert vacío validando UI'),
(@last_project_id, 'Blanca Martinez', 'Usuario Básico', 'T2', 'Sí', '1.0', '0', 'Se centró en las métricas numéricas saltando visuales.', 'Ninguno', 'Baja', 'N/A'),
(@last_project_id, 'Blanca Martinez', 'Usuario Básico', 'T3', 'Con ayuda', '2.5', '1', 'Stark falló the aside doesnt have aria-label.', 'Aside huérfano semánticamente', 'Media', 'Añadir aria-label="Menú" a Aside'),
(@last_project_id, 'Blanca Martinez', 'Usuario Básico', 'T4', 'Con ayuda', '1.5', '1', 'El <select> carecía de etiqueta en árbol de Accesibilidad.', 'Select input sin ID', 'Alta', 'Vincular Label/Select con HTMLFor');

INSERT INTO `hallazgos` (`proyecto_id`, `problema`, `evidencia`, `frecuencia`, `severidad`, `recomendacion`, `prioridad`, `estado`) VALUES 
(@last_project_id, 'Formularios no validan ausencia de texto crasheando UX/Backend', '[CORREGIDO] -> ANTES: Totalidad de usuarios enviaban modelos vacíos sin freno alguno. DESPUÉS: Adición de alert() dinámicos exigiendo completitud e intercepción HTTP Status 400 desde Server-Side.', 'Frecuente', 'Alta', 'Mantenimiento de doble capa de seguridad lógica', 'Alta', 'Resuelto y Mitigado'),
(@last_project_id, 'Múltiples Gráficas SVG sin Título disparan Violaciones 1.1.1', '[CORREGIDO] -> ANTES: Lector atascaba navegación repitiendo Unlabelled Graphic incomprensiblemente (Recharts). DESPUÉS: Ejecución hook react useEffect para aplicar aria-hidden global resolvió 100% de alertas Stark.', 'Ocasional', 'Media', 'Generalizar lógica a futuras migraciones de gráficas D3 o Canvas', 'Alta', 'Resuelto y Mitigado'),
(@last_project_id, 'Contraste deficiente AAA en Textos Claros y Botón Principal (1.4.6)', '[CORREGIDO] -> ANTES: Jhon/Jessica reportaron footer borroso y CTA pálido. DESPUÉS: Sustitución Tailwind de text-gray-500 a gray-700 y text-white. Se alcanzó Ratio AAA.', 'Frecuente', 'Baja', 'Auditar UI con simulador Daltonismo y Stark', 'Media', 'Resuelto y Mitigado'),
(@last_project_id, 'Nodos semánticos Table/Aside/Select rompen Árbol de Accesibilidad', '[CORREGIDO] -> ANTES: Stark arrojaba 5 faltas críticas de Bypass y Captioning en Dashboard y Sidebar. DESPUÉS: Añadidos label htmlFor, <caption> sr-only y limitados los headers. Aprobación limpia.', 'Ocasional', 'Media', 'Integrar Linter a11y pre-commit o en GitHub Actions.', 'Media', 'Resuelto y Mitigado'),
(@last_project_id, 'Posicionamiento Absoluto o Sticky bloqueando foco por teclado', 'Usuarios navegando en tabulaciones podrían no ver el rastro Focus bajo la barra Sidebar.', 'Poco Frecuente', 'Alta', 'Revisar z-index y focus-visible estricto en CSS principal.', 'Media', 'Pendiente de Revisión');
