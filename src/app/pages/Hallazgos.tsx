import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Plus, Save, Trash2, Pencil, X, BellRing, AlertTriangle, Check } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';

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

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; index: number }>({ open: false, index: -1 });
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);

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

      setErrors([]);
      setIsEditing(false);
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
        return 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]';
      case 'Media':
        return 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]';
      case 'Baja':
        return 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]';
      default:
        return 'bg-white text-gray-900 border border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-fuchsia-100 text-fuchsia-950 border border-fuchsia-300';
      case 'Media':
        return 'bg-amber-100 text-amber-950 border border-amber-300';
      case 'Baja':
        return 'bg-sky-100 text-sky-950 border border-sky-300';
      default:
        return 'bg-white text-gray-900 border border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resuelto':
        return 'bg-emerald-100 text-emerald-950 border border-emerald-300';
      case 'En progreso':
        return 'bg-blue-100 text-blue-950 border border-blue-300';
      case 'Pendiente':
        return 'bg-slate-100 text-slate-900 border border-slate-300';
      default:
        return 'bg-white text-gray-900 border border-gray-300';
    }
  };

  const getSeverityBadgeContent = (severity: string) => {
    switch (severity) {
      case 'Alta':
        return {
          label: 'ALTA',
          icon: <BellRing className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
        };
      case 'Media':
        return {
          label: 'MEDIA',
          icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
        };
      case 'Baja':
        return {
          label: 'BAJA',
          icon: <Check className="w-3.5 h-3.5" aria-hidden="true" />,
          className: 'bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]'
        };
      default:
        return {
          label: 'Sin severidad',
          icon: null,
          className: 'bg-gray-100 text-gray-800 border border-gray-300'
        };
    }
  };

  const getSeverityRowColor = (severity: string) => {
    switch (severity) {
      case 'Alta':
        return 'bg-[#FEF2F2] hover:bg-[#FEE2E2]';
      case 'Media':
        return 'bg-[#FFFBEB] hover:bg-[#FEF3C7]';
      case 'Baja':
        return 'bg-[#F0FDF4] hover:bg-[#DCFCE7]';
      default:
        return 'hover:bg-gray-50';
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
    <div className={`p-8 ${isLoading ? 'opacity-50' : ''}`}>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Síntesis de hallazgos y plan de mejora - {activeProject.nombre}</h1>
            <p className="mt-1 text-gray-800">Documenta problemas encontrados y sus recomendaciones</p>
          </div>
          <div className="flex gap-3">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center rounded-md border border-blue-300 p-2 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                title="Editar hallazgo"
                aria-label="Editar hallazgo"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900" role="status" aria-live="polite">
            Modo de edicion activado
          </div>
        )}

        <Card title="Hallazgos y recomendaciones">
          <div className="overflow-x-auto pb-4">
            <table className="w-full border-collapse" aria-describedby="hallazgos-caption">
              <caption id="hallazgos-caption" className="sr-only">Tabla de hallazgos y recomendaciones</caption>
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[200px]">
                    Problema
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Evidencia observada
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[100px]">
                    Frecuencia
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[120px]">
                    Severidad
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Recomendación
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[120px]">
                    Prioridad
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[130px]">
                    Estado
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 w-16">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {findings.map((finding, index) => (
                  <tr key={index} className={getSeverityRowColor(finding.severidad)}>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        id={`fnd-${index}-problema`}
                        value={finding.problema}
                        onChange={(e) => handleChange(index, 'problema', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent resize-none ${!isEditing ? 'text-gray-800 cursor-not-allowed border-transparent' : 'border-gray-200 text-gray-900'} ${isInsufficientInfo(finding.problema) ? 'border-red-300 bg-red-50 ring-1 ring-red-200' : ''} ${errors.some(e => e.index === index && e.field === 'problema') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Describe el problema..."
                        rows={2}
                        aria-label={`Problema hallazgo ${index + 1}`}
                      />
                      {isEditing && isInsufficientInfo(finding.problema) && (
                        <span className="mt-1 block text-xs font-medium text-red-700">Informacion insuficiente</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        id={`fnd-${index}-evidencia`}
                        value={finding.evidencia}
                        onChange={(e) => handleChange(index, 'evidencia', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent resize-none ${!isEditing ? 'text-gray-800 cursor-not-allowed' : 'text-gray-900'} ${errors.some(e => e.index === index && e.field === 'evidencia') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        rows={2}
                        placeholder="Qué se observó..."
                        aria-label={`Evidencia hallazgo ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`fnd-${index}-frecuencia`}
                        type="text"
                        value={finding.frecuencia}
                        onChange={(e) => handleChange(index, 'frecuencia', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent ${!isEditing ? 'text-gray-900 cursor-not-allowed' : 'text-gray-900'} ${errors.some(e => e.index === index && e.field === 'frecuencia') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="4/5"
                        aria-label={`Frecuencia hallazgo ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing ? (
                        <select
                          id={`fnd-${index}-severidad`}
                          value={finding.severidad}
                          onChange={(e) => handleChange(index, 'severidad', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:border-transparent rounded font-semibold ${!isEditing ? 'cursor-not-allowed' : ''} ${getSeverityColor(finding.severidad)} ${errors.some(e => e.index === index && e.field === 'severidad') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                          aria-label={`Severidad hallazgo ${index + 1}`}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Alta">Alta</option>
                          <option value="Media">Media</option>
                          <option value="Baja">Baja</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${getSeverityBadgeContent(finding.severidad).className}`}>
                          {getSeverityBadgeContent(finding.severidad).icon}
                          {getSeverityBadgeContent(finding.severidad).label}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        id={`fnd-${index}-recomendacion`}
                        value={finding.recomendacion}
                        onChange={(e) => handleChange(index, 'recomendacion', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border focus:outline-none focus:ring-2 focus:border-transparent rounded bg-transparent resize-none ${!isEditing ? 'text-gray-800 cursor-not-allowed border-transparent' : 'border-gray-200 text-gray-900'} ${isInsufficientInfo(finding.recomendacion) ? 'border-red-300 bg-red-50 ring-1 ring-red-200' : ''} ${errors.some(e => e.index === index && e.field === 'recomendacion') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        rows={2}
                        placeholder="Solución propuesta..."
                        aria-label={`Recomendación hallazgo ${index + 1}`}
                      />
                      {isEditing && isInsufficientInfo(finding.recomendacion) && (
                        <span className="mt-1 block text-xs font-medium text-red-700">Informacion insuficiente</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        id={`fnd-${index}-prioridad`}
                        value={finding.prioridad}
                        onChange={(e) => handleChange(index, 'prioridad', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded font-semibold ${!isEditing ? 'cursor-not-allowed' : ''} ${getPriorityColor(finding.prioridad)} ${errors.some(e => e.index === index && e.field === 'prioridad') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        aria-label={`Prioridad hallazgo ${index + 1}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        id={`fnd-${index}-estado`}
                        value={finding.estado}
                        onChange={(e) => handleChange(index, 'estado', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded font-semibold ${!isEditing ? 'cursor-not-allowed' : ''} ${getStatusColor(finding.estado)} ${errors.some(e => e.index === index && e.field === 'estado') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        aria-label={`Estado hallazgo ${index + 1}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En progreso">En progreso</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing && (
                        <button
                          onClick={() => removeFinding(index)}
                          className="inline-flex items-center justify-center rounded-md border border-red-300 p-2 text-red-700 hover:bg-red-50 hover:border-red-400 transition-colors"
                          title={`Eliminar hallazgo ${index + 1}`}
                          aria-label={`Eliminar hallazgo ${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
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
                onClick={addFinding}
                className="inline-flex items-center justify-center rounded-md border border-blue-300 p-2 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                title="Anadir hallazgo"
                aria-label="Anadir hallazgo"
              >
                <Plus className="w-4 h-4" />
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
              className={`inline-flex items-center justify-center rounded-md border border-[#1E3A5F] p-3 text-[#1E3A5F] transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#1E3A5F] hover:text-white'}`}
              title="Guardar cambios"
              aria-label="Guardar cambios"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Resumen de hallazgos críticos */}
        <h2 className="sr-only">Resumen de hallazgos críticos</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900">Severidad Alta</h3>
            </div>
            <p className="text-3xl font-bold text-red-800">
              {findings.filter((f) => f.severidad === 'Alta').length}
            </p>
            <p className="mt-1 text-sm text-gray-800">Problemas críticos</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900">Severidad Media</h3>
            </div>
            <p className="text-3xl font-bold text-orange-800">
              {findings.filter((f) => f.severidad === 'Media').length}
            </p>
            <p className="mt-1 text-sm text-gray-800">Problemas moderados</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900">Severidad Baja</h3>
            </div>
            <p className="text-3xl font-bold text-green-800">
              {findings.filter((f) => f.severidad === 'Baja').length}
            </p>
            <p className="mt-1 text-sm text-gray-800">Mejoras menores</p>
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
    </div>
  );
}