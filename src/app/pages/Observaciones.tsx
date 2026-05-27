import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { IconPencil, IconX, IconTrash, IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
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

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; index: number }>({ open: false, index: -1 });
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const { getSteps, reloadProgress } = useProjectProgress(activeProject?.id);

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
  };

  const handleCancel = () => {
    setConfirmDiscardChanges(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-orange-100 text-orange-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
  const totalPages = Math.ceil(observations.length / itemsPerPage);  return (
    <div className={isLoading ? 'opacity-50' : ''}>
      <Breadcrumbs items={[
        { label: 'Proyectos' },
        { label: activeProject.nombre },
        { label: 'Observaciones' }
      ]} />

      <header className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-black)', color: 'var(--color-text)', marginBottom: 'var(--space-1)', marginTop: 0 }}>
            Registro de observación - {activeProject.nombre}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Documenta las observaciones durante las pruebas
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 btn-editar"
          >
            <IconPencil size={16} className="w-4 h-4" />
            Editar
          </button>
        )}
      </header>

      <Stepper steps={getSteps()} />

      <Card title="Observaciones del test">
        <div className="design-table-container overflow-x-auto pb-4">
          <table className="design-table" aria-describedby="observaciones-caption">
            <caption id="observaciones-caption" className="sr-only">Tabla de observaciones detalladas del test</caption>
            <thead>
              <tr>
                <th scope="col">
                  Participante
                </th>
                <th scope="col">
                  Perfil
                </th>
                <th scope="col">
                  Tarea
                </th>
                <th scope="col">
                  Éxito
                </th>
                <th scope="col">
                  Tiempo (seg)
                </th>
                <th scope="col">
                  Errores
                </th>
                <th scope="col">
                  Comentarios clave
                </th>
                <th scope="col">
                  Problema detectado
                </th>
                <th scope="col">
                  Severidad
                </th>
                <th scope="col">
                  Mejora propuesta
                </th>
                <th scope="col" className="text-center w-32">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {currentObservations.map((obs, localIndex) => {
                const index = indexOfFirstItem + localIndex;
                return (
                <tr key={index} className={getSeverityRowColor(obs.severidad)}>
                  <td>
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
                    <select
                      id={`obs-${index}-exito`}
                      value={obs.exito}
                      onChange={(e) => handleChange(index, 'exito', e.target.value)}
                      disabled={!isEditing}
                      className={`form-input w-full px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'exito') ? 'is-error' : ''} ${obs.exito ? 'is-filled' : ''}`}
                      aria-label={`Éxito fila ${index + 1}`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Sí">Sí</option>
                      <option value="Con ayuda">Con ayuda</option>
                      <option value="No">No</option>
                    </select>
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
                      className={`form-input w-full min-w-[80px] px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'tiempo') ? 'is-error' : ''} ${obs.tiempo ? 'is-filled' : ''}`}
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
                      className={`form-input w-full min-w-[70px] px-2 py-1 text-sm bg-transparent ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'errores') ? 'is-error' : ''} ${obs.errores ? 'is-filled' : ''}`}
                      placeholder="2"
                      aria-label={`Errores fila ${index + 1}`}
                    />
                  </td>
                  <td>
                    <textarea
                      id={`obs-${index}-comentarios`}
                      value={obs.comentarios}
                      onChange={(e) => handleChange(index, 'comentarios', e.target.value)}
                      disabled={!isEditing}
                      className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'comentarios') ? 'is-error' : ''} ${obs.comentarios ? 'is-filled' : ''}`}
                      placeholder="Comentarios..."
                      rows={2}
                      aria-label={`Comentarios fila ${index + 1}`}
                    />
                  </td>
                  <td>
                    <textarea
                      id={`obs-${index}-problema`}
                      value={obs.problema}
                      onChange={(e) => handleChange(index, 'problema', e.target.value)}
                      disabled={!isEditing}
                      className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'problema') ? 'is-error' : ''} ${obs.problema ? 'is-filled' : ''}`}
                      placeholder="Problema..."
                      rows={2}
                      aria-label={`Problema fila ${index + 1}`}
                    />
                  </td>
                  <td>
                    <select
                      id={`obs-${index}-severidad`}
                      value={obs.severidad}
                      onChange={(e) => handleChange(index, 'severidad', e.target.value)}
                      disabled={!isEditing}
                      className={`form-input w-full px-2 py-1 text-sm font-semibold ${!isEditing ? 'is-disabled' : ''} ${getSeverityColor(obs.severidad)} ${errors.some(e => e.index === index && e.field === 'severidad') ? 'is-error' : ''} ${obs.severidad ? 'is-filled' : ''}`}
                      aria-label={`Severidad fila ${index + 1}`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Alta" className="option-alta">Alta</option>
                      <option value="Media" className="option-media">Media</option>
                      <option value="Baja" className="option-baja">Baja</option>
                    </select>
                  </td>
                  <td>
                    <textarea
                      id={`obs-${index}-mejora`}
                      value={obs.mejora}
                      onChange={(e) => handleChange(index, 'mejora', e.target.value)}
                      disabled={!isEditing}
                      className={`form-input w-full px-2 py-1 text-sm bg-transparent resize-none ${!isEditing ? 'is-disabled' : ''} ${errors.some(e => e.index === index && e.field === 'mejora') ? 'is-error' : ''} ${obs.mejora ? 'is-filled' : ''}`}
                      placeholder="Mejora..."
                      rows={2}
                      aria-label={`Mejora fila ${index + 1}`}
                    />
                  </td>
                  <td>
                    {isEditing && (
                      <button
                        onClick={() => deleteObservation(index)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        aria-label={`Eliminar observación ${index + 1}`}
                      >
                        <IconTrash size={16} className="w-4 h-4" />
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {observations.length === 0 ? 0 : indexOfFirstItem + 1} a {Math.min(indexOfLastItem, observations.length)} de {observations.length} registros
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
            className={`flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-300'}`}
          >
            <IconX size={16} className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-lg font-medium rounded-lg shadow-sm transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#152d47]'}`}
          >
            <IconDeviceFloppy size={16} className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar observaciones completas'}
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