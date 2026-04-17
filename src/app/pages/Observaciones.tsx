import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Plus, Save, Trash2, Edit2, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';

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
    setObservations([
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
    ]);
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

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl">No hay proyecto seleccionado</h2>
        <p>Por favor selecciona o crea un proyecto en el menú lateral para continuar.</p>
      </div>
    );
  }

  return (
    <div className={`p-8 ${isLoading ? 'opacity-50' : ''}`}>
      <div className="max-w-[1100px] mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de observación - {activeProject.nombre}</h1>
            <p className="text-gray-600 mt-1">Documenta las observaciones durante las pruebas</p>
          </div>
          <div className="flex gap-3">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>
        </header>

        <Card title="Observaciones del test">
          <div className="overflow-x-auto pb-4">
            <table className="w-full border-collapse" aria-describedby="observaciones-caption">
              <caption id="observaciones-caption" className="sr-only">Tabla de observaciones detalladas del test</caption>
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Participante
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Perfil
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Tarea
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Éxito
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Tiempo (seg)
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Errores
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Comentarios clave
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Problema detectado
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Severidad
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Mejora propuesta
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 w-32">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`obs-${index}-participante`}
                        type="text"
                        value={obs.participante}
                        onChange={(e) => handleChange(index, 'participante', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'participante') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Usuario 1"
                        aria-label={`Participante fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`obs-${index}-perfil`}
                        type="text"
                        value={obs.perfil}
                        onChange={(e) => handleChange(index, 'perfil', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'perfil') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Avanzado"
                        aria-label={`Perfil fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`obs-${index}-tarea`}
                        type="text"
                        value={obs.tarea}
                        onChange={(e) => handleChange(index, 'tarea', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'tarea') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="T1"
                        aria-label={`Tarea fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        id={`obs-${index}-exito`}
                        value={obs.exito}
                        onChange={(e) => handleChange(index, 'exito', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'exito') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        aria-label={`Éxito fila ${index + 1}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Sí">Sí</option>
                        <option value="Con ayuda">Con ayuda</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`obs-${index}-tiempo`}
                        type="number"
                        min="0"
                        max="36000"
                        value={obs.tiempo}
                        onChange={(e) => handleChange(index, 'tiempo', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full min-w-[80px] px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'tiempo') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="120"
                        aria-label={`Tiempo fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`obs-${index}-errores`}
                        type="number"
                        min="0"
                        max="100"
                        value={obs.errores}
                        onChange={(e) => handleChange(index, 'errores', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full min-w-[70px] px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'errores') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="2"
                        aria-label={`Errores fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        id={`obs-${index}-comentarios`}
                        value={obs.comentarios}
                        onChange={(e) => handleChange(index, 'comentarios', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent resize-none ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'comentarios') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Comentarios..."
                        rows={2}
                        aria-label={`Comentarios fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        id={`obs-${index}-problema`}
                        value={obs.problema}
                        onChange={(e) => handleChange(index, 'problema', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent resize-none ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'problema') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Problema..."
                        rows={2}
                        aria-label={`Problema fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        id={`obs-${index}-severidad`}
                        value={obs.severidad}
                        onChange={(e) => handleChange(index, 'severidad', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${!isEditing ? 'cursor-not-allowed opacity-70' : ''} ${getSeverityColor(obs.severidad)} ${errors.some(e => e.index === index && e.field === 'severidad') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        aria-label={`Severidad fila ${index + 1}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        id={`obs-${index}-mejora`}
                        value={obs.mejora}
                        onChange={(e) => handleChange(index, 'mejora', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent resize-none ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''} ${errors.some(e => e.index === index && e.field === 'mejora') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Mejora..."
                        rows={2}
                        aria-label={`Mejora fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing && (
                        <button
                          onClick={() => deleteObservation(index)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          aria-label={`Eliminar observación ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            {isEditing && (
              <button
                onClick={addObservation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
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
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-lg font-medium rounded-lg shadow-sm transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#152d47]'}`}
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Guardando...' : 'Guardar observaciones completas'}
            </button>
          </div>
        )}
      </div>

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