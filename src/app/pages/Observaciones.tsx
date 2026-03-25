import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Plus, Save, Trash2, Edit2, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { MessageModal } from '../components/MessageModal';
import { ConfirmModal } from '../components/ConfirmModal';

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
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; title: string; message: string; variant: 'success' | 'error' | 'info' }>({
    open: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showModal = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setModal({ open: true, title, message, variant });
  };

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; index: number }>({ open: false, index: -1 });
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);

  useEffect(() => {
    if (activeProject) {
      loadData(activeProject.id);
    } else {
      setObservations([]);
    }
  }, [activeProject]);

  const loadData = async (projectId: number) => {
    setIsLoading(true);
    try {
      const data = await api.getObservaciones(projectId);
      if (data && data.length > 0) {
        setObservations(data);
      } else {
        setObservations([]);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    setIsEditing(false);
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
      showModal('Información', 'Por favor selecciona o crea un proyecto primero.', 'info');
      return;
    }
    
    if (observations.some(o => !o.participante.trim() || !o.perfil.trim() || !o.tarea.trim() || !o.exito.trim() || !String(o.tiempo).trim() || !String(o.errores).trim() || !o.comentarios.trim() || !o.problema.trim() || !o.severidad.trim() || !o.mejora.trim())) {
      showModal('Validación', 'Todos los campos de las observaciones son obligatorios. No se permiten datos en blanco.', 'error');
      return;
    }

    try {
      await api.saveObservaciones(activeProject.id, observations);
      setIsEditing(false);
      showModal('Éxito', 'Observaciones guardadas correctamente', 'success');
    } catch (e) {
      console.error(e);
      showModal('Error', 'Error guardando las observaciones', 'error');
    }
  };

  const handleEdit = () => {
    if (!activeProject) {
      showModal('Información', 'Por favor selecciona o crea un proyecto primero.', 'info');
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
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152d47] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar datos
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </>
            ) : (
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1400px]">
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
                        type="text"
                        value={obs.participante}
                        onChange={(e) => handleChange(index, 'participante', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="Usuario 1"
                        aria-label={`Participante fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={obs.perfil}
                        onChange={(e) => handleChange(index, 'perfil', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="Avanzado"
                        aria-label={`Perfil fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={obs.tarea}
                        onChange={(e) => handleChange(index, 'tarea', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="T1"
                        aria-label={`Tarea fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        value={obs.exito}
                        onChange={(e) => handleChange(index, 'exito', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
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
                        type="number"
                        value={obs.tiempo}
                        onChange={(e) => handleChange(index, 'tiempo', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="120"
                        aria-label={`Tiempo fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="number"
                        value={obs.errores}
                        onChange={(e) => handleChange(index, 'errores', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="2"
                        aria-label={`Errores fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={obs.comentarios}
                        onChange={(e) => handleChange(index, 'comentarios', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="Comentarios..."
                        aria-label={`Comentarios fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={obs.problema}
                        onChange={(e) => handleChange(index, 'problema', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="Problema..."
                        aria-label={`Problema fila ${index + 1}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        value={obs.severidad}
                        onChange={(e) => handleChange(index, 'severidad', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded ${!isEditing ? 'cursor-not-allowed opacity-70' : ''} ${getSeverityColor(
                          obs.severidad
                        )}`}
                        aria-label={`Severidad fila ${index + 1}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={obs.mejora}
                        onChange={(e) => handleChange(index, 'mejora', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${!isEditing ? 'text-gray-500 cursor-not-allowed' : ''}`}
                        placeholder="Mejora..."
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
      </div>
      <MessageModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />

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