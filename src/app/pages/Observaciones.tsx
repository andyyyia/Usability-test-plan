import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { IconPencil, IconX, IconTrash, IconDeviceFloppy, IconPlus, IconLoader2, IconChevronDown, IconBell, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Stepper } from '../components/Stepper';
import { useProjectProgress } from '../hooks/useProjectProgress';

interface Observation {
  participante: string;
  perfil: string;
  tarea: string;
  exito: string;
  tiempo: string;
  errores: string;
  comentarios: string;
  problema: string;
  severidad: string;
  mejora: string;
}

export function Observaciones() {
  const { activeProject } = useProject();
  const { setUnsavedChanges } = useUnsavedChanges();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ index: number; field: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; index: number }>({ open: false, index: -1 });
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const { getSteps, reloadProgress } = useProjectProgress(activeProject?.id);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (activeProject) {
      loadData(activeProject.id);
    } else {
      setObservations([]);
    }
  }, [activeProject]);

  useEffect(() => {
    const hasPendingChanges = isEditing && !isSaving;
    setUnsavedChanges('observaciones', hasPendingChanges);

    return () => {
      setUnsavedChanges('observaciones', false);
    };
  }, [isEditing, isSaving, setUnsavedChanges]);

  const loadData = async (projectId: number) => {
    setIsLoading(true);
    let hasData = false;
    try {
      const data = await api.getObservaciones(projectId);

      if (data && data.length > 0) {
        hasData = true;
        setObservations(data);
      } else {
        setObservations([{ participante: '', perfil: '', tarea: '', exito: '', tiempo: '', errores: '', comentarios: '', problema: '', severidad: '', mejora: '' }]);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    setIsEditing(!hasData);
  };

  const handleChange = (index: number, field: keyof Observation, value: string) => {
    if (!isEditing) return;
    const newObservations = [...observations];
    newObservations[index] = { ...newObservations[index], [field]: value };
    setObservations(newObservations);
  };

  const addObservation = () => {
    const newObservations = [
      ...observations,
      {
        participante: '',
        perfil: '',
        tarea: '',
        exito: '',
        tiempo: '',
        errores: '',
        comentarios: '',
        problema: '',
        severidad: '',
        mejora: '',
      },
    ];
    setObservations(newObservations);
    setCurrentPage(Math.ceil(newObservations.length / itemsPerPage));
  };

  const deleteObservation = (index: number) => {
    setConfirmDelete({ open: true, index });
  };

  const handleSave = async () => {
    if (!activeProject) {
      toast.info('Por favor selecciona o crea un proyecto primero.');
      return;
    }
    setIsSaving(true);

    const newErrors: { index: number; field: string }[] = [];
    const cleanRowsIndexes = new Set<number>();

    observations.forEach((o, index) => {
      const tiempoStr = String(o.tiempo).trim();
      const erroresStr = String(o.errores).trim();

      const isEmpty = !o.participante.trim() && !o.perfil.trim() && !o.tarea.trim() && !o.exito.trim() && 
                      !tiempoStr && !erroresStr && !o.comentarios.trim() && !o.problema.trim() && 
                      !o.severidad.trim() && !o.mejora.trim();
      
      if (isEmpty) {
        cleanRowsIndexes.add(index);
        return;
      }

      if (!o.participante.trim()) newErrors.push({ index, field: 'participante' });
      if (!o.perfil.trim()) newErrors.push({ index, field: 'perfil' });
      if (!o.tarea.trim()) newErrors.push({ index, field: 'tarea' });
      if (!o.exito.trim()) newErrors.push({ index, field: 'exito' });

      if (!tiempoStr || Number(tiempoStr) < 0 || Number(tiempoStr) > 36000) newErrors.push({ index, field: 'tiempo' });
      if (!erroresStr || Number(erroresStr) < 0 || Number(erroresStr) > 100) newErrors.push({ index, field: 'errores' });

      if (!o.comentarios.trim()) newErrors.push({ index, field: 'comentarios' });
      if (!o.problema.trim()) newErrors.push({ index, field: 'problema' });
      if (!o.severidad.trim()) newErrors.push({ index, field: 'severidad' });
      if (!o.mejora.trim()) newErrors.push({ index, field: 'mejora' });
    });
    setErrors(newErrors);

    const validData = observations.filter((_, i) => !cleanRowsIndexes.has(i));

    if (validData.length > 0 && newErrors.length > 0) {
      toast.error('Validación', { description: 'Hay filas parcialmente llenas o valores inválidos. Excesos de tiempo (>10 horas) o errores (>100) no permitidos.' });
      setIsSaving(false);
      setTimeout(() => {
        if (newErrors.length > 0) {
          const firstErrorId = `obs-${newErrors[0].index}-${newErrors[0].field}`;
          const el = document.getElementById(firstErrorId);
          if (el) el.focus();
        }
      }, 100);
      return;
    }

    try {
      await api.saveObservaciones(activeProject.id, validData);
      
      if (validData.length === 0) {
        setObservations([{ participante: '', perfil: '', tarea: '', exito: '', tiempo: '', errores: '', comentarios: '', problema: '', severidad: '', mejora: '' }]);
      } else {
        setObservations(validData);
      }

      reloadProgress();
      setErrors([]);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Observaciones guardadas correctamente');
    } catch (e) {
      console.error(e);
      toast.error('Error guardando las observaciones');
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
    setTimeout(() => document.getElementById('obs-0-participante')?.focus(), 80);
  };

  const handleCancel = () => {
    setConfirmDiscardChanges(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
          icon: <IconCircleCheck className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)]'
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

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl">No hay proyecto seleccionado</h2>
        <p>Por favor selecciona o crea un proyecto en el menú lateral para continuar.</p>
      </div>
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentObservations = observations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(observations.length / itemsPerPage);  return (
    <div className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'} ${isLoading ? 'opacity-50' : ''}`}>
      <Breadcrumbs items={[
        { label: 'Proyectos' },
        { label: activeProject.nombre },
        { label: 'Observaciones' }
      ]} />

      <header className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="page-title">
            Registro de observación - {activeProject.nombre}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Documenta las observaciones durante las pruebas
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn-editar"
            aria-label="Editar observaciones"
          >
            <IconPencil size={16} className="w-4 h-4" />
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

      <Card title="Observaciones del test">
        <div className="design-table-container" style={{ overflowX: 'auto' }}>
          <table className="design-table" aria-describedby="observaciones-caption" style={{ minWidth: 1260 }}>
            <caption id="observaciones-caption" className="sr-only">Tabla de observaciones detalladas del test</caption>
            <colgroup>
              <col style={{ width: 160 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 170 }} />
              {isEditing && <col style={{ width: 56 }} />}
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Participante</th>
                <th scope="col">Perfil</th>
                <th scope="col">Tarea</th>
                <th scope="col">Éxito</th>
                <th scope="col">Tiempo (seg)</th>
                <th scope="col">Errores</th>
                <th scope="col">Comentarios clave</th>
                <th scope="col">Problema detectado</th>
                <th scope="col">Severidad</th>
                <th scope="col">Mejora propuesta</th>
                {isEditing && (
                  <th scope="col" className="text-center">Acción</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentObservations.map((obs, localIndex) => {
                const index = indexOfFirstItem + localIndex;
                const isExpanded = !!expandedRows[index];

                return (
                <React.Fragment key={index}>
                  <tr 
                    className={`${getSeverityRowColor(obs.severidad)} cursor-pointer`}
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
                        <input
                          id={`obs-${index}-participante`}
                          type="text"
                          value={obs.participante}
                          onChange={(e) => handleChange(index, 'participante', e.target.value)}
                          disabled={!isEditing}
                          className={`form-input w-full px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'participante') ? 'is-error' : ''} ${obs.participante ? 'is-filled' : ''}`}
                          placeholder="Usuario 1"
                          aria-label={`Participante fila ${index + 1}`}
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        id={`obs-${index}-perfil`}
                        type="text"
                        value={obs.perfil}
                        onChange={(e) => handleChange(index, 'perfil', e.target.value)}
                        disabled={!isEditing}
                        className={`form-input w-full px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'perfil') ? 'is-error' : ''} ${obs.perfil ? 'is-filled' : ''}`}
                        placeholder="Avanzado"
                        aria-label={`Perfil fila ${index + 1}`}
                      />
                    </td>
                    <td>
                      <input
                        id={`obs-${index}-tarea`}
                        type="text"
                        value={obs.tarea}
                        onChange={(e) => handleChange(index, 'tarea', e.target.value)}
                        disabled={!isEditing}
                        className={`form-input w-full px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'tarea') ? 'is-error' : ''} ${obs.tarea ? 'is-filled' : ''}`}
                        placeholder="T1"
                        aria-label={`Tarea fila ${index + 1}`}
                      />
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          id={`obs-${index}-exito`}
                          value={obs.exito}
                          onChange={(e) => handleChange(index, 'exito', e.target.value)}
                          className={`form-input w-full px-2 py-1 text-sm ${errors.some(e => e.index === index && e.field === 'exito') ? 'is-error' : ''} ${obs.exito ? 'is-filled' : ''}`}
                          aria-label={`Éxito fila ${index + 1}`}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Sí">Sí</option>
                          <option value="Con ayuda">Con ayuda</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          obs.exito === 'No' ? 'badge-error' :
                          obs.exito === 'Con ayuda' ? 'badge-warning' :
                          obs.exito === 'Sí' ? 'badge-success' :
                          'text-muted'
                        }`}>
                          {obs.exito || '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        id={`obs-${index}-tiempo`}
                        type="number"
                        min="0"
                        max="36000"
                        value={obs.tiempo}
                        onChange={(e) => handleChange(index, 'tiempo', e.target.value)}
                        disabled={!isEditing}
                        className={`form-input w-full px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'tiempo') ? 'is-error' : ''} ${obs.tiempo ? 'is-filled' : ''}`}
                        placeholder="120"
                        aria-label={`Tiempo fila ${index + 1}`}
                      />
                    </td>
                    <td>
                      <input
                        id={`obs-${index}-errores`}
                        type="number"
                        min="0"
                        max="100"
                        value={obs.errores}
                        onChange={(e) => handleChange(index, 'errores', e.target.value)}
                        disabled={!isEditing}
                        className={`form-input w-full px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'errores') ? 'is-error' : ''} ${obs.errores ? 'is-filled' : ''}`}
                        placeholder="2"
                        aria-label={`Errores fila ${index + 1}`}
                      />
                    </td>
                    <td>
                      {isEditing ? (
                        <textarea
                          id={`obs-${index}-comentarios`}
                          value={obs.comentarios}
                          onChange={(e) => handleChange(index, 'comentarios', e.target.value)}
                          className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${errors.some(e => e.index === index && e.field === 'comentarios') ? 'is-error' : ''} ${obs.comentarios ? 'is-filled' : ''}`}
                          placeholder="Comentarios..."
                          rows={1}
                          aria-label={`Comentarios fila ${index + 1}`}
                        />
                      ) : (
                        <span className="table-cell-truncate" title={obs.comentarios}>{obs.comentarios || '—'}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <textarea
                          id={`obs-${index}-problema`}
                          value={obs.problema}
                          onChange={(e) => handleChange(index, 'problema', e.target.value)}
                          className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${errors.some(e => e.index === index && e.field === 'problema') ? 'is-error' : ''} ${obs.problema ? 'is-filled' : ''}`}
                          placeholder="Problema..."
                          rows={1}
                          aria-label={`Problema fila ${index + 1}`}
                        />
                      ) : (
                        <span className="table-cell-truncate" title={obs.problema}>{obs.problema || '—'}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          id={`obs-${index}-severidad`}
                          value={obs.severidad}
                          onChange={(e) => handleChange(index, 'severidad', e.target.value)}
                          className={`form-input w-full px-2 py-1 text-sm font-semibold ${getSeverityColor(obs.severidad)} ${errors.some(e => e.index === index && e.field === 'severidad') ? 'is-error' : ''} ${obs.severidad ? 'is-filled' : ''}`}
                          style={{ transition: 'background-color 200ms ease, color 200ms ease' }}
                          aria-label={`Severidad fila ${index + 1}`}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Alta">Alta</option>
                          <option value="Media">Media</option>
                          <option value="Baja">Baja</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${getSeverityBadgeContent(obs.severidad).className}`}>
                          {getSeverityBadgeContent(obs.severidad).icon}
                          {getSeverityBadgeContent(obs.severidad).label}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <textarea
                          id={`obs-${index}-mejora`}
                          value={obs.mejora}
                          onChange={(e) => handleChange(index, 'mejora', e.target.value)}
                          className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${errors.some(e => e.index === index && e.field === 'mejora') ? 'is-error' : ''} ${obs.mejora ? 'is-filled' : ''}`}
                          placeholder="Mejora..."
                          rows={1}
                          aria-label={`Mejora fila ${index + 1}`}
                        />
                      ) : (
                        <span className="table-cell-truncate" title={obs.mejora}>{obs.mejora || '—'}</span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="text-center">
                        <button
                          onClick={() => deleteObservation(index)}
                          className="btn-danger-icon"
                          aria-label={`Eliminar observación ${index + 1}`}
                          title="Eliminar observación"
                        >
                          <IconTrash size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                  
                  {/* Expandable detail row */}
                  <tr className={isExpanded ? 'bg-blue-50/10' : 'hidden'}>
                    <td colSpan={isEditing ? 11 : 10} className="p-0 border-none">
                      <div 
                        className="overflow-hidden"
                        style={{
                          maxHeight: isExpanded ? '600px' : '0px',
                          opacity: isExpanded ? 1 : 0,
                          transition: 'max-height 250ms ease-in-out, opacity 250ms ease-in-out'
                        }}
                      >
                        <div className="obs-detail">
                          <h4 className="obs-detail-title">Detalles — {obs.participante || `Participante ${index + 1}`}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mt-3 border-t pt-3 border-[var(--color-border)]">
                            <div className="space-y-2">
                              <p><span className="font-semibold text-body">Participante:</span> {obs.participante || 'Sin registrar'}</p>
                              <p><span className="font-semibold text-body">Perfil:</span> {obs.perfil || 'Sin registrar'}</p>
                              <p><span className="font-semibold text-body">Tarea:</span> {obs.tarea || 'Sin registrar'}</p>
                              <p><span className="font-semibold text-body">Éxito:</span> {obs.exito || 'Sin registrar'}</p>
                              <p><span className="font-semibold text-body">Tiempo:</span> {obs.tiempo ? `${obs.tiempo} seg` : 'Sin registrar'}</p>
                              <p><span className="font-semibold text-body">Errores:</span> {obs.errores !== '' ? obs.errores : 'Sin registrar'}</p>
                            </div>
                            <div className="space-y-2">
                              <p><span className="font-semibold text-body">Severidad:</span> {obs.severidad || 'Sin registrar'}</p>
                              <p className="whitespace-pre-wrap"><span className="font-semibold text-body">Comentarios clave:</span><br />{obs.comentarios || 'Sin registrar'}</p>
                            </div>
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap"><span className="font-semibold text-body">Problema detectado:</span><br />{obs.problema || 'Sin registrar'}</p>
                              <p className="whitespace-pre-wrap"><span className="font-semibold text-body">Mejora propuesta:</span><br />{obs.mejora || 'Sin registrar'}</p>
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
            {observations.length === 0 ? 'No hay observaciones' : 
             observations.length === 1 ? '1 observación registrada' : 
             `Mostrando ${indexOfFirstItem + 1} a ${Math.min(indexOfLastItem, observations.length)} de ${observations.length} observaciones`}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          {isEditing && (
            <button
              onClick={addObservation}
              className="btn-outline-primary"
            >
              <IconPlus size={16} className="w-4 h-4" />
              Añadir registro
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
                Guardar observaciones completas
              </>
            )}
          </button>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete.open}
        title="Eliminar observación"
        message="¿Seguro que deseas eliminar esta observación?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setConfirmDelete({ open: false, index: -1 })}
        onConfirm={() => {
          if (confirmDelete.index < 0) return;
          const newObservations = observations.filter((_, i) => i !== confirmDelete.index);
          setObservations(newObservations);
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