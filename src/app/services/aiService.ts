import { api } from './api';

// ============================================================
// TYPES
// ============================================================

export interface MiembroEquipo {
  id: string;
  nombre: string;
  rol: string;
}

export interface TareaTecnica {
  id: string;
  descripcion: string;
  estimacion: number;
  asignadoA?: string | null;
}

export interface HistoriaUsuario {
  id: string;
  titulo: string;
  comoUsuario: string;
  quiero: string;
  para: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  puntos: number;
  criteriosAceptacion: string[];
  tareasTecnicas: TareaTecnica[];
  razonamiento?: string;
}

export interface SprintBacklogGenerado {
  historias: HistoriaUsuario[];
  nombreProyecto: string;
  generadoEn: string;
}

export interface ProjectSummary {
  tienePlan: boolean;
  totalTareas: number;
  totalTareasGuion: number;
  totalObservaciones: number;
  totalHallazgos: number;
  hallazgosAlta: number;
  hallazgosMedia: number;
  hallazgosBaja: number;
}

// ============================================================
// PROMPT
// ============================================================

function buildPrompt(data: {
  nombreProyecto: string;
  plan: any;
  tareasPlan: any[];
  tareasGuion: any[];
  observaciones: any[];
  hallazgos: any[];
  equipo?: MiembroEquipo[];
}): string {
  const plan = data.plan;

  const planTxt = plan
    ? `Producto: ${plan.producto || '—'} | Pantalla: ${plan.pantalla || '—'} | Objetivo: ${plan.objetivo || '—'} | Perfil usuario: ${plan.perfil || '—'}`
    : 'Sin plan registrado.';

  const tareasTxt = data.tareasPlan.length
    ? data.tareasPlan.map(t => `[${t.identificador}] Escenario: ${t.escenario || t.texto || ''} | Métrica: ${t.metrica_principal || '—'}`).join(' | ')
    : 'Sin tareas del plan.';

  const guionTxt = data.tareasGuion.length
    ? data.tareasGuion.map(t => `[${t.identificador}] ${t.texto || ''} | Pregunta de seguimiento: ${t.pregunta || '—'} | Éxito esperado: ${t.exito_esperado || '—'}`).join(' | ')
    : 'Sin guion de tareas.';

  const obsTxt = data.observaciones.length
    ? data.observaciones.map(o =>
        `${o.participante || 'P'}: tarea ${o.tarea_id || o.tarea || '—'} — "${o.problema || 'sin problema'}" (severidad: ${o.severidad || '—'}, éxito: ${o.exito || '—'})`
      ).join(' | ')
    : 'Sin observaciones.';

  const hallTxt = data.hallazgos.length
    ? data.hallazgos.map(h =>
        `- "${h.problema}" | Severidad: ${h.severidad} | Prioridad: ${h.prioridad || '—'} | Recomendación: ${h.recomendacion || '—'}`
      ).join('\n')
    : 'Sin hallazgos registrados.';

  const equipoTxt = data.equipo && data.equipo.length > 0
    ? data.equipo.map(m => `- ${m.nombre} (${m.rol})`).join('\n')
    : null;

  return `Eres un Scrum Master experto en UX. Analiza los siguientes datos de una prueba de usabilidad del proyecto "${data.nombreProyecto}" y genera un Sprint Backlog en español.

PLAN DE PRUEBA: ${planTxt}
TAREAS DEL PLAN: ${tareasTxt}
GUION DE TAREAS (escenarios aplicados con el usuario): ${guionTxt}
OBSERVACIONES DE PARTICIPANTES: ${obsTxt}
HALLAZGOS:
${hallTxt}
${equipoTxt ? `\nEQUIPO DE DESARROLLO (asigna cada tarea técnica al miembro más adecuado según su rol):\n${equipoTxt}` : ''}

Genera entre 3 y 5 historias de usuario que corrijan los problemas de usabilidad identificados.

IMPORTANTE: Responde SOLO con JSON válido, sin texto adicional, sin explicaciones, sin bloques de código markdown. El JSON debe tener exactamente esta estructura:

{
  "historias": [
    {
      "id": "HU-001",
      "titulo": "Título descriptivo de la historia",
      "comoUsuario": "tipo de usuario",
      "quiero": "funcionalidad que necesita",
      "para": "beneficio que obtendrá",
      "prioridad": "Alta",
      "puntos": 5,
      "razonamiento": "Explica en 1-2 oraciones qué hallazgo u observación específica origina esta historia.",
      "criteriosAceptacion": [
        "Criterio verificable 1",
        "Criterio verificable 2"
      ],
      "tareasTecnicas": [
        { "id": "TT-001-1", "descripcion": "Descripción técnica", "estimacion": 3, "asignadoA": "Nombre del miembro o null" },
        { "id": "TT-001-2", "descripcion": "Descripción técnica", "estimacion": 2, "asignadoA": "Nombre del miembro o null" }
      ]
    }
  ]
}

Reglas:
- prioridad solo puede ser: "Alta", "Media" o "Baja"
- puntos solo puede ser: 1, 2, 3, 5, 8 o 13
- Cada historia debe tener entre 2 y 4 criteriosAceptacion
- Cada historia debe tener entre 2 y 3 tareasTecnicas
- razonamiento: obligatorio, máximo 2 oraciones, menciona el hallazgo u observación concreta que origina la historia
- asignadoA: si hay equipo definido, asigna al miembro más adecuado según la naturaleza de la tarea y el rol; si no hay equipo, usa null
- Todo el contenido en español`;
}

// ============================================================
// EXTRACT JSON — robusto ante texto extra del modelo
// ============================================================

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;

  // Quitar bloques markdown
  const stripped = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  if (stripped.startsWith('{')) return stripped;

  // Extraer entre primer { y último }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) return text.slice(start, end + 1);

  return trimmed;
}

// ============================================================
// GENERATE SPRINT BACKLOG — usando Groq (gratis, sin tarjeta)
// Obtén tu clave en: https://console.groq.com/keys
// ============================================================

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Mejor modelo gratuito de Groq

export async function generateSprintBacklog(
  proyectoId: number,
  nombreProyecto: string,
  equipo?: MiembroEquipo[]
): Promise<SprintBacklogGenerado> {
  const apiKey = (import.meta.env.VITE_GROQ_API_KEY as string | undefined)?.trim();

  if (!apiKey) {
    throw new Error('Falta VITE_GROQ_API_KEY en el archivo .env. Obtén tu clave gratuita en console.groq.com y reinicia el servidor.');
  }

  // Cargar todos los datos del proyecto en paralelo
  const [plan, tareasPlan, tareasGuion, observaciones, hallazgos] = await Promise.all([
    api.getPlan(proyectoId).catch(() => null),
    api.getTareasPlan(proyectoId).catch(() => []),
    api.getTareasGuion(proyectoId).catch(() => []),
    api.getObservaciones(proyectoId).catch(() => []),
    api.getHallazgos(proyectoId).catch(() => []),
  ]);

  const prompt = buildPrompt({
    nombreProyecto,
    plan,
    tareasPlan: tareasPlan ?? [],
    tareasGuion: tareasGuion ?? [],
    observaciones: observaciones ?? [],
    hallazgos: hallazgos ?? [],
    equipo,
  });

  // Llamada a Groq
  let response: Response;
  try {
    response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });
  } catch (networkErr) {
    console.error('[Groq] Error de red:', networkErr);
    throw new Error('No se pudo conectar con Groq. Verifica tu conexión a internet.');
  }

  if (!response.ok) {
    let errMsg = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      console.error('[Groq] Error completo:', JSON.stringify(errBody));
      errMsg = errBody?.error?.message ?? errMsg;
    } catch { /* ignorar */ }
    throw new Error(`Error de Groq (${response.status}): ${errMsg}`);
  }

  const body = await response.json();
  console.log('[Groq] Respuesta OK — modelo:', body?.model, '| tokens usados:', body?.usage?.total_tokens);

  const rawText: string = body?.choices?.[0]?.message?.content ?? '';

  if (!rawText) {
    console.error('[Groq] Respuesta vacía:', body);
    throw new Error('Groq no devolvió contenido. Revisa la consola (F12) para más detalles.');
  }

  let parsed: { historias: HistoriaUsuario[] };
  try {
    parsed = JSON.parse(extractJson(rawText));
  } catch (parseErr) {
    console.error('[Groq] JSON inválido recibido:', rawText);
    throw new Error('La IA respondió con un formato inesperado. Intenta de nuevo.');
  }

  if (!Array.isArray(parsed?.historias) || parsed.historias.length === 0) {
    console.error('[Groq] Sin historias en la respuesta:', parsed);
    throw new Error('La IA no generó historias. Asegúrate de tener hallazgos u observaciones registradas.');
  }

  return {
    historias: parsed.historias,
    nombreProyecto,
    generadoEn: new Date().toISOString(),
  };
}

// ============================================================
// PROJECT SUMMARY
// ============================================================

export async function loadProjectSummary(proyectoId: number): Promise<ProjectSummary> {
  const [plan, tareasPlan, tareasGuion, observaciones, hallazgos] = await Promise.all([
    api.getPlan(proyectoId).catch(() => null),
    api.getTareasPlan(proyectoId).catch(() => []),
    api.getTareasGuion(proyectoId).catch(() => []),
    api.getObservaciones(proyectoId).catch(() => []),
    api.getHallazgos(proyectoId).catch(() => []),
  ]);

  const h = hallazgos ?? [];

  return {
    tienePlan: !!plan,
    totalTareas: (tareasPlan ?? []).length,
    totalTareasGuion: (tareasGuion ?? []).length,
    totalObservaciones: (observaciones ?? []).length,
    totalHallazgos: h.length,
    hallazgosAlta: h.filter((x: any) => x.severidad === 'Alta').length,
    hallazgosMedia: h.filter((x: any) => x.severidad === 'Media').length,
    hallazgosBaja: h.filter((x: any) => x.severidad === 'Baja').length,
  };
}
