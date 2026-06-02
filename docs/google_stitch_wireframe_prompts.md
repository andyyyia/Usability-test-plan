# Prompts para Google Stitch — Wireframes del Módulo "Plan de Prueba"

> Usa estos prompts en [Google Stitch](https://stitch.withgoogle.com/) para generar wireframes de los tres niveles de fidelidad del módulo **Plan de Prueba** del sistema Usability Test Plan Dashboard.
> 
> Después de generar cada wireframe, exporta como imagen PNG y úsala en el informe técnico y la presentación en los placeholders correspondientes.

---

## NIVEL 1 — Baja Fidelidad (Low-Fidelity Wireframe)

**Objetivo:** Estructura informacional básica, sin estilos. Solo cajas, líneas y texto de marcador.

### Prompt 1A — Vista general del módulo Plan de Prueba

```
Create a low-fidelity wireframe for a web application module called "Plan de Prueba" (Test Plan). 

The layout should be:
- A top navigation bar with a breadcrumb showing: "Proyectos > [Project Name] > Plan de Prueba"
- A progress stepper below the nav with 5 steps labeled: "Plan", "Tareas", "Observaciones", "Hallazgos", "Listo" — step 1 is active
- A main content area with 4 collapsible sections, each as a simple box with a title and "expand/collapse" arrow:
  Section 1: "Contexto General" — contains a 2-column form grid with 8 labeled input boxes
  Section 2: "Tareas del Test" — contains a table with columns: ID, Escenario, Resultado Esperado, Métrica, Criterio de Éxito + an "Add row" button at bottom
  Section 3: "Roles y Logística" — contains 4 labeled input boxes in 2 columns
  Section 4: "Notas del Moderador" — contains a large textarea box

- A floating action bar at the bottom with two buttons: "Cancelar" (outline) and "Guardar Plan" (filled)
- A sidebar on the left with vertical navigation items (simple rectangles)

Use only grayscale. Use placeholder boxes (gray rectangles) for all inputs. Label everything with simple text. Add annotation arrows pointing to key interaction areas. Style: classic hand-sketch wireframe look with thin borders, no shadows, no color.
```

### Prompt 1B — Estado de error en el formulario

```
Create a low-fidelity wireframe showing the error state of a "Plan de Prueba" (Test Plan) form.

Show the same layout as before (nav bar, stepper, form sections) but with:
- Section 1 "Contexto General" expanded, showing 3 input fields with red-border error indicators
- Each error field has a small text label below it: "Este campo es obligatorio"
- A toast/snackbar notification at the top right corner showing: "Error: Completa todos los campos requeridos"
- The save button is grayed out

Use only grayscale with light red (#ffcccc equivalent in gray patterns) for error states. Classic wireframe sketch style. Add annotation labels for: "Toast de error", "Campo requerido vacío", "Botón deshabilitado".
```

---

## NIVEL 2 — Media Fidelidad (Mid-Fidelity Wireframe)

**Objetivo:** Estructura real, tipografía definida, flujos de interacción, sin paleta de colores final.

### Prompt 2A — Módulo completo en modo vista (View Mode)

```
Create a mid-fidelity wireframe for a web application module "Plan de Prueba" (Test Plan) in VIEW MODE (read-only).

Design specifications:
- Clean modern layout, white background
- Left sidebar: 240px wide, dark background (#1e3a5f equivalent gray), with navigation items: Dashboard, Plan de Prueba (active), Tareas y Guión, Observaciones, Hallazgos, Guía de Diseño
- Top bar: breadcrumb navigation + dark mode toggle button + project name dropdown
- Progress stepper: horizontal, 5 steps, step 1 highlighted with a filled circle, steps 2-5 as empty circles connected by a line
- Main content: 4 Card sections with rounded corners and subtle shadow

Card 1 "Contexto General":
- 2-column grid of read-only fields (no input borders, just labels above and values below in slightly larger text)
- Fields: Producto, Pantalla/Sección, Objetivo del Test, Perfil del Usuario, Método (badge showing "Presencial"), Fecha, Lugar, Duración
- Top right: "Editar" button with pencil icon

Card 2 "Tareas del Test":
- A clean table with header row (darker background) and 3 data rows
- Columns: #, Escenario, Resultado Esperado, Métrica Principal, Criterio de Éxito
- Table has alternating row colors (white / very light gray)

Card 3 "Roles y Logística":
- 2x2 grid of read-only field pairs: Moderador, Observador, Herramienta/Prototipo, Enlace

Card 4 "Notas del Moderador":
- Large text area showing multi-line text in read-only style

Use grayscale only, clean Calibri-like font, 14-16pt body text, card shadows, proper whitespace. Include a floating "Editar Plan" primary button in bottom-right corner.
```

### Prompt 2B — Modo edición con tabla interactiva

```
Create a mid-fidelity wireframe for the "Plan de Prueba" module in EDIT MODE showing the task table interaction.

Layout: same as before (sidebar + top bar + stepper) but all fields are now editable.

Focus on Section 2 "Tareas del Test" which should be the main focal point:
- Active table with 3 rows, all cells are editable text inputs (visible borders, focus state on one cell)
- Table columns: # (auto, non-editable), Escenario (text input), Resultado Esperado (text input), Métrica Principal (dropdown select), Criterio de Éxito (text input), Actions (trash icon button)
- Row 2 has a "focus/active" state: highlighted row background, active cell has blue border
- Below the table: "+ Añadir tarea" button (text + plus icon)
- Above the table on the right: small text "Mínimo 1 tarea requerida"

Section 1 above shows a form with visible input borders and a required field indicator (*):
- Visible text inputs with placeholder text
- A Select dropdown for "Método" showing the open state with options: Presencial, Remoto, Híbrido, Guerrilla

Bottom action bar: "Cancelar" (secondary) and "Guardar Plan" (primary filled) buttons

Include interaction annotations: dashed arrows showing "Click para editar", "Dropdown abierto", "Acción de eliminar fila"

Use grayscale, clean mid-fidelity style with visible UI controls, proper typography hierarchy.
```

### Prompt 2C — Modal de confirmación al cancelar edición

```
Create a mid-fidelity wireframe showing a confirmation modal dialog overlaying the "Plan de Prueba" module.

Background: the module in edit mode (blurred/dimmed with 50% dark overlay)

Modal dialog (centered, white background, rounded corners, shadow):
- Title: "¿Descartar cambios?"
- Icon: warning triangle (simple geometric shape)
- Body text: "Tienes cambios sin guardar en el Plan de Prueba. Si continúas, perderás toda la información editada."
- Two buttons in the bottom:
  - Left: "Seguir editando" (secondary/outline button)
  - Right: "Descartar cambios" (primary destructive/red button)
- X close button in top-right of modal

The modal should be 480px wide approximately, centered on screen.

Include annotations: "Overlay oscuro", "Modal de confirmación", "Acción destructiva destacada en rojo"

Clean mid-fidelity style, grayscale except use light red for the destructive button to emphasize importance.
```

---

## NIVEL 3 — Alta Fidelidad (High-Fidelity Wireframe)

**Objetivo:** Diseño visual completo con colores reales, tipografía del sistema, modo claro y oscuro.

### Prompt 3A — Módulo Plan de Prueba — Modo Claro (Light Mode)

```
Create a high-fidelity UI mockup for the "Plan de Prueba" module of a usability testing management web app.

Color system:
- Primary: #2d5a9e (dark blue)
- Primary light: #e8eef7
- Sidebar: #1e3a5f (very dark blue)
- Background: #f8fafc (very light gray-blue)
- Card background: #ffffff
- Text primary: #1a202c
- Text secondary: #6b7280
- Border: #e2e8f0
- Success: #22c55e
- Warning: #f59e0b
- Error: #ef4444

Typography:
- Headings: Syne Bold
- Body: DM Sans Regular/Medium
- Monospace: Roboto Mono

Layout:
- Left sidebar: 240px, background #1e3a5f, white text and icons for navigation
  - Navigation items: Dashboard, Plan de Prueba (active — highlighted with #2d5a9e), Tareas y Guión, Observaciones, Hallazgos, Guía de Diseño
  - Bottom: user avatar + dark mode toggle
- Top header: white, shadow, breadcrumb "Proyectos / Mi Proyecto / Plan de Prueba", project name badge
- Content area: 5-step horizontal stepper with step 1 filled blue circle, rest gray

Card 1 "Contexto General":
- White card, 16px border radius, subtle shadow
- 2-column grid: Product input, Pantalla input (row 1); Objetivo textarea (full width, row 2); Perfil input, Método select showing "Presencial" badge (row 3); Fecha input, Lugar input, Duración input (row 4)
- Edit button (pencil icon + "Editar") in top-right, blue text

Card 2 "Tareas del Test":
- Table with #2d5a9e header background, white text
- 3 rows with light alternating gray rows
- "Añadir tarea" button below (+ icon, primary blue)

Show it in VIEW MODE (read-only, no input borders visible).

Make it pixel-perfect, clean, modern, professional. Include the Tabler Icons-style line icons.
```

### Prompt 3B — Módulo Plan de Prueba — Modo Oscuro (Dark Mode)

```
Create a high-fidelity UI mockup for the "Plan de Prueba" module in DARK MODE.

Dark mode color system:
- Sidebar: #0f1e35 (very dark navy)
- Background: #0d1117 (near black)
- Card background: #161b22 (dark card)
- Card border: #30363d
- Text primary: #e6edf3 (near white)
- Text secondary: #8b949e (muted gray)
- Primary accent: #3b82f6 (bright blue, more vivid than light mode)
- Input background: #21262d
- Input border: #30363d
- Table header: #1c2128
- Success: #3fb950
- Warning: #d29922
- Error: #f85149

Same layout as the light mode version but with dark colors:
- Sidebar in #0f1e35, navigation items in light gray, active item highlighted with #3b82f6
- Top header in #161b22 with #30363d border
- Cards in #161b22 with subtle #30363d border
- Stepper: active step in #3b82f6, inactive in #30363d

Show the same "Plan de Prueba" module in VIEW MODE with a project loaded.

Include a small "moon" icon in the top-right showing dark mode is active.

Make it look polished, modern, developer-aesthetic dark theme.
```

### Prompt 3C — Vista del Dashboard en alta fidelidad

```
Create a high-fidelity UI mockup for an analytics Dashboard of a usability testing web app.

Color system: same as 3A (light mode)

Layout:
- Left sidebar (same as 3A)
- Main content area titled "Dashboard — Mi Proyecto de Test"

4 metric cards in a row at the top:
- Card 1: "Tasa de Éxito" — large number "82%" in green (#22c55e), label below, upward arrow icon
- Card 2: "Tiempo Promedio" — "4m 32s" in blue (#2d5a9e), clock icon
- Card 3: "Total de Errores" — "23" in orange (#f59e0b), warning icon
- Card 4: "Hallazgos Críticos" — "5" in red (#ef4444), alert bell icon

Below cards, 2 charts side by side:
Left chart: Vertical bar chart "Errores por Tarea" — 5 bars labeled T1-T5 in varying heights, blue gradient bars, white background card
Right chart: Donut/pie chart "Distribución de Severidades" — 3 segments: Alta (red 28%), Media (orange 44%), Baja (green 28%), with legend on right side

Below charts: "Observaciones Recientes" table with 5 rows showing: Participante, Tarea, Éxito (badge: Sí/No/Con ayuda), Severidad badge (colored), Tiempo

Make the charts look like Recharts library output — clean, minimal, no 3D effects. Professional data visualization style.
```

---

## Instrucciones de Uso

1. **Abre Google Stitch** en tu navegador
2. **Crea un nuevo proyecto** llamado "Usability Test Plan — Wireframes"
3. **Copia y pega** cada prompt en el campo de entrada de Stitch
4. **Genera** el wireframe y **ajusta** según sea necesario con prompts de refinamiento
5. **Exporta** cada resultado como PNG en alta resolución
6. **Nombra los archivos** según la convención:
   - `wireframe_01_baja_plan_general.png`
   - `wireframe_02_baja_error_state.png`
   - `wireframe_03_media_view_mode.png`
   - `wireframe_04_media_edit_table.png`
   - `wireframe_05_media_modal.png`
   - `wireframe_06_alta_light_mode.png`
   - `wireframe_07_alta_dark_mode.png`
   - `wireframe_08_alta_dashboard.png`
7. **Coloca los archivos** en la carpeta `docs/wireframes/` del repositorio
8. **Reemplaza los placeholders** en el informe técnico y la presentación con las imágenes generadas

## Prompts de Refinamiento (si el resultado no es exacto)

Si necesitas ajustar el resultado, usa estos prompts adicionales:

```
Make the sidebar darker and add more contrast between the active navigation item and the rest.
```

```
The table in the second card needs a header row with a darker blue background (#2d5a9e) and white text for column labels.
```

```
Add a 5-step horizontal progress indicator at the top of the content area with step 1 filled and steps 2-5 empty circles connected by a thin line.
```

```
The cards should have more whitespace inside (padding 24px) and a very subtle drop shadow (box-shadow: 0 1px 3px rgba(0,0,0,0.1)).
```
