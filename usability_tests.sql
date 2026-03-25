-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 25-03-2026 a las 16:53:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `usability_tests`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hallazgos`
--

CREATE TABLE `hallazgos` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `problema` text NOT NULL,
  `evidencia` text DEFAULT NULL,
  `frecuencia` varchar(50) DEFAULT NULL,
  `severidad` varchar(50) DEFAULT 'Media',
  `recomendacion` text DEFAULT NULL,
  `prioridad` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `hallazgos`
--

INSERT INTO `hallazgos` (`id`, `proyecto_id`, `problema`, `evidencia`, `frecuencia`, `severidad`, `recomendacion`, `prioridad`, `estado`) VALUES
(6, 1, 'Formularios no validan ausencia de texto crasheando UX/Backend', '[CORREGIDO] -> ANTES: Totalidad de usuarios enviaban modelos vacíos sin freno alguno. DESPUÉS: Adición de alert() dinámicos exigiendo completitud e intercepción HTTP Status 400 desde Server-Side.', 'Frecuente', 'Alta', 'Mantenimiento de doble capa de seguridad lógica', 'Alta', 'Pendiente'),
(7, 1, 'Múltiples Gráficas SVG sin Título disparan Violaciones 1.1.1', '[CORREGIDO] -> ANTES: Lector atascaba navegación repitiendo Unlabelled Graphic incomprensiblemente (Recharts). DESPUÉS: Ejecución hook react useEffect para aplicar aria-hidden global resolvió 100% de alertas Stark.', 'Ocasional', 'Media', 'Generalizar lógica a futuras migraciones de gráficas D3 o Canvas', 'Alta', 'Pendiente'),
(8, 1, 'Contraste deficiente AAA en Textos Claros y Botón Principal (1.4.6)', '[CORREGIDO] -> ANTES: Jhon/Jessica reportaron footer borroso y CTA pálido. DESPUÉS: Sustitución Tailwind de text-gray-500 a gray-700 y text-white. Se alcanzó Ratio AAA.', 'Frecuente', 'Baja', 'Auditar UI con simulador Daltonismo y Stark', 'Media', 'Pendiente'),
(9, 1, 'Nodos semánticos Table/Aside/Select rompen Árbol de Accesibilidad', '[CORREGIDO] -> ANTES: Stark arrojaba 5 faltas críticas de Bypass y Captioning en Dashboard y Sidebar. DESPUÉS: Añadidos label htmlFor, <caption> sr-only y limitados los headers. Aprobación limpia.', 'Ocasional', 'Media', 'Integrar Linter a11y pre-commit o en GitHub Actions.', 'Media', 'Pendiente'),
(10, 1, 'Posicionamiento Absoluto o Sticky bloqueando foco por teclado', 'Usuarios navegando en tabulaciones podrían no ver el rastro Focus bajo la barra Sidebar.', 'Poco Frecuente', 'Alta', 'Revisar z-index y focus-visible estricto en CSS principal.', 'Media', 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observaciones`
--

CREATE TABLE `observaciones` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `participante` varchar(255) DEFAULT NULL,
  `perfil` varchar(255) DEFAULT NULL,
  `tarea_id` varchar(10) DEFAULT NULL,
  `exito` varchar(100) DEFAULT NULL,
  `tiempo` varchar(50) DEFAULT NULL,
  `errores` varchar(50) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `problema` text DEFAULT NULL,
  `severidad` varchar(50) DEFAULT 'Baja',
  `mejora` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `observaciones`
--

INSERT INTO `observaciones` (`id`, `proyecto_id`, `participante`, `perfil`, `tarea_id`, `exito`, `tiempo`, `errores`, `comentarios`, `problema`, `severidad`, `mejora`) VALUES
(1, 1, 'Jhon Jiron', 'Usuario Básico', 'T1', 'No', '2.5', '1', 'El sistema le dejó guardar el registro completamente vacío.', 'Sistema permite guardar data en blanco', 'Alta', 'Añadir validaciones Javascript'),
(2, 1, 'Jhon Jiron', 'Usuario Básico', 'T2', 'No', '3.0', '1', 'Screen Reader dijo \"Unlabelled Graphic\" múltiples veces en SVG Recharts.', 'SVGs vacíos generados', 'Media', 'Inyectar aria-hidden=\"true\"'),
(3, 1, 'Jhon Jiron', 'Usuario Básico', 'T3', 'Con ayuda', '1.0', '1', 'A nivel de código la tabla fallaba en Stark.', 'Tabla sin Description/Caption', 'Media', 'Añadir <caption> oculto'),
(4, 1, 'Jhon Jiron', 'Usuario Básico', 'T4', 'Sí', '1.5', '0', 'Notó que el azul del botón era claro sobre oscuro.', 'Contraste bajo en botón', 'Baja', 'Ajustar color a text-white'),
(5, 1, 'Jessica Jiron', 'Usuario Básico', 'T1', 'No', '1.5', '2', 'Pulsó doble \"Guardar\" y metió dos tareas vacías.', 'Ausencia de front-end validation', 'Alta', 'Colocar if(!campo) alerts'),
(6, 1, 'Jessica Jiron', 'Usuario Básico', 'T2', 'Con ayuda', '2.0', '1', 'Auditor Stark marcó error 1.1.1 Non-text Content.', 'SVG no es interpretado', 'Alta', 'Engañar DOM a favor de Accesibilidad'),
(7, 1, 'Jessica Jiron', 'Usuario Básico', 'T3', 'No', '2.5', '1', 'Stark dictó que falta vinculación For y Roles en panel.', 'Estructura semántica rota', 'Media', 'Añadir atributos Semánticos WCAG'),
(8, 1, 'Jessica Jiron', 'Usuario Básico', 'T4', 'Sí', '1.2', '0', 'Texto de footer visible pero gris miniatura tenue.', 'Footer falla WCAG ratio', 'Baja', 'Oscurecer gray-500 a gray-700'),
(9, 1, 'Anahí Silva', 'Usuario Básico', 'T1', 'No', '1.0', '1', 'Ingresó un plan de prueba con strings vacíos (null).', 'Backend no rechaza blancos', 'Alta', 'Parchar Endpoint Server 400'),
(10, 1, 'Anahí Silva', 'Usuario Básico', 'T2', 'No', '1.8', '1', 'Warnings en consola por SVGs sin alt.', 'Accesibilidad SVG defectuosa', 'Media', 'SetTimeout DOM en Dashboard'),
(11, 1, 'Anahí Silva', 'Usuario Básico', 'T3', 'Con ayuda', '2.0', '1', 'Stark Bypass Blocks: Identificó \"More than 1 Header\".', 'Headings duplicados genéricos', 'Baja', 'Cambiar <header> anidado por <div>'),
(12, 1, 'Anahí Silva', 'Usuario Básico', 'T4', 'Sí', '2.0', '0', 'Sin problemas leyendo títulos mayores.', 'Ninguno', 'Baja', 'N/A'),
(13, 1, 'Blanca Martinez', 'Usuario Básico', 'T1', 'No', '0.8', '1', 'Logs con blancos que crashearon DB al listar historial.', 'Peligro integridad UX/Backend', 'Alta', 'Frenar todo insert vacío validando UI'),
(14, 1, 'Blanca Martinez', 'Usuario Básico', 'T2', 'Sí', '1.0', '0', 'Se centró en las métricas numéricas saltando visuales.', 'Ninguno', 'Baja', 'N/A'),
(15, 1, 'Blanca Martinez', 'Usuario Básico', 'T3', 'Con ayuda', '2.5', '1', 'Stark falló the aside doesnt have aria-label.', 'Aside huérfano semánticamente', 'Media', 'Añadir aria-label=\"Menú\" a Aside'),
(16, 1, 'Blanca Martinez', 'Usuario Básico', 'T4', 'Con ayuda', '1.5', '1', 'El <select> carecía de etiqueta en árbol de Accesibilidad.', 'Select input sin ID', 'Alta', 'Vincular Label/Select con HTMLFor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planes_prueba`
--

CREATE TABLE `planes_prueba` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `producto` varchar(255) DEFAULT NULL,
  `pantalla` varchar(255) DEFAULT NULL,
  `objetivo` text DEFAULT NULL,
  `perfil` varchar(255) DEFAULT NULL,
  `metodo` varchar(100) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `lugar` varchar(255) DEFAULT NULL,
  `duracion` varchar(100) DEFAULT NULL,
  `moderador` varchar(255) DEFAULT NULL,
  `observador` varchar(255) DEFAULT NULL,
  `herramienta` varchar(255) DEFAULT NULL,
  `enlace` varchar(500) DEFAULT NULL,
  `notas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `planes_prueba`
--

INSERT INTO `planes_prueba` (`id`, `proyecto_id`, `producto`, `pantalla`, `objetivo`, `perfil`, `metodo`, `fecha`, `lugar`, `duracion`, `moderador`, `observador`, `herramienta`, `enlace`, `notas`) VALUES
(1, 1, 'Usability Test Plan Dashboard', 'Dashboard y Componentes Forms', 'Identificar cuellos de botella por falta de validaciones en formularios y violaciones de accesibilidad (WCAG).', 'Usuarios Básicos', 'remoto', '2026-03-22', 'Google Meet', '40 min', 'UX Lead', 'Stakeholders', 'Dashboard creado', 'https://github.com/andyyyia/Usability-test-plan', 'Que el usuario no debe intervenir , para que los tests sean lo más parciales posibles							\n							\n							\n							\n							');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyectos`
--

CREATE TABLE `proyectos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyectos`
--

INSERT INTO `proyectos` (`id`, `nombre`, `descripcion`, `fecha_creacion`) VALUES
(1, 'Auditoría interna: Usability Test Dashboard', 'Pruebas de usabilidad y accesibilidad ejecutadas sobre el propio dashboard y formularios.', '2026-03-25 07:20:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas_guion`
--

CREATE TABLE `tareas_guion` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `identificador` varchar(10) NOT NULL,
  `texto` text DEFAULT NULL,
  `pregunta` text DEFAULT NULL,
  `exito_esperado` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tareas_guion`
--

INSERT INTO `tareas_guion` (`id`, `proyecto_id`, `identificador`, `texto`, `pregunta`, `exito_esperado`) VALUES
(5, 1, 'T1', 'Crea un hallazgo o proyecto y pulsa guardar sin escribir una sola letra.', '¿El sistema te detuvo y avisó del error?', 'Front-end frena el guardado con un Alert / Back-end devuelve Error 400.'),
(6, 1, 'T2', 'Activa tu Screen Reader (Lector de Pantalla) y examina los Pie Charts de barras.', '¿El lector detectó los gráficos visuales puros?', 'El lector no debe atascarse anunciando \"Unlabelled Graphics\" de Recharts.'),
(7, 1, 'T3', 'Verifica el <aside> del Menú Lateral y la Tabla principal de hallazgos en código.', '¿El auditor reporta violaciones en relaciones ID/Label o Tablas?', 'La tabla requiere Caption y el Selector debe tener ID para ser admitidos.'),
(8, 1, 'T4', 'Evalúa el área principal buscando fondos oscuros con letras tenues.', '¿Tuviste que forzar la vista para leer los títulos?', 'El botón y footer deben aprobar holgadamente la ratio 7:1 de Stark.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas_plan`
--

CREATE TABLE `tareas_plan` (
  `id` int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `identificador` varchar(10) NOT NULL,
  `escenario` text DEFAULT NULL,
  `resultado_esperado` text DEFAULT NULL,
  `metrica_principal` varchar(255) DEFAULT NULL,
  `criterio_exito` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tareas_plan`
--

INSERT INTO `tareas_plan` (`id`, `proyecto_id`, `identificador`, `escenario`, `resultado_esperado`, `metrica_principal`, `criterio_exito`) VALUES
(29, 1, 'T1', 'Crear proyecto y guardar observaciones con todos los campos vacíos', 'Que el usuario cree y guarde un proyecto	', 'Errores de Integridad / Validación', 'Éxito + Tiempo	'),
(30, 1, 'T2', 'Interpretar y navegar los Gráficos de Estadísticas usando Lector de Pantalla', 'Que el usuario reconozco los graficos de navegacion	', 'Estándares Inclusivos (SVG)', 'Éxito'),
(31, 1, 'T3', 'Auditar Menú Estructural, Selectores y Tablas de Observaciones', 'Que el puntaje sea lo mas alto posible	', 'Semántica DOM (WCAG)', 'Alto puntaje 	'),
(32, 1, 'T4', 'Lectura distante de Botones de Interfaz (Ej: Nuevo Proyecto) y Footer', 'Que los elementos esten bien ubicados 	', 'Ratio Contraste Visual', 'Alto puntaje 	');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `hallazgos`
--
ALTER TABLE `hallazgos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `observaciones`
--
ALTER TABLE `observaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `planes_prueba`
--
ALTER TABLE `planes_prueba`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tareas_guion`
--
ALTER TABLE `tareas_guion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- Indices de la tabla `tareas_plan`
--
ALTER TABLE `tareas_plan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proyecto_id` (`proyecto_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `hallazgos`
--
ALTER TABLE `hallazgos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `observaciones`
--
ALTER TABLE `observaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `planes_prueba`
--
ALTER TABLE `planes_prueba`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `proyectos`
--
ALTER TABLE `proyectos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tareas_guion`
--
ALTER TABLE `tareas_guion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `tareas_plan`
--
ALTER TABLE `tareas_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `hallazgos`
--
ALTER TABLE `hallazgos`
  ADD CONSTRAINT `hallazgos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `observaciones`
--
ALTER TABLE `observaciones`
  ADD CONSTRAINT `observaciones_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `planes_prueba`
--
ALTER TABLE `planes_prueba`
  ADD CONSTRAINT `planes_prueba_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tareas_guion`
--
ALTER TABLE `tareas_guion`
  ADD CONSTRAINT `tareas_guion_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tareas_plan`
--
ALTER TABLE `tareas_plan`
  ADD CONSTRAINT `tareas_plan_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
