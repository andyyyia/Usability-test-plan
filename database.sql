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

-- Datos de prueba iniciales (Opcional)
INSERT INTO `proyectos` (`nombre`, `descripcion`) VALUES ('Prueba Sistema E-commerce', 'Test de usabilidad básico del flujo de checkout');
SET @last_project_id = LAST_INSERT_ID();

INSERT INTO `planes_prueba` (`proyecto_id`, `producto`, `pantalla`, `objetivo`, `perfil`, `metodo`, `fecha`) 
VALUES (@last_project_id, 'Tienda Demo', 'Checkout', 'Comprobar facilidad de pago', 'Usuarios 20-35 años', 'remoto', '2025-05-10');

INSERT INTO `tareas_plan` (`proyecto_id`, `identificador`, `escenario`, `metrica_principal`) VALUES 
(@last_project_id, 'T1', 'Agregar producto al carrito', 'Tiempo'),
(@last_project_id, 'T2', 'Completar pago con tarjeta ficticia', 'Éxito/Fracaso');

INSERT INTO `tareas_guion` (`proyecto_id`, `identificador`, `texto`, `pregunta`, `exito_esperado`) VALUES 
(@last_project_id, 'T1', 'Abre la tienda y agrega unos audífonos al carrito', '¿Fue fácil encontrar el botón de agregar?', 'El usuario hace clic sin demorar'),
(@last_project_id, 'T2', 'Procede a pagar tu carrito', '¿Qué opinas del formulario de pago?', 'Llena los datos sin errores');
