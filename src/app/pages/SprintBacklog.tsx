import { useState, useEffect, useCallback } from 'react';
import {
  IconRocket,
  IconPencil,
  IconX,
  IconDeviceFloppy,
  IconLoader2,
  IconSparkles,
  IconFileTypePdf,
  IconMarkdown,
  IconPlus,
  IconTrash,
  IconClipboardList,
  IconEye,
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useProject } from '../context/ProjectContext';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/Card';
import { Stepper } from '../components/Stepper';
import { ConfirmModal } from '../components/ConfirmModal';
import { useProjectProgress } from '../hooks/useProjectProgress';
import {
  generateSprintBacklog,
  loadProjectSummary,
  type SprintBacklogGenerado,
  type HistoriaUsuario,
  type TareaTecnica,
  type ProjectSummary,
} from '../services/aiService';
import { exportToMarkdown, exportToPdf } from '../services/exportService';
import { api } from '../services/api';
import { toast } from 'sonner';

// ============================================================
// CONSTANTS
// ============================================================

const FIBONACCI = [1, 2, 3, 5, 8, 13] as const;

function getStorageKey(projectId: number) {
  return `sprint-backlog-${projectId}`;
}

// ============================================================
// STYLE HELPERS
// ============================================================

function getPriorityColors(prioridad: string) {
  switch (prioridad) {
    case 'Alta':
      return {
        badge: 'bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error-light)]',
        border: 'border-l-[var(--color-error)]',
        dot: 'bg-[var(--color-error)]',
      };
    case 'Media':
      return {
        badge: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]',
        border: 'border-l-[var(--color-warning)]',
        dot: 'bg-[var(--color-warning)]',
      };
    case 'Baja':
      return {
        badge: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)]',
        border: 'border-l-[var(--color-success)]',
        dot: 'bg-[var(--color-success)]',
      };
    default:
      return {
        badge: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]',
        border: 'border-l-[var(--color-border)]',
        dot: 'bg-[var(--color-text-muted)]',
      };
  }
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function PriorityBadge({ prioridad }: { prioridad: string }) {
  const colors = getPriorityColors(prioridad);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${colors.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} aria-hidden="true" />
      {prioridad}
    </span>
  );
}

function PointsBadge({ puntos }: { puntos: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
      style={{
        background: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-border-strong)',
      }}
      title="Story points"
    >
      {puntos} pts
    </span>
  );
}

// View mode story card
function StoryCardView({
  historia,
  index,
}: {
  historia: HistoriaUsuario;
  index: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const colors = getPriorityColors(historia.prioridad);

  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] border-l-4 ${colors.border} bg-[var(--color-bg-card)] shadow-sm overflow-hidden transition-shadow hover:shadow-md`}
      style={{ marginBottom: 'var(--space-4)' }}
    >
      {/* Card header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        style={{ borderBottom: expanded ? '1px solid var(--color-border)' : 'none' }}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded((v) => !v)}
      >
        <span
          className="flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black"
          style={{
            background: 'var(--color-sidebar)',
            color: '#fff',
            width: 48,
            height: 32,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {historia.id || `HU-${String(index + 1).padStart(3, '0')}`}
        </span>
        <p
          className="flex-1 font-bold"
          style={{ fontSize: 'var(--text-base)', color: 'var(--color-text)' }}
        >
          {historia.titulo}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PriorityBadge prioridad={historia.prioridad} />
          <PointsBadge puntos={historia.puntos} />
          {expanded ? (
            <IconChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <IconChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />
          )}
        </div>
      </div>

      {/* Card body */}
      {expanded && (
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User story format */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Historia de usuario
            </p>
            <div
              className="rounded-lg p-4"
              style={{
                background: 'var(--color-primary-light)',
                borderLeft: '3px solid var(--color-primary)',
                fontSize: 'var(--text-sm)',
                lineHeight: 1.9,
                color: 'var(--color-text)',
              }}
            >
              <p>
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
                  Como{' '}
                </span>
                {historia.comoUsuario},
              </p>
              <p>
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
                  quiero{' '}
                </span>
                {historia.quiero},
              </p>
              <p>
                <span style={{ fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)' }}>
                  para{' '}
                </span>
                {historia.para}
              </p>
            </div>

            {/* Criteria */}
            {historia.criteriosAceptacion && historia.criteriosAceptacion.filter((c) => c.trim()).length > 0 && (
              <div className="mt-4">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ✅ Criterios de aceptación
                </p>
                <ul className="space-y-1.5">
                  {historia.criteriosAceptacion.filter((c) => c.trim()).map((criterio, ci) => (
                    <li
                      key={ci}
                      className="flex items-start gap-2"
                      style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}
                    >
                      <IconCheck
                        size={14}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: 'var(--color-success)' }}
                      />
                      {criterio}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Technical tasks */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              🛠️ Tareas técnicas
            </p>
            {historia.tareasTecnicas && historia.tareasTecnicas.length > 0 ? (
              <div className="design-table-container">
                <table className="design-table">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: 80 }}>ID</th>
                      <th scope="col">Descripción</th>
                      <th scope="col" style={{ width: 50, textAlign: 'center' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historia.tareasTecnicas.map((tarea, ti) => (
                      <tr key={ti}>
                        <td>
                          <code
                            className="text-xs rounded px-1.5 py-0.5"
                            style={{
                              background: 'var(--color-bg-secondary)',
                              color: 'var(--color-primary)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {tarea.id}
                          </code>
                        </td>
                        <td style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                          {tarea.descripcion}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className="font-black text-xs rounded-full px-2 py-0.5"
                            style={{
                              background: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                            }}
                          >
                            {tarea.estimacion}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Sin tareas técnicas
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Edit mode story card
function StoryCardEdit({
  historia,
  index,
  onChange,
  onDelete,
}: {
  historia: HistoriaUsuario;
  index: number;
  onChange: (updated: HistoriaUsuario) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const colors = getPriorityColors(historia.prioridad);

  function updateField<K extends keyof HistoriaUsuario>(field: K, value: HistoriaUsuario[K]) {
    onChange({ ...historia, [field]: value });
  }

  function updateCriterio(ci: number, value: string) {
    const updated = [...historia.criteriosAceptacion];
    updated[ci] = value;
    updateField('criteriosAceptacion', updated);
  }

  function addCriterio() {
    updateField('criteriosAceptacion', [...historia.criteriosAceptacion, '']);
  }

  function removeCriterio(ci: number) {
    updateField(
      'criteriosAceptacion',
      historia.criteriosAceptacion.filter((_, i) => i !== ci)
    );
  }

  function updateTarea(ti: number, field: keyof TareaTecnica, value: any) {
    const updated = historia.tareasTecnicas.map((t, i) =>
      i === ti ? { ...t, [field]: value } : t
    );
    updateField('tareasTecnicas', updated);
  }

  function addTarea() {
    const nextNum = historia.tareasTecnicas.length + 1;
    const huNum = String(index + 1).padStart(3, '0');
    updateField('tareasTecnicas', [
      ...historia.tareasTecnicas,
      { id: `TT-${huNum}-${nextNum}`, descripcion: '', estimacion: 2 },
    ]);
  }

  function removeTarea(ti: number) {
    updateField(
      'tareasTecnicas',
      historia.tareasTecnicas.filter((_, i) => i !== ti)
    );
  }

  return (
    <div
      className={`rounded-xl border-2 border-l-4 ${colors.border} overflow-hidden`}
      style={{
        borderColor: 'var(--color-border-strong)',
        borderLeftColor: '',
        marginBottom: 'var(--space-4)',
        background: 'var(--color-bg-card)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          background: 'var(--color-bg-secondary)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          className="flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black"
          style={{
            background: 'var(--color-sidebar)',
            color: '#fff',
            width: 48,
            height: 28,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {historia.id || `HU-${String(index + 1).padStart(3, '0')}`}
        </span>

        <input
          className="form-input flex-1 px-3 py-1.5 text-sm font-bold is-filled"
          style={{ color: 'var(--color-text)' }}
          value={historia.titulo}
          onChange={(e) => updateField('titulo', e.target.value)}
          placeholder="Título de la historia..."
          aria-label={`Título historia ${index + 1}`}
        />

        {/* Priority select */}
        <select
          className="form-input px-2 py-1.5 text-xs font-bold"
          value={historia.prioridad}
          onChange={(e) => updateField('prioridad', e.target.value as HistoriaUsuario['prioridad'])}
          aria-label="Prioridad"
          style={{ width: 90 }}
        >
          <option value="Alta">🔴 Alta</option>
          <option value="Media">🟡 Media</option>
          <option value="Baja">🟢 Baja</option>
        </select>

        {/* Points select */}
        <select
          className="form-input px-2 py-1.5 text-xs font-bold"
          value={historia.puntos}
          onChange={(e) => updateField('puntos', Number(e.target.value))}
          aria-label="Story points"
          style={{ width: 70 }}
        >
          {FIBONACCI.map((f) => (
            <option key={f} value={f}>
              {f} pts
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-border)]"
          aria-label="Expandir/colapsar"
        >
          {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="btn-danger-icon"
          aria-label={`Eliminar historia ${index + 1}`}
          title="Eliminar historia"
        >
          <IconTrash size={15} />
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User story format */}
          <div className="space-y-3">
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Historia de usuario
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold w-14 flex-shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Como
                </span>
                <input
                  className="form-input flex-1 px-2 py-1.5 text-sm"
                  value={historia.comoUsuario}
                  onChange={(e) => updateField('comoUsuario', e.target.value)}
                  placeholder="tipo de usuario..."
                  aria-label="Como (tipo de usuario)"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold w-14 flex-shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Quiero
                </span>
                <textarea
                  className="form-input flex-1 px-2 py-1.5 text-sm resize-none"
                  value={historia.quiero}
                  onChange={(e) => updateField('quiero', e.target.value)}
                  placeholder="acción que desea realizar..."
                  rows={2}
                  aria-label="Quiero (acción)"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold w-14 flex-shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Para
                </span>
                <textarea
                  className="form-input flex-1 px-2 py-1.5 text-sm resize-none"
                  value={historia.para}
                  onChange={(e) => updateField('para', e.target.value)}
                  placeholder="beneficio o valor que obtendrá..."
                  rows={2}
                  aria-label="Para (beneficio)"
                />
              </div>
            </div>

            {/* Criteria edit */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ✅ Criterios de aceptación
                </p>
                <button
                  type="button"
                  onClick={addCriterio}
                  className="btn-outline-primary text-xs px-2 py-1 flex items-center gap-1"
                  style={{ padding: '3px 8px', fontSize: 'var(--text-xs)' }}
                >
                  <IconPlus size={12} />
                  Agregar
                </button>
              </div>
              <div className="space-y-2">
                {historia.criteriosAceptacion.map((criterio, ci) => (
                  <div key={ci} className="flex items-start gap-2">
                    <textarea
                      className="form-input flex-1 px-2 py-1.5 text-sm resize-none"
                      value={criterio}
                      onChange={(e) => updateCriterio(ci, e.target.value)}
                      placeholder={`Criterio ${ci + 1}...`}
                      rows={2}
                      aria-label={`Criterio de aceptación ${ci + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeCriterio(ci)}
                      className="btn-danger-icon mt-1 flex-shrink-0"
                      aria-label={`Eliminar criterio ${ci + 1}`}
                    >
                      <IconX size={13} />
                    </button>
                  </div>
                ))}
                {historia.criteriosAceptacion.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Sin criterios. Haz clic en "Agregar".
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Technical tasks edit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                🛠️ Tareas técnicas
              </p>
              <button
                type="button"
                onClick={addTarea}
                className="btn-outline-primary text-xs px-2 py-1 flex items-center gap-1"
                style={{ padding: '3px 8px', fontSize: 'var(--text-xs)' }}
              >
                <IconPlus size={12} />
                Agregar
              </button>
            </div>
            <div className="space-y-3">
              {historia.tareasTecnicas.map((tarea, ti) => (
                <div
                  key={ti}
                  className="rounded-lg p-3 space-y-2"
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      className="form-input px-2 py-1 text-xs font-mono"
                      value={tarea.id}
                      onChange={(e) => updateTarea(ti, 'id', e.target.value)}
                      placeholder="TT-001-1"
                      style={{ width: 90 }}
                      aria-label="ID de tarea"
                    />
                    <select
                      className="form-input px-2 py-1 text-xs font-bold"
                      value={tarea.estimacion}
                      onChange={(e) => updateTarea(ti, 'estimacion', Number(e.target.value))}
                      aria-label="Estimación en puntos"
                      style={{ width: 70 }}
                    >
                      {FIBONACCI.map((f) => (
                        <option key={f} value={f}>
                          {f} pts
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeTarea(ti)}
                      className="btn-danger-icon ml-auto flex-shrink-0"
                      aria-label={`Eliminar tarea ${ti + 1}`}
                    >
                      <IconX size={13} />
                    </button>
                  </div>
                  <textarea
                    className="form-input w-full px-2 py-1.5 text-sm resize-none"
                    value={tarea.descripcion}
                    onChange={(e) => updateTarea(ti, 'descripcion', e.target.value)}
                    placeholder="Descripción de la tarea técnica..."
                    rows={2}
                    aria-label={`Descripción tarea ${ti + 1}`}
                  />
                </div>
              ))}
              {historia.tareasTecnicas.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Sin tareas técnicas. Haz clic en "Agregar".
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SprintBacklog() {
  const { activeProject } = useProject();
  const { setUnsavedChanges } = useUnsavedChanges();
  const { getSteps, projectProgress, reloadProgress } = useProjectProgress(activeProject?.id);

  // Core state
  const [backlogData, setBacklogData] = useState<SprintBacklogGenerado | null>(null);
  const [draftData, setDraftData] = useState<SprintBacklogGenerado | null>(null);
  const [projectSummary, setProjectSummary] = useState<ProjectSummary | null>(null);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [visible, setVisible] = useState(false);

  // Modals
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmDeleteStory, setConfirmDeleteStory] = useState<{ open: boolean; index: number }>({
    open: false,
    index: -1,
  });

  // Fade-in animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Load data when project changes
  const loadProjectData = useCallback(async (projectId: number) => {
    setIsLoadingSummary(true);
    try {
      const summary = await loadProjectSummary(projectId);
      setProjectSummary(summary);
    } catch (e) {
      console.error('Error cargando resumen del proyecto:', e);
    } finally {
      setIsLoadingSummary(false);
    }

    // Carga desde BD; usa localStorage solo como caché de respaldo
    try {
      const dbBacklog = await api.getSprintBacklog(projectId);
      if (dbBacklog && Array.isArray(dbBacklog.historias) && dbBacklog.historias.length > 0) {
        const parsed: SprintBacklogGenerado = {
          historias: dbBacklog.historias,
          nombreProyecto: dbBacklog.nombre_proyecto,
          generadoEn: dbBacklog.generado_en,
        };
        setBacklogData(parsed);
        localStorage.setItem(getStorageKey(projectId), JSON.stringify(parsed));
      } else {
        // Sin registro en BD, intenta localStorage como fallback
        const cached = localStorage.getItem(getStorageKey(projectId));
        if (cached) {
          try {
            setBacklogData(JSON.parse(cached) as SprintBacklogGenerado);
          } catch {
            localStorage.removeItem(getStorageKey(projectId));
            setBacklogData(null);
          }
        } else {
          setBacklogData(null);
        }
      }
    } catch {
      // Si falla la BD, intenta localStorage
      const cached = localStorage.getItem(getStorageKey(projectId));
      if (cached) {
        try { setBacklogData(JSON.parse(cached) as SprintBacklogGenerado); }
        catch { setBacklogData(null); }
      } else {
        setBacklogData(null);
      }
    }

    setIsEditing(false);
    setDraftData(null);
  }, []);

  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject.id);
    } else {
      setProjectSummary(null);
      setBacklogData(null);
      setDraftData(null);
      setIsEditing(false);
    }
  }, [activeProject, loadProjectData]);

  // Track unsaved changes
  useEffect(() => {
    const hasPendingChanges = isEditing && !isSaving;
    setUnsavedChanges('sprint-backlog', hasPendingChanges);
    return () => {
      setUnsavedChanges('sprint-backlog', false);
    };
  }, [isEditing, isSaving, setUnsavedChanges]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleGenerate = async () => {
    if (!activeProject) return;

    if (!projectSummary) {
      toast.error('Cargando datos del proyecto, por favor espera.');
      return;
    }

    if (
      !projectSummary.tienePlan &&
      projectSummary.totalObservaciones === 0 &&
      projectSummary.totalHallazgos === 0
    ) {
      toast.warning('Datos insuficientes', {
        description:
          'Registra al menos un plan de prueba, observaciones o hallazgos para que la IA pueda generar un Sprint Backlog relevante.',
      });
    }

    setIsGenerating(true);
    try {
      const result = await generateSprintBacklog(activeProject.id, activeProject.nombre);
      setBacklogData(result);
      // Persiste en BD (upsert) y caché local
      await api.saveSprintBacklog(activeProject.id, result);
      localStorage.setItem(getStorageKey(activeProject.id), JSON.stringify(result));
      reloadProgress();
      toast.success('Sprint Backlog generado', {
        description: `${result.historias.length} historias de usuario creadas con IA.`,
      });
      setConfirmRegenerate(false);
    } catch (e: any) {
      console.error('Error generando Sprint Backlog:', e);
      toast.error('Error al generar', {
        description: e?.message || 'Ocurrió un error al conectar con la IA. Intenta de nuevo.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = () => {
    if (!backlogData) return;
    // Deep copy to avoid mutation
    setDraftData(JSON.parse(JSON.stringify(backlogData)));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!draftData || !activeProject) return;
    setIsSaving(true);
    try {
      await api.saveSprintBacklog(activeProject.id, draftData);
      localStorage.setItem(getStorageKey(activeProject.id), JSON.stringify(draftData));
      setBacklogData(draftData);
      setIsEditing(false);
      setDraftData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Borrador guardado correctamente');
    } catch (e) {
      toast.error('Error al guardar el borrador');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setConfirmDiscard(true);
  };

  const handleConfirmDiscard = () => {
    setDraftData(null);
    setIsEditing(false);
    setConfirmDiscard(false);
  };

  const handleUpdateHistoria = (index: number, updated: HistoriaUsuario) => {
    if (!draftData) return;
    const newHistorias = [...draftData.historias];
    newHistorias[index] = updated;
    setDraftData({ ...draftData, historias: newHistorias });
  };

  const handleDeleteHistoria = (index: number) => {
    setConfirmDeleteStory({ open: true, index });
  };

  const handleConfirmDeleteHistoria = () => {
    if (!draftData || confirmDeleteStory.index < 0) return;
    const newHistorias = draftData.historias.filter((_, i) => i !== confirmDeleteStory.index);
    setDraftData({ ...draftData, historias: newHistorias });
    setConfirmDeleteStory({ open: false, index: -1 });
  };

  const handleAddHistoria = () => {
    if (!draftData) return;
    const nextIndex = draftData.historias.length + 1;
    const newHistoria: HistoriaUsuario = {
      id: `HU-${String(nextIndex).padStart(3, '0')}`,
      titulo: `Historia de usuario ${nextIndex}`,
      comoUsuario: '',
      quiero: '',
      para: '',
      prioridad: 'Media',
      puntos: 3,
      criteriosAceptacion: [''],
      tareasTecnicas: [
        { id: `TT-${String(nextIndex).padStart(3, '0')}-1`, descripcion: '', estimacion: 2 },
      ],
    };
    setDraftData({ ...draftData, historias: [...draftData.historias, newHistoria] });
  };

  const handleExportMd = () => {
    if (!backlogData) return;
    try {
      exportToMarkdown(backlogData);
      toast.success('Archivo .md descargado');
    } catch (e: any) {
      toast.error('Error al exportar Markdown', { description: e?.message });
    }
  };

  const handleExportPdf = () => {
    if (!backlogData) return;
    try {
      exportToPdf(backlogData);
      toast.success('Abriendo vista de impresión para PDF', {
        description: 'Usa Ctrl+P / Cmd+P y selecciona "Guardar como PDF".',
      });
    } catch (e: any) {
      toast.error('Error al exportar PDF', { description: e?.message });
    }
  };

  // ============================================================
  // COMPUTED VALUES
  // ============================================================

  const displayData = isEditing ? draftData : backlogData;
  const totalPuntos = displayData?.historias.reduce((sum, h) => sum + (h.puntos || 0), 0) ?? 0;
  const altaCount = displayData?.historias.filter((h) => h.prioridad === 'Alta').length ?? 0;
  const mediaCount = displayData?.historias.filter((h) => h.prioridad === 'Media').length ?? 0;
  const bajaCount = displayData?.historias.filter((h) => h.prioridad === 'Baja').length ?? 0;

  // ============================================================
  // GUARD
  // ============================================================

  if (!activeProject) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
        <IconRocket size={48} className="mx-auto mb-4 opacity-30" />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          No hay proyecto seleccionado
        </h2>
        <p>Selecciona o crea un proyecto en el menú lateral para continuar.</p>
      </div>
    );
  }

  if (!projectProgress.hasHallazgos) {
    return (
      <div
        className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ paddingBottom: 'var(--space-8)' }}
      >
        <Breadcrumbs
          items={[
            { label: 'Proyectos' },
            { label: activeProject.nombre },
            { label: 'Sprint Backlog IA' },
          ]}
        />
        <Stepper steps={getSteps()} />
        <div
          className="rounded-xl flex flex-col items-center text-center py-16 px-8"
          style={{
            background: 'var(--color-bg-card)',
            border: '2px dashed var(--color-border-strong)',
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl w-20 h-20 mb-5"
            style={{ background: 'var(--color-bg-secondary)' }}
          >
            <IconAlertTriangle size={36} style={{ color: 'var(--color-warning)' }} />
          </div>
          <h3
            className="font-bold mb-3"
            style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}
          >
            Módulo bloqueado
          </h3>
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-secondary)',
              maxWidth: 480,
              lineHeight: 1.7,
            }}
          >
            Necesitas completar los módulos anteriores antes de generar el Sprint Backlog.
            Registra al menos un <strong>hallazgo</strong> para desbloquear este módulo.
          </p>
          <div
            className="flex items-center gap-2 mt-6 px-4 py-2 rounded-lg"
            style={{
              background: 'var(--color-warning-light)',
              color: 'var(--color-warning)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
            }}
          >
            <IconAlertTriangle size={15} />
            Plan → Tareas → Observaciones → Hallazgos → Sprint Backlog IA
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ paddingBottom: 'var(--space-8)' }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Proyectos' },
          { label: activeProject.nombre },
          { label: 'Sprint Backlog IA' },
        ]}
      />

      {/* Page header */}
      <header
        className="flex items-start justify-between gap-4"
        style={{ marginBottom: 'var(--space-8)' }}
      >
        <div>
          <h1 className="page-title flex items-center gap-3">
            <IconRocket size={28} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            Sprint Backlog IA — {activeProject.nombre}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Genera automáticamente un borrador del Sprint Backlog a partir de los datos de usabilidad
          </p>
        </div>

        {backlogData && !isEditing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setConfirmRegenerate(true)}
              className="btn-secondary flex items-center gap-2 px-4 py-2"
              aria-label="Regenerar Sprint Backlog"
              disabled={isGenerating}
            >
              <IconRefresh size={16} />
              <span className="hidden md:inline">Regenerar</span>
            </button>
            <button
              onClick={handleEdit}
              className="btn-editar flex items-center gap-2 px-4 py-2"
              aria-label="Editar Sprint Backlog"
            >
              <IconPencil size={16} />
              <span className="hidden md:inline">Editar</span>
            </button>
          </div>
        )}
      </header>

      {/* Stepper */}
      <Stepper steps={getSteps()} />

      {/* Edit mode banner */}
      {isEditing && (
        <div className="mb-4 edit-mode-banner flex items-center gap-2" role="status" aria-live="polite">
          <IconPencil size={16} />
          Modo de edición activado — modifica las historias antes de exportar
        </div>
      )}

      {/* ── SECTION 1: PROJECT SUMMARY (solo si hay datos) ── */}
      {isLoadingSummary && (
        <div className="flex items-center gap-3 py-2 mb-4" style={{ color: 'var(--color-text-muted)' }}>
          <IconLoader2 size={16} className="animate-spin" />
          <span style={{ fontSize: 'var(--text-sm)' }}>Cargando datos del proyecto...</span>
        </div>
      )}

      {!isLoadingSummary && projectSummary && (
        projectSummary.tienePlan ||
        projectSummary.totalTareas > 0 ||
        projectSummary.totalObservaciones > 0 ||
        projectSummary.totalHallazgos > 0
      ) && (
        <Card title="Datos disponibles para la IA">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="metric-card p-4 flex flex-col items-center text-center gap-1">
              <IconClipboardList
                size={22}
                style={{ color: projectSummary!.tienePlan ? 'var(--color-success)' : 'var(--color-text-muted)' }}
              />
              <span className="font-black text-2xl" style={{ color: 'var(--color-text)' }}>
                {projectSummary!.tienePlan ? '✓' : '—'}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Plan de prueba</span>
            </div>

            <div className="metric-card p-4 flex flex-col items-center text-center gap-1">
              <IconClipboardList size={22} style={{ color: 'var(--color-info)' }} />
              <span className="font-black text-2xl" style={{ color: 'var(--color-text)' }}>
                {projectSummary!.totalTareas}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Tareas</span>
            </div>

            <div className="metric-card p-4 flex flex-col items-center text-center gap-1">
              <IconEye size={22} style={{ color: 'var(--color-primary)' }} />
              <span className="font-black text-2xl" style={{ color: 'var(--color-text)' }}>
                {projectSummary!.totalObservaciones}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Observaciones</span>
            </div>

            <div className="metric-card p-4 flex flex-col items-center text-center gap-1">
              <IconAlertTriangle size={22} style={{ color: 'var(--color-warning)' }} />
              <span className="font-black text-2xl" style={{ color: 'var(--color-text)' }}>
                {projectSummary!.totalHallazgos}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Hallazgos</span>
            </div>
          </div>

          {projectSummary!.totalHallazgos > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Severidad de hallazgos:
              </span>
              <span className="badge-error text-xs px-2 py-0.5 rounded-full font-bold">
                Alta: {projectSummary!.hallazgosAlta}
              </span>
              <span className="badge-warning text-xs px-2 py-0.5 rounded-full font-bold">
                Media: {projectSummary!.hallazgosMedia}
              </span>
              <span className="badge-success text-xs px-2 py-0.5 rounded-full font-bold">
                Baja: {projectSummary!.hallazgosBaja}
              </span>
            </div>
          )}
        </Card>
      )}

      {/* ── EMPTY STATE: proyecto sin datos ── */}
      {!isLoadingSummary && !backlogData && projectSummary && (
        !projectSummary.tienePlan &&
        projectSummary.totalTareas === 0 &&
        projectSummary.totalObservaciones === 0 &&
        projectSummary.totalHallazgos === 0
      ) && (
        <div
          className="rounded-xl flex flex-col items-center text-center py-14 px-8 mb-6"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px dashed var(--color-border-strong)',
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl w-16 h-16 mb-4"
            style={{ background: 'var(--color-primary-light)' }}
          >
            <IconSparkles size={30} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 className="font-bold mb-2" style={{ fontSize: 'var(--text-md)', color: 'var(--color-text)' }}>
            Este proyecto aún no tiene datos
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: 420 }}>
            Completa primero el <strong>Plan de prueba</strong>, las <strong>Tareas</strong>, las{' '}
            <strong>Observaciones</strong> y los <strong>Hallazgos</strong>. La IA usará esos datos
            para generar un Sprint Backlog relevante.
          </p>
        </div>
      )}

      {/* ── SECTION 2: GENERATE WITH AI ── */}
      {!backlogData && !(projectSummary && !projectSummary.tienePlan && projectSummary.totalTareas === 0 && projectSummary.totalObservaciones === 0 && projectSummary.totalHallazgos === 0) && (
        <Card title="Generación con Inteligencia Artificial">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Icon and description */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-2xl w-20 h-20"
              style={{ background: 'var(--color-primary-light)' }}
            >
              <IconSparkles size={36} style={{ color: 'var(--color-primary)' }} />
            </div>

            <div className="flex-1">
              <h3
                className="font-bold mb-2"
                style={{ fontSize: 'var(--text-md)', color: 'var(--color-text)' }}
              >
                Genera tu Sprint Backlog automáticamente
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                La IA analizará el plan de prueba, las tareas, observaciones y hallazgos registrados
                en este proyecto para generar historias de usuario, tareas técnicas, criterios de
                aceptación y prioridades alineadas con los problemas de usabilidad detectados.
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary flex items-center gap-3 flex-shrink-0"
              style={{ padding: '14px 28px', fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}
              aria-label="Generar Sprint Backlog con IA"
            >
              {isGenerating ? (
                <>
                  <IconLoader2 size={20} className="animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <IconSparkles size={20} />
                  Generar con IA
                </>
              )}
            </button>
          </div>
        </Card>
      )}

      {/* ── SECTION 3: GENERATED SPRINT BACKLOG ── */}
      {displayData && (
        <>
          {/* Sprint summary stats */}
          <Card title="Resumen del Sprint">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="metric-card p-4 text-center">
                <p
                  className="font-black text-3xl"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {displayData.historias.length}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Historias
                </p>
              </div>
              <div className="metric-card p-4 text-center">
                <p
                  className="font-black text-3xl"
                  style={{ color: 'var(--color-text)' }}
                >
                  {totalPuntos}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Story Points
                </p>
              </div>
              <div className="metric-card p-4 text-center">
                <p
                  className="font-black text-3xl"
                  style={{ color: 'var(--color-error)' }}
                >
                  {altaCount}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Alta prioridad
                </p>
              </div>
              <div className="metric-card p-4 text-center">
                <p
                  className="font-black text-3xl"
                  style={{ color: 'var(--color-warning)' }}
                >
                  {mediaCount}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Media prioridad
                </p>
              </div>
              <div className="metric-card p-4 text-center">
                <p
                  className="font-black text-3xl"
                  style={{ color: 'var(--color-success)' }}
                >
                  {bajaCount}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Baja prioridad
                </p>
              </div>
            </div>

            <p
              className="mt-4 text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Generado el{' '}
              {new Date(displayData.generadoEn).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </Card>

          {/* Stories */}
          <Card title={`Historias de Usuario (${displayData.historias.length})`}>
            {displayData.historias.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No hay historias en este Sprint Backlog.
                {isEditing && ' Haz clic en "Agregar historia" para añadir una.'}
              </p>
            ) : isEditing ? (
              <>
                {draftData?.historias.map((historia, index) => (
                  <StoryCardEdit
                    key={`${historia.id}-${index}`}
                    historia={historia}
                    index={index}
                    onChange={(updated) => handleUpdateHistoria(index, updated)}
                    onDelete={() => handleDeleteHistoria(index)}
                  />
                ))}
              </>
            ) : (
              <>
                {backlogData?.historias.map((historia, index) => (
                  <StoryCardView key={`${historia.id}-${index}`} historia={historia} index={index} />
                ))}
              </>
            )}

            {/* Add story button (edit mode) */}
            {isEditing && (
              <button
                type="button"
                onClick={handleAddHistoria}
                className="btn-outline-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
              >
                <IconPlus size={16} />
                Agregar historia de usuario
              </button>
            )}
          </Card>

          {/* ── SECTION 4: EXPORT ── */}
          {!isEditing && (
            <Card title="Exportar Sprint Backlog">
              <p
                className="mb-5"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}
              >
                Descarga el Sprint Backlog generado en el formato que necesites. El contenido
                exportado reflejará las ediciones manuales que hayas guardado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExportMd}
                  className="btn-outline-primary flex items-center justify-center gap-3 px-6 py-3 flex-1"
                  aria-label="Exportar como Markdown"
                >
                  <IconMarkdown size={22} />
                  <div className="text-left">
                    <p className="font-bold" style={{ fontSize: 'var(--text-sm)' }}>
                      Exportar como Markdown
                    </p>
                    <p className="text-xs opacity-70">Archivo .md compatible con GitHub, Notion, etc.</p>
                  </div>
                </button>

                <button
                  onClick={handleExportPdf}
                  className="btn-primary flex items-center justify-center gap-3 px-6 py-3 flex-1"
                  aria-label="Exportar como PDF"
                >
                  <IconFileTypePdf size={22} />
                  <div className="text-left">
                    <p className="font-bold" style={{ fontSize: 'var(--text-sm)' }}>
                      Exportar como PDF
                    </p>
                    <p className="text-xs opacity-70">Vista de impresión → Guardar como PDF</p>
                  </div>
                </button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── GENERATE BUTTON (when backlog exists but not editing) ── */}
      {backlogData && !isEditing && (
        <div
          className="flex items-center gap-2 mt-2 mb-6 p-3 rounded-lg"
          style={{
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-border)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <IconInfoCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span>
            Para actualizar el Sprint Backlog con nuevos datos, usa el botón{' '}
            <strong style={{ color: 'var(--color-text)' }}>Regenerar</strong>. El borrador actual
            se reemplazará con una nueva generación de la IA.
          </span>
        </div>
      )}

      {/* ── SAVE / CANCEL BUTTONS (edit mode) ── */}
      {isEditing && (
        <div
          className="flex justify-end gap-3 mt-6 pt-4"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors"
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            <IconX size={16} />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-colors shadow-sm"
            style={{
              background: 'var(--color-sidebar)',
              fontSize: 'var(--text-base)',
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? (
              <>
                <IconLoader2 size={20} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <IconDeviceFloppy size={16} />
                Guardar borrador
              </>
            )}
          </button>
        </div>
      )}

      {/* ── MODALS ── */}
      <ConfirmModal
        open={confirmDiscard}
        title="Descartar cambios"
        message="¿Seguro que deseas descartar los cambios realizados? El borrador guardado no se modificará."
        confirmText="Descartar cambios"
        cancelText="Seguir editando"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={handleConfirmDiscard}
      />

      <ConfirmModal
        open={confirmRegenerate}
        title="Regenerar Sprint Backlog"
        message="¿Deseas generar un nuevo Sprint Backlog con la IA? El borrador actual guardado será reemplazado."
        confirmText={isGenerating ? 'Generando...' : 'Sí, regenerar'}
        cancelText="Cancelar"
        onCancel={() => !isGenerating && setConfirmRegenerate(false)}
        onConfirm={handleGenerate}
      />

      <ConfirmModal
        open={confirmDeleteStory.open}
        title="Eliminar historia"
        message="¿Seguro que deseas eliminar esta historia de usuario y todas sus tareas técnicas?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setConfirmDeleteStory({ open: false, index: -1 })}
        onConfirm={handleConfirmDeleteHistoria}
      />
    </div>
  );
}
