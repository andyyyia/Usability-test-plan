# Módulo: Sprint Backlog Asistido por IA

**Proyecto:** Usability Test Dashboard  
**Equipo:** Chachalo Redrobán J.D. · Jirón Gordillo J.G. · Paredes Garzón R.A.  
**Docente:** Ing. José Caiza, Mg.

---

## ¿Qué hace este módulo?

Toma todos los datos de una prueba de usabilidad ya registrada (plan, tareas, observaciones, hallazgos) y usa una IA para generar automáticamente un **Sprint Backlog** con historias de usuario que corrigen los problemas encontrados.

En términos simples: los datos de la prueba entran → la IA los analiza → salen historias de usuario listas para trabajar.

---

## Tecnología utilizada

| Componente | Detalle |
|---|---|
| IA | [Groq API](https://console.groq.com) — modelo `llama-3.3-70b-versatile` |
| Por qué Groq | Gratuito, sin tarjeta de crédito, 1 500 requests/día, compatible con OpenAI |
| Base de datos | Supabase (tabla `sprint_backlogs`, columna `historias` tipo JSONB) |
| Frontend | React 18 + TypeScript + Tailwind CSS v4 |

---

## Archivos clave

```
src/app/
├── pages/
│   └── SprintBacklog.tsx       ← Página principal del módulo (UI completa)
├── services/
│   ├── aiService.ts            ← Lógica de llamada a Groq + construcción del prompt
│   ├── exportService.ts        ← Exportar backlog a Markdown o PDF
│   └── api.ts                  ← Funciones getSprintBacklog / saveSprintBacklog
└── hooks/
    └── useProjectProgress.ts   ← Detecta si el backlog ya fue generado (paso 5 del stepper)
```

---

## Cómo funciona internamente

### 1. Recolección de datos
Al pulsar **"Generar con IA"**, el módulo carga en paralelo desde Supabase:
- Plan de prueba (producto, objetivo, perfil de usuario)
- Tareas del plan y guion de tareas
- Observaciones de participantes
- Hallazgos con severidad y recomendaciones

### 2. Construcción del prompt
`aiService.ts → buildPrompt()` arma un texto estructurado con toda esa información. Si el equipo de desarrollo fue configurado, también incluye una **guía de asignación por rol** para que la IA sepa qué tipos de tareas corresponden a cada miembro.

### 3. Llamada a Groq
Se hace un `fetch` a `https://api.groq.com/openai/v1/chat/completions` con:
- `model: "llama-3.3-70b-versatile"`
- `response_format: { type: "json_object" }` — fuerza respuesta JSON válido
- `temperature: 0.7` — balance entre creatividad y coherencia

### 4. Respuesta de la IA
La IA devuelve un JSON con entre 3 y 5 **historias de usuario**, cada una con:
- Formato Scrum estándar (Como… quiero… para…)
- Prioridad (Alta / Media / Baja) y story points (1, 2, 3, 5, 8 o 13)
- Criterios de aceptación verificables
- Tareas técnicas con estimación y asignación al equipo
- `razonamiento`: explica qué hallazgo originó esa historia

### 5. Persistencia
El backlog generado se guarda en Supabase (`sprint_backlogs`) con `upsert`, por lo que regenerar sobreescribe el anterior. El stepper del dashboard marca el paso 5 como completado automáticamente.

---

## Configuración necesaria

En el archivo `.env` de la raíz del proyecto:

```env
VITE_GROQ_API_KEY=tu_clave_aqui
```

Obtener clave gratuita en: [console.groq.com/keys](https://console.groq.com/keys) → crear cuenta → **Create API Key**.

> ⚠️ Sin esta clave el botón "Generar con IA" lanza un error. El resto de la app funciona con normalidad.

---

## Flujo de uso (paso a paso)

```
1. Crear un proyecto en el dashboard
2. Completar: Plan de prueba → Tareas → Observaciones → Hallazgos
3. Ir a "Sprint Backlog IA" en el menú lateral
4. (Opcional) Configurar equipo de desarrollo y velocidad del sprint
5. Pulsar "Generar con IA"
6. Revisar las historias generadas — se pueden editar inline
7. Guardar con "Guardar cambios"
8. Exportar a Markdown o PDF si se necesita
```

---

## Estructura del JSON almacenado

```json
{
  "historias": [
    {
      "id": "HU-001",
      "titulo": "Mejorar visibilidad del estado del sistema",
      "comoUsuario": "evaluador de usabilidad",
      "quiero": "ver indicadores claros del progreso de cada tarea",
      "para": "reducir la incertidumbre durante la sesión de prueba",
      "prioridad": "Alta",
      "puntos": 5,
      "razonamiento": "El hallazgo H-02 indica que el 60% de participantes no sabía en qué paso estaba.",
      "criteriosAceptacion": [
        "El stepper muestra el paso actual resaltado visualmente",
        "Al completar un paso aparece un indicador de check"
      ],
      "tareasTecnicas": [
        { "id": "TT-001-1", "descripcion": "Actualizar componente Stepper con estado visual activo", "estimacion": 3, "asignadoA": "Juan Chachalo" },
        { "id": "TT-001-2", "descripcion": "Escribir casos de prueba para el Stepper", "estimacion": 2, "asignadoA": "José Jirón" }
      ]
    }
  ],
  "nombreProyecto": "Mi Proyecto",
  "generadoEn": "2026-06-10T14:30:00.000Z"
}
```

---

## Posibles errores y soluciones

| Error | Causa | Solución |
|---|---|---|
| `Falta VITE_GROQ_API_KEY` | No hay clave en `.env` | Agregar la clave y reiniciar `npm run dev` |
| `HTTP 401` | Clave inválida o expirada | Generar nueva clave en console.groq.com |
| `HTTP 429` | Límite de requests alcanzado | Esperar unos minutos (1 500 req/día gratis) |
| `La IA no generó historias` | Proyecto sin hallazgos u observaciones | Completar los pasos previos antes de generar |
| `JSON inválido` | Respuesta inesperada del modelo | Intentar de nuevo (raro con `response_format: json_object`) |
