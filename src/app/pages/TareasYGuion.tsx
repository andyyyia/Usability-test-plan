import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Save, Trash2, Plus, Edit2, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';

interface Task {
  id: string;
  texto: string;
  pregunta: string;
  exito: string;
}

export function TareasYGuion() {
  const { activeProject } = useProject();
  const { setUnsavedChanges } = useUnsavedChanges();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ index: number; field: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; index: number }>({ open: false, index: -1 });
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);

  // No need for separate state for closing questions as they are just a guide

  useEffect(() => {
    if (activeProject) {
      loadData(activeProject.id);
    } else {
      setTasks([]);
    }
  }, [activeProject]);

  useEffect(() => {
    const hasPendingChanges = isEditing && !isSaving;
    setUnsavedChanges('tareas-y-guion', hasPendingChanges);

    return () => {
      setUnsavedChanges('tareas-y-guion', false);
    };
  }, [isEditing, isSaving, setUnsavedChanges]);

  const loadData = async (projectId: number) => {
    setIsLoading(true);
    let hasData = false;
    try {
      const backendTasks = await api.getTareasGuion(projectId);
      if (backendTasks && backendTasks.length > 0) {
        hasData = true;
        setTasks(backendTasks.map((t: any) => ({
          id: t.identificador,
          texto: t.texto || '',
          pregunta: t.pregunta || '',
          exito: t.exito_esperado || ''
        })));
      } else {
        setTasks([{ id: 'T1', texto: '', pregunta: '', exito: '' }]);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    setIsEditing(!hasData);
  };

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    if (!isEditing) return;
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSave = async () => {
    if (!activeProject) {
      toast.info('Por favor selecciona o crea un proyecto primero.');
      return;
    }
    setIsSaving(true);
    const newErrors: { index: number; field: string }[] = [];
    const cleanRowsIndexes = new Set<number>();

    tasks.forEach((t, index) => {
      const isEmpty = !t.texto.trim() && !t.pregunta.trim() && !t.exito.trim();
      if (isEmpty) {
        cleanRowsIndexes.add(index);
        return;
      }

      if (!t.texto.trim()) newErrors.push({ index, field: 'texto' });
      if (!t.pregunta.trim()) newErrors.push({ index, field: 'pregunta' });
      if (!t.exito.trim()) newErrors.push({ index, field: 'exito' });
    });
    setErrors(newErrors);

    const validData = tasks.filter((_, i) => !cleanRowsIndexes.has(i));

    if (validData.length > 0 && newErrors.length > 0) {
      toast.error('Validación', { description: 'Hay tareas parcialmente llenas. Faltan completar campos obligatorios.' });
      setIsSaving(false);
      setTimeout(() => {
        if (newErrors.length > 0) {
          const firstErrorId = `task-${newErrors[0].index}-${newErrors[0].field}`;
          const el = document.getElementById(firstErrorId);
          if (el) el.focus();
        }
      }, 100);
      return;
    }

    try {
      const formattedTasks = validData.map((t, i) => ({
        identificador: `T${i + 1}`,
        texto: t.texto,
        pregunta: t.pregunta,
        exito_esperado: t.exito
      }));
      await api.saveTareasGuion(activeProject.id, formattedTasks);
      
      if (validData.length === 0) {
        setTasks([{ id: 'T1', texto: '', pregunta: '', exito: '' }]);
      } else {
        setTasks(validData.map((t, i) => ({ ...t, id: `T${i + 1}` })));
      }

      setErrors([]);
      setIsEditing(false);
      toast.success('Guion guardado correctamente');
    } catch (e) {
      console.error(e);
      toast.error('Error guardando el guion');
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

  const handleAddTask = () => {
    const newTask: Task = {
      id: `T${tasks.length + 1}`,
      texto: '',
      pregunta: '',
      exito: '',
    };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (index: number) => {
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
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tareas y Guion de moderación - {activeProject.nombre}</h1>
          <p className="text-gray-600 mt-1">Guion completo para conducir la sesión de usabilidad</p>
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

      <div className="max-w-[1100px] mx-auto space-y-6">
        {/* Card 1: Inicio de la sesión */}
        <Card title="Inicio de la sesión">
          <div className="space-y-3">
            <p className="text-sm text-gray-700 mb-4">
              Instrucciones que el moderador debe seguir al inicio:
            </p>
            <ol className="space-y-2 list-decimal list-inside">
              <li className="text-sm text-gray-800 pl-2">
                <span className="font-medium">Agradece la participación</span> y haz que se sienta cómodo/a
              </li>
              <li className="text-sm text-gray-800 pl-2">
                <span className="font-medium">Explica que se evalúa la interfaz, no a la persona</span> – no hay respuestas correctas o incorrectas
              </li>
              <li className="text-sm text-gray-800 pl-2">
                <span className="font-medium">Pide que piense en voz alta</span> mientras realiza las tareas
              </li>
              <li className="text-sm text-gray-800 pl-2">
                <span className="font-medium">Lee una tarea a la vez</span> y espera a que termine antes de continuar
              </li>
              <li className="text-sm text-gray-800 pl-2">
                <span className="font-medium">Evita ayudar salvo bloqueo total</span> – observa sin intervenir
              </li>
            </ol>
          </div>
        </Card>

        {/* Card 2: Tareas a leer durante el test */}
        <Card title="Tareas a leer durante el test">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" aria-describedby="tareas-caption">
              <caption id="tareas-caption" className="sr-only">Tabla de tareas y preguntas del test</caption>
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-16">
                    ID
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Texto de la tarea
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Pregunta de seguimiento
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Éxito esperado
                  </th>
                  <th scope="col" className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      {task.id}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`task-${index}-texto`}
                        type="text"
                        value={task.texto}
                        onChange={(e) => handleTaskChange(index, 'texto', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          } ${errors.some(e => e.index === index && e.field === 'texto') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Describe la tarea que debe realizar el usuario..."
                        aria-label={`Texto tarea ${task.id}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`task-${index}-pregunta`}
                        type="text"
                        value={task.pregunta}
                        onChange={(e) => handleTaskChange(index, 'pregunta', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          } ${errors.some(e => e.index === index && e.field === 'pregunta') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="Pregunta para profundizar..."
                        aria-label={`Pregunta tarea ${task.id}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        id={`task-${index}-exito`}
                        type="text"
                        value={task.exito}
                        onChange={(e) => handleTaskChange(index, 'exito', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          } ${errors.some(e => e.index === index && e.field === 'exito') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                        placeholder="¿Cómo saber si tuvo éxito?"
                        aria-label={`Éxito tarea ${task.id}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteTask(index)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          aria-label={`Eliminar tarea ${task.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {isEditing && (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                      <button
                        onClick={handleAddTask}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar tarea
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Card 3: Cierre */}
        <Card title="Cierre de la sesión">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 mb-4">
              Asegúrate de realizar estas preguntas finales para cerrar la participación:
            </p>

            <ul className="space-y-3 list-disc list-inside">
              <li className="text-sm text-gray-800">
                <span className="font-semibold text-[#1E3A5F]">¿Qué fue lo más fácil del sistema?</span><br />
                <span className="pl-5 text-gray-600">Para identificar los aciertos clave del diseño.</span>
              </li>
              <li className="text-sm text-gray-800">
                <span className="font-semibold text-[#1E3A5F]">¿Qué fue lo más confuso o frustrante?</span><br />
                <span className="pl-5 text-gray-600">Para levantar los puntos de fricción principales.</span>
              </li>
              <li className="text-sm text-gray-800">
                <span className="font-semibold text-[#1E3A5F]">Si pudieras cambiar una sola cosa del diseño, ¿cuál sería?</span><br />
                <span className="pl-5 text-gray-600">Ayuda a priorizar la próxima mejora desde la perspectiva del participante.</span>
              </li>
            </ul>
            <p className="text-sm text-gray-500 mt-4 italic border-t pt-4">
              Nota: Escribe las respuestas del participante en la sección de "Observaciones" o anótalas como "Hallazgos" si es un problema recurrente.
            </p>
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
              {isSaving ? 'Guardando...' : 'Guardar guion completo'}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete.open}
        title="Eliminar tarea"
        message="¿Seguro que deseas eliminar esta tarea del guion?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setConfirmDelete({ open: false, index: -1 })}
        onConfirm={() => {
          if (confirmDelete.index < 0) return;
          const newTasks = [...tasks];
          newTasks.splice(confirmDelete.index, 1);
          // Renumerar IDs después de eliminar
          const renumberedTasks = newTasks.map((task, i) => ({
            ...task,
            id: `T${i + 1}`,
          }));
          setTasks(renumberedTasks);
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