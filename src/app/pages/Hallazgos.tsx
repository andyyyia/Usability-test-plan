import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { IconAlertTriangle, IconPencil, IconX, IconCheck, IconCircleCheck, IconTrash, IconDeviceFloppy, IconBell, IconPlus, IconLoader2, IconChevronDown, IconClock, IconRefresh } from '@tabler/icons-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Stepper } from '../components/Stepper';
import { useProjectProgress } from '../hooks/useProjectProgress';

interface Finding {
  problema: string;
  evidencia: string;
  frecuencia: string;
  severidad: string;
  recomendacion: string;
  prioridad: string;
  estado: string;
}

export function Hallazgos() {
  const { activeProject } = useProject();
  const { setUnsavedChanges } = useUnsavedChanges();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ index: number; field: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; index: number }>({ open: false, index: -1 });
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const [visible, setVisible] = useState(false);
  const { getSteps, reloadProgress } = useProjectProgress(activeProject?.id);

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (activeProject) {
      loadData(activeProject.id);
    } else {
      setFindings([]);
    }
  }, [activeProject]);

  useEffect(() => {
    const hasPendingChanges = isEditing && !isSaving;
    setUnsavedChanges('hallazgos', hasPendingChanges);

    return () => {
      setUnsavedChanges('hallazgos', false);
    };
  }, [isEditing, isSaving, setUnsavedChanges]);

  const loadData = async (projectId: number) => {
    setIsLoading(true);
    let hasData = false;
    try {
      const data = await api.getHallazgos(projectId);

      if (data && data.length > 0) {
        hasData = true;
        setFindings(data);
      } else {
        setFindings([{ problema: '', evidencia: '', frecuencia: '', severidad: '', recomendacion: '', prioridad: '', estado: '' }]);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    setIsEditing(!hasData);
  };

  const handleChange = (index: number, field: keyof Finding, value: string) => {
    if (!isEditing) return;
    const newFindings = [...findings];
    newFindings[index] = { ...newFindings[index], [field]: value };
    setFindings(newFindings);
  };

  const addFinding = () => {
    setFindings([
      ...findings,
      {
        problema: '',
        evidencia: '',
        frecuencia: '',
        severidad: '',
        recomendacion: '',
        prioridad: '',
        estado: '',
      },
    ]);
  };

  const handleSave = async () => {
    if (!activeProject) {
      toast.info('Por favor selecciona o crea un proyecto primero.');
      return;
    }
    setIsSaving(true);

    const newErrors: { index: number; field: string }[] = [];
    const cleanRowsIndexes = new Set<number>();
    const freqRegex = /^\d+\/\d+$/;

    findings.forEach((f, index) => {
      const isEmpty = !f.problema.trim() && !f.evidencia.trim() && !f.frecuencia.trim() && 
                      !f.severidad.trim() && !f.recomendacion.trim() && !f.prioridad.trim() && !f.estado.trim();
      
      if (isEmpty) {
        cleanRowsIndexes.add(index);
        return;
      }

      const freqVal = f.frecuencia.trim();

      if (!f.problema.trim()) newErrors.push({ index, field: 'problema' });
      if (!f.evidencia.trim()) newErrors.push({ index, field: 'evidencia' });
      if (!freqVal || !freqRegex.test(freqVal)) newErrors.push({ index, field: 'frecuencia' });
      if (!f.severidad.trim()) newErrors.push({ index, field: 'severidad' });
      if (!f.recomendacion.trim()) newErrors.push({ index, field: 'recomendacion' });
      if (!f.prioridad.trim()) newErrors.push({ index, field: 'prioridad' });
      if (!f.estado.trim()) newErrors.push({ index, field: 'estado' });
    });
    setErrors(newErrors);

    const validData = findings.filter((_, i) => !cleanRowsIndexes.has(i));

    if (validData.length > 0 && newErrors.length > 0) {
      toast.error('Validación', { description: 'Hay filas parcialmente llenas o la frecuencia tiene un formato incorrecto (ej: 2/5).' });
      setIsSaving(false);
      setTimeout(() => {
        if (newErrors.length > 0) {
          const firstErrorId = `fnd-${newErrors[0].index}-${newErrors[0].field}`;
          const el = document.getElementById(firstErrorId);
          if (el) el.focus();
        }
      }, 100);
      return;
    }

    try {
      await api.saveHallazgos(activeProject.id, validData);
      
      if (validData.length === 0) {
         setFindings([{ problema: '', evidencia: '', frecuencia: '', severidad: '', recomendacion: '', prioridad: '', estado: '' }]);
      } else {
         setFindings(validData);
      }

      reloadProgress();
      setErrors([]);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Hallazgos guardados correctamente');
    } catch (e) {
      console.error(e);
      toast.error('Error guardando los hallazgos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (!activeProject) {
      toast.info('Por favor selecciona o crea un proyecto primero.');
      return;
    }
    setIsEditing(true);
    setTimeout(() => document.getElementById('fnd-0-problema')?.focus(), 80);
  };

  const handleCancel = () => {
    setConfirmDiscardChanges(true);
  };

  const isInsufficientInfo = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length < 5;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Alta':
        return 'bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error-light)]';
      case 'Media':
        return 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]';
      case 'Baja':
        return 'bg-[var(--color-bg-secondary)] text-[var(--color-success)] border border-[var(--color-success-light)]';
      default:
        return 'bg-card text-body border border-default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error-light)]';
      case 'Media':
        return 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]';
      case 'Baja':
        return 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)]';
      default:
        return 'bg-card text-body border border-default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resuelto':
        return 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)]';
      case 'En progreso':
        return 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-light)]';
      case 'Pendiente':
        return 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]';
      default:
        return 'bg-card text-body border border-default';
    }
  };

  const getStatusBadgeContent = (status: string) => {
    switch (status) {
      case 'Resuelto':
        return {
          label: 'Resuelto',
          icon: <IconCircleCheck className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)]'
        };
      case 'En progreso':
        return {
          label: 'En progreso',
          icon: <IconRefresh className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary-light)]'
        };
      case 'Pendiente':
        return {
          label: 'Pendiente',
          icon: <IconClock className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]'
        };
      default:
        return {
          label: 'Sin estado',
          icon: null,
          className: 'bg-card text-body border border-default'
        };
    }
  };

  const getSeverityBadgeContent = (severity: string) => {
    switch (severity) {
      case 'Alta':
        return {
          label: 'ALTA',
          icon: <IconBell className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error-light)]'
        };
      case 'Media':
        return {
          label: 'MEDIA',
          icon: <IconAlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning-light)]'
        };
      case 'Baja':
        return {
          label: 'BAJA',
          icon: <IconCircleCheck className="w-3.5 h-3.5" color="currentColor" aria-hidden="true" />,
          className: 'bg-[var(--color-bg-secondary)] text-[var(--color-success)] border border-[var(--color-success-light)]'
        };
      default:
        return {
          label: 'Sin severidad',
          icon: null,
          className: 'bg-card text-body border border-default'
        };
    }
  };

  const getSeverityRowColor = (severity: string) => {
    switch (severity) {
      case 'Alta':
        return 'row-severity-alta';
      case 'Media':
        return 'row-severity-media';
      case 'Baja':
        return 'row-severity-baja';
      default:
        return 'table-row-interactive';
    }
  };

  const removeFinding = (index: number) => {
    setConfirmDelete({ open: true, index });
  };

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl">No hay proyecto seleccionado</h2>
        <p>Por favor selecciona o crea un proyecto en el menú lateral para continuar.</p>
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'} ${isLoading ? 'opacity-50' : ''}`}>
      <Breadcrumbs items={[
        { label: 'Proyectos' },
        { label: activeProject.nombre },
        { label: 'Hallazgos' }
      ]} />

      <header className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="page-title">
            Síntesis de hallazgos y plan de mejora - {activeProject.nombre}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Documenta problemas encontrados y sus recomendaciones
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 btn-editar"
            title="Editar hallazgo"
            aria-label="Editar hallazgo"
          >
            <IconPencil className="w-4 h-4" />
            <span className="hidden md:inline">Editar</span>
          </button>
        )}
      </header>

      <Stepper steps={getSteps()} />

      {isEditing && (
        <div className="mb-4 edit-mode-banner" role="status" aria-live="polite">
          Modo de edición activado
        </div>
      )}

      <Card title="Hallazgos y recomendaciones">
        <div className="design-table-container">
          <table className="design-table" aria-describedby="hallazgos-caption">
            <caption id="hallazgos-caption" className="sr-only">Tabla de hallazgos y recomendaciones</caption>
            <thead>
              <tr>
                <th scope="col">
                  Problema
                </th>
                <th scope="col">
                  Evidencia observada
                </th>
                <th scope="col">
                  Frecuencia
                </th>
                <th scope="col">
                  Severidad
                </th>
                <th scope="col">
                  Recomendación
                </th>
                <th scope="col">
                  Prioridad
                </th>
                <th scope="col" style={{ minWidth: '120px' }}>
                  Estado
                </th>
                {isEditing && (
                  <th scope="col" className="text-center" style={{ width: '48px' }}>
                    Acción
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
               {findings.map((finding, index) => {
                 const isExpanded = !!expandedRows[index];

                 return (
                 <React.Fragment key={index}>
                    <tr 
                      className={`${getSeverityRowColor(finding.severidad)} cursor-pointer`}
                      onClick={(e) => {
                        const tagName = (e.target as HTMLElement).tagName.toLowerCase();
                        if (['input', 'select', 'textarea', 'button', 'path', 'svg'].includes(tagName)) {
                          return;
                        }
                        toggleRow(index);
                      }}
                    >
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(index);
                            }}
                            className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 250ms ease'
                            }}
                            aria-label="Expandir detalles"
                          >
                            <IconChevronDown size={13} className="text-gray-500" />
                          </button>
                          <textarea
                            id={`fnd-${index}-problema`}
                            value={finding.problema}
                            onChange={(e) => handleChange(index, 'problema', e.target.value)}
                            disabled={!isEditing}
                            className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'problema') ? 'is-error' : ''} ${finding.problema ? 'is-filled' : ''}`}
                            placeholder="Describe el problema..."
                            rows={2}
                            aria-label={`Problema hallazgo ${index + 1}`}
                          />
                        </div>
                        {isEditing && isInsufficientInfo(finding.problema) && (
                          <span className="mt-1 block text-xs font-medium text-red-700">Informacion insuficiente</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <textarea
                            id={`fnd-${index}-evidencia`}
                            value={finding.evidencia}
                            onChange={(e) => handleChange(index, 'evidencia', e.target.value)}
                            className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${errors.some(e => e.index === index && e.field === 'evidencia') ? 'is-error' : ''} ${finding.evidencia ? 'is-filled' : ''}`}
                            placeholder="Qué se observó..."
                            rows={2}
                            aria-label={`Evidencia hallazgo ${index + 1}`}
                          />
                        ) : (
                          <span className="table-cell-truncate" title={finding.evidencia}>{finding.evidencia || '—'}</span>
                        )}
                      </td>
                      <td>
                        <input
                          id={`fnd-${index}-frecuencia`}
                          type="text"
                          value={finding.frecuencia}
                          onChange={(e) => handleChange(index, 'frecuencia', e.target.value)}
                          disabled={!isEditing}
                          className={`form-input w-full px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'frecuencia') ? 'is-error' : ''} ${finding.frecuencia ? 'is-filled' : ''}`}
                          placeholder="4/5"
                          aria-label={`Frecuencia hallazgo ${index + 1}`}
                        />
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            id={`fnd-${index}-severidad`}
                            value={finding.severidad}
                            onChange={(e) => handleChange(index, 'severidad', e.target.value)}
                            disabled={!isEditing}
                            className={`form-input w-full px-2 py-1 text-sm font-semibold ${!isEditing ? 'is-disabled' : ''} ${getSeverityColor(finding.severidad)} ${errors.some(e => e.index === index && e.field === 'severidad') ? 'is-error' : ''} ${finding.severidad ? 'is-filled' : ''}`}
                            style={{ transition: 'background-color 200ms ease, color 200ms ease, border-color var(--transition-fast)' }}
                            aria-label={`Severidad hallazgo ${index + 1}`}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Alta" className="option-alta">Alta</option>
                            <option value="Media" className="option-media">Media</option>
                            <option value="Baja" className="option-baja">Baja</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${getSeverityBadgeContent(finding.severidad).className}`}>
                            {getSeverityBadgeContent(finding.severidad).icon}
                            {getSeverityBadgeContent(finding.severidad).label}
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <textarea
                            id={`fnd-${index}-recomendacion`}
                            value={finding.recomendacion}
                            onChange={(e) => handleChange(index, 'recomendacion', e.target.value)}
                            className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${errors.some(e => e.index === index && e.field === 'recomendacion') ? 'is-error' : ''} ${finding.recomendacion ? 'is-filled' : ''}`}
                            placeholder="Solución propuesta..."
                            rows={2}
                            aria-label={`Recomendación hallazgo ${index + 1}`}
                          />
                        ) : (
                          <span className="table-cell-truncate" title={finding.recomendacion}>{finding.recomendacion || '—'}</span>
                        )}
                      </td>
                      <td>
                        <select
                          id={`fnd-${index}-prioridad`}
                          value={finding.prioridad}
                          onChange={(e) => handleChange(index, 'prioridad', e.target.value)}
                          disabled={!isEditing}
                          className={`form-input w-full px-2 py-1 text-sm font-semibold ${!isEditing ? 'is-disabled' : ''} ${getPriorityColor(finding.prioridad)} ${errors.some(e => e.index === index && e.field === 'prioridad') ? 'is-error' : ''} ${finding.prioridad ? 'is-filled' : ''}`}
                          aria-label={`Prioridad hallazgo ${index + 1}`}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Alta">Alta</option>
                          <option value="Media">Media</option>
                          <option value="Baja">Baja</option>
                        </select>
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            id={`fnd-${index}-estado`}
                            value={finding.estado}
                            onChange={(e) => handleChange(index, 'estado', e.target.value)}
                            className={`form-input w-full px-2 py-1 text-sm font-semibold ${getStatusColor(finding.estado)} ${errors.some(e => e.index === index && e.field === 'estado') ? 'is-error' : ''} ${finding.estado ? 'is-filled' : ''}`}
                            aria-label={`Estado hallazgo ${index + 1}`}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En progreso">En progreso</option>
                            <option value="Resuelto">Resuelto</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${getStatusBadgeContent(finding.estado).className}`}>
                            {getStatusBadgeContent(finding.estado).icon}
                            {getStatusBadgeContent(finding.estado).label}
                          </span>
                        )}
                      </td>
                      {isEditing && (
                        <td className="text-center">
                          <button
                            onClick={() => removeFinding(index)}
                            className="btn-danger-icon"
                            title={`Eliminar hallazgo ${index + 1}`}
                            aria-label={`Eliminar hallazgo ${index + 1}`}
                          >
                            <IconTrash size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
 
                    {/* Expandable detail row */}
                    <tr className={isExpanded ? 'bg-blue-50/10' : 'hidden'}>
                      <td colSpan={isEditing ? 8 : 7} className="p-0 border-none">
                        <div 
                          className="overflow-hidden"
                          style={{
                            maxHeight: isExpanded ? '600px' : '0px',
                            opacity: isExpanded ? 1 : 0,
                            transition: 'max-height 250ms ease-in-out, opacity 250ms ease-in-out'
                          }}
                        >
                          <div className="obs-detail">
                            <h4 className="obs-detail-title">Detalles — {finding.problema ? finding.problema.slice(0, 60) + (finding.problema.length > 60 ? '...' : '') : `Hallazgo ${index + 1}`}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mt-3 border-t pt-3 border-[var(--color-border)]">
                              <div className="space-y-2">
                                <p className="whitespace-pre-wrap"><span className="font-semibold text-body">Problema:</span><br />{finding.problema || 'Sin registrar'}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="whitespace-pre-wrap"><span className="font-semibold text-body">Evidencia observada:</span><br />{finding.evidencia || 'Sin registrar'}</p>
                                <p><span className="font-semibold text-body">Frecuencia:</span> {finding.frecuencia || 'Sin registrar'}</p>
                                <p><span className="font-semibold text-body">Severidad:</span> {finding.severidad || 'Sin registrar'}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="whitespace-pre-wrap"><span className="font-semibold text-body">Recomendación:</span><br />{finding.recomendacion || 'Sin registrar'}</p>
                                <p><span className="font-semibold text-body">Prioridad:</span> {finding.prioridad || 'Sin registrar'}</p>
                                <p><span className="font-semibold text-body">Estado:</span> {finding.estado || 'Sin registrar'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                 </React.Fragment>
                 );
               })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {findings.length === 0 ? 'No hay hallazgos' : 
             findings.length === 1 ? '1 hallazgo registrado' : 
             `${findings.length} hallazgos registrados`}
          </div>
          {isEditing && (
            <button
              onClick={addFinding}
              className="btn-outline-primary"
            >
              <IconPlus size={16} className="w-4 h-4" />
              <span className="font-medium">Agregar hallazgo</span>
            </button>
          )}
        </div>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 bg-secondary text-secondary rounded-lg transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-white'}`}
          >
            <IconX size={16} className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 bg-[var(--color-sidebar)] text-white text-lg font-medium rounded-lg shadow-sm transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[var(--color-primary-hover)]'}`}
          >
            {isSaving ? (
              <>
                <IconLoader2 size={20} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <IconDeviceFloppy size={16} className="w-5 h-5" />
                Guardar
              </>
            )}
          </button>
        </div>
      )}

      {/* Resumen de hallazgos críticos */}
      <h2 className="sr-only">Resumen de hallazgos críticos</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hallazgo-indicator-card hallazgo-indicator-card--alta bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-6">
          <div className="hallazgo-indicator-icon hallazgo-indicator-icon--alta flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600">
             <IconBell className="w-10 h-10" />
          </div>
          <div>
            <p className="text-4xl font-bold text-red-800 leading-none mb-2">
              {findings.filter((f) => f.severidad === 'Alta').length}
            </p>
            <h3 className="font-semibold text-gray-900">Severidad Alta</h3>
            <p className="text-sm text-gray-700">Problemas críticos</p>
          </div>
        </div>

        <div className="hallazgo-indicator-card hallazgo-indicator-card--media bg-orange-50 border border-orange-200 rounded-lg p-6 flex items-center gap-6">
          <div className="hallazgo-indicator-icon hallazgo-indicator-icon--media flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 text-orange-600">
             <IconAlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <p className="text-4xl font-bold text-orange-800 leading-none mb-2">
              {findings.filter((f) => f.severidad === 'Media').length}
            </p>
            <h3 className="font-semibold text-gray-900">Severidad Media</h3>
            <p className="text-sm text-gray-700">Problemas moderados</p>
          </div>
        </div>

        <div className="hallazgo-indicator-card hallazgo-indicator-card--baja rounded-lg p-6 flex items-center gap-6 border bg-[var(--color-bg-card)] border-[var(--color-border)]">
          <div className="hallazgo-indicator-icon hallazgo-indicator-icon--baja flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-success-light)] text-[var(--color-success)]">
             <IconCheck className="w-10 h-10" color="currentColor" aria-hidden="true" />
          </div>
          <div>
            <p className="text-4xl font-bold text-[var(--color-text)] leading-none mb-2">
              {findings.filter((f) => f.severidad === 'Baja').length}
            </p>
            <h3 className="font-semibold text-[var(--color-text)]">Severidad Baja</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Mejoras menores</p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete.open}
        title="Eliminar hallazgo"
        message="¿Seguro que deseas eliminar este hallazgo?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setConfirmDelete({ open: false, index: -1 })}
        onConfirm={() => {
          if (confirmDelete.index < 0) return;
          setFindings(findings.filter((_, i) => i !== confirmDelete.index));
          setConfirmDelete({ open: false, index: -1 });
        }}
      />

      <ConfirmModal
        open={confirmDiscardChanges}
        title="Descartar cambios"
        message="¿Seguro que deseas descartar los cambios?"
        confirmText="Descartar"
        cancelText="Volver"
        onCancel={() => setConfirmDiscardChanges(false)}
        onConfirm={() => {
          setConfirmDiscardChanges(false);
          setIsEditing(false);
          if (activeProject) loadData(activeProject.id);
        }}
      />
    </div>
  );
}