# Evaluación Heurística — Usability Test Plan Dashboard

**Fecha de evaluación:** Junio 2026  
**Sistema evaluado:** Usability Test Plan Dashboard v1.0  
**Evaluadores:** 3 expertos en IHC  
**Metodología:** Inspección heurística según Nielsen (1994)

---

## Escala de Severidad

| Nivel | Descripción |
|-------|-------------|
| 0 | No es un problema de usabilidad |
| 1 | Problema cosmético — corregir solo si hay tiempo |
| 2 | Problema menor — baja prioridad de corrección |
| 3 | Problema mayor — importante corregir |
| 4 | Catástrofe de usabilidad — obligatorio corregir antes del lanzamiento |

---

## Tabla Completa de Hallazgos

| ID | Heurística | Módulo | Descripción del problema | Severidad | Propuesta de mejora |
|----|-----------|--------|--------------------------|-----------|---------------------|
| H01 | H1: Visibilidad del estado | Observaciones | No hay indicador de progreso durante carga de datos (solo spinner genérico, sin estructura skeleton) | 3 | Implementar skeleton loaders específicos que reflejen la estructura de la tabla |
| H02 | H3: Control y libertad | Plan de Prueba | El modal de "descartar cambios" no muestra un preview de qué datos se perderán | 2 | Mostrar lista de campos modificados antes de confirmar descarte |
| H03 | H4: Consistencia | Hallazgos / Observaciones | Los badges de severidad usan íconos distintos en Observaciones vs Hallazgos para el mismo nivel de severidad | 2 | Crear componente `<SeverityBadge>` compartido con ícono y color consistentes |
| H04 | H6: Reconocimiento | Tareas y Guión | Los identificadores de tarea (T1, T2, T3) no indican visualmente que son auto-generados e inmutables | 1 | Añadir tooltip al pasar sobre el ID: "Identificador automático" |
| H05 | H7: Flexibilidad | Dashboard | No existe opción de exportar métricas o gráficas para compartir resultados | 3 | Añadir botón "Exportar" con opciones CSV (datos) y PNG (gráficas) |
| H06 | H8: Diseño minimalista | Observaciones | Las filas con contenido expandible no muestran ningún indicador de que tienen más información oculta | 2 | Añadir chevron animado al final de cada fila expandible |
| H07 | H9: Recuperación de errores | Plan de Prueba | Al guardar con errores de validación, el toast indica error pero no hace scroll al campo problemático | 2 | Scroll automático + foco al primer campo inválido tras intento de guardado |
| H08 | H10: Ayuda y documentación | Global | No existe panel de ayuda, tooltips de orientación ni documentación in-app | 3 | Implementar tooltips en campos complejos + panel lateral de ayuda contextual |
| H09 | H1: Visibilidad del estado | Dashboard | El Dashboard muestra estado vacío sin explicar por qué ni cómo llenarlo | 3 | Estado vacío con ilustración + instrucción: "Registra observaciones para ver métricas" |
| H10 | H2: Mundo real | Hallazgos | El campo "Frecuencia" requiere formato X/Y pero el placeholder no lo indica claramente | 2 | Cambiar placeholder a "ej. 3/5" y añadir ícono de información con tooltip |
| H11 | H3: Control y libertad | Observaciones | No hay opción de "deshacer" el borrado de una fila de observación | 3 | Añadir confirmación de borrado + posibilidad de deshacer por 5 segundos |
| H12 | H4: Consistencia | Global | El botón de "Editar" aparece con ícono de lápiz en algunos módulos y sin ícono en otros | 1 | Estandarizar todos los botones de edición con ícono + texto |
| H13 | H5: Prevención de errores | Plan de Prueba | No hay validación del campo "Enlace/URL" — acepta texto no válido como URL | 2 | Validar formato URL al salir del campo (onBlur) |
| H14 | H6: Reconocimiento | Observaciones | El dropdown de "Éxito" (Sí/Con ayuda/No) no tiene valores por defecto, puede olvidarse de llenar | 2 | Establecer valor por defecto "Sí" y marcar visualmente cuando está en estado neutro |
| H15 | H7: Flexibilidad | Tareas y Guión | No hay forma de reordenar las tareas una vez creadas (sin drag-and-drop funcional) | 2 | Activar drag-and-drop para reordenamiento (el paquete react-dnd ya está instalado) |
| H16 | H8: Diseño minimalista | Plan de Prueba | El formulario de "Contexto General" muestra todos los campos simultáneamente, puede ser abrumador | 1 | Considerar layout progresivo o grouping visual más claro de campos relacionados |
| H17 | H1: Visibilidad | Global | El Stepper no indica claramente cuáles pasos tienen datos guardados vs. cuáles están vacíos | 2 | Añadir check mark verde en pasos completados, punto amarillo en pasos con datos parciales |
| H18 | H4: Consistencia | Global | El modo oscuro no está disponible en la página de login/selección de proyecto | 1 | Extender el hook useDarkMode a la página de selección de proyecto |

---

## Resumen por Heurística

| Heurística | Hallazgos | Severidad máx. |
|-----------|-----------|----------------|
| H1: Visibilidad del estado | H01, H09, H17 | 3 |
| H2: Mundo real | H10 | 2 |
| H3: Control y libertad | H02, H11 | 3 |
| H4: Consistencia | H03, H12, H18 | 2 |
| H5: Prevención de errores | H13 | 2 |
| H6: Reconocimiento | H04, H14 | 2 |
| H7: Flexibilidad | H05, H15 | 3 |
| H8: Diseño minimalista | H06, H16 | 2 |
| H9: Recuperación de errores | H07 | 2 |
| H10: Ayuda y documentación | H08 | 3 |

---

## Distribución de Severidades

| Severidad | Cantidad | % |
|-----------|----------|---|
| 4 — Catástrofe | 0 | 0% |
| 3 — Mayor | 6 | 33% |
| 2 — Menor | 10 | 56% |
| 1 — Cosmético | 2 | 11% |
| **Total** | **18** | **100%** |

---

## Fortalezas Identificadas

Las siguientes heurísticas están bien implementadas en el sistema:

- **H1 Visibilidad (parcial):** El Stepper de 5 pasos y los toasts de éxito/error informan bien al usuario en la mayoría de interacciones.
- **H4 Consistencia:** El sistema de diseño con tokens CSS garantiza paleta de colores y tipografía consistentes entre los 5 módulos.
- **H5 Prevención de errores:** Validación numérica robusta (tiempo 0-36000s, errores 0-100), advertencia de cambios no guardados al navegar.
- **H3 Control (parcial):** Modal de confirmación antes de descartar cambios. Botones de cancelar presentes en todos los formularios.
- **H8 Diseño minimalista:** Layout limpio, uso de espacio en blanco, jerarquía visual clara con tipografía Syne + DM Sans.

---

## Plan de Remediación Priorizado

### Sprint 4 — Correcciones de Severidad 3 (estimado: 3 semanas)

| Tarea | Hallazgo | Estimación |
|-------|---------|-----------|
| Skeleton loaders en Observaciones y Hallazgos | H01 | 6h |
| Estado vacío del Dashboard con call-to-action | H09 | 4h |
| Confirmación + undo al borrar observación | H11 | 6h |
| Exportación CSV y PNG en Dashboard | H05 | 10h |
| Panel de ayuda contextual | H08 | 12h |

### Sprint 5 — Correcciones de Severidad 2 (estimado: 2 semanas)

| Tarea | Hallazgo | Estimación |
|-------|---------|-----------|
| Componente SeverityBadge unificado | H03 | 4h |
| Scroll automático a campos con error | H07 | 3h |
| Validación de URL en campo Enlace | H13 | 2h |
| Chevron en filas expandibles | H06 | 2h |
| Placeholder mejorado en campo Frecuencia | H10 | 1h |
| Stepper con estados visuales (check/partial) | H17 | 5h |
| Drag-and-drop para tareas en guión | H15 | 8h |

---

*Evaluación realizada conforme al protocolo de Nielsen (1994). Cada evaluador inspeccionó el sistema de forma independiente antes de la sesión de consolidación.*
