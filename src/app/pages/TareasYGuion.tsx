import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { IconPencil, IconX, IconTrash, IconDeviceFloppy, IconPlus, IconLoader2 } from '@tabler/icons-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { toast } from 'sonner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Stepper } from '../components/Stepper';
import { useProjectProgress } from '../hooks/useProjectProgress';

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
  const [visible, setVisible] = useState(false);
  const { getSteps, reloadProgress } = useProjectProgress(activeProject?.id);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

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

      reloadProgress();
      setErrors([]);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setTimeout(() => document.getElementById('task-0-texto')?.focus(), 80);
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
    <div className={`transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'} ${isLoading ? 'opacity-50' : ''}`}>
      <Breadcrumbs items={[
        { label: 'Proyectos' },
        { label: activeProject.nombre },
        { label: 'Tareas y guion' }
      ]} />

      <header className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 className="page-title">
            Tareas y Guion de moderación - {activeProject.nombre}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', margin: 0 }}>
            Guion completo para conducir la sesión de usabilidad
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn-editar"
            aria-label="Editar guion de moderación"
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
          <div className="design-table-container">
            <table className="design-table" aria-describedby="tareas-caption">
              <caption id="tareas-caption" className="sr-only">Tabla de tareas y preguntas del test</caption>
              <thead>
                <tr>
                  {isEditing && (
                    <th scope="col" className="text-center w-28">
                      Acciones
                    </th>
                  )}
                  <th scope="col" className="w-16">
                    ID
                  </th>
                  <th scope="col">
                    Texto de la tarea
                  </th>
                  <th scope="col">
                    Pregunta de seguimiento
                  </th>
                  <th scope="col">
                    Éxito esperado
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task.id} className="table-row-interactive">
                    {isEditing && (
                      <td>
                        <button
                          onClick={() => handleDeleteTask(index)}
                          className="btn-danger w-full justify-center"
                          aria-label={`Eliminar tarea ${task.id}`}
                        >
                          <IconTrash size={16} className="w-4 h-4" />
                          <span className="hidden md:inline">Eliminar</span>
                        </button>
                      </td>
                    )}
                    <td className="text-sm font-medium text-gray-700">
                      {task.id}
                    </td>
                    <td>
                      <input
                        id={`task-${index}-texto`}
                        type="text"
                        value={task.texto}
                        onChange={(e) => handleTaskChange(index, 'texto', e.target.value)}
                        disabled={!isEditing}
                        className={`form-input w-full px-2 py-1 text-sm ${!isEditing ? 'is-disabled' : ''
                          } ${errors.some(e => e.index === index && e.field === 'texto') ? 'is-error' : ''} ${task.texto ? 'is-filled' : ''}`}
                        placeholder="Describe la tarea que debe realizar el usuario..."
                        aria-label={`Texto tarea ${task.id}`}
                      />
                    </td>
                    <td>
                      <input
                        id={`task-${index}-pregunta`}
                        type="text"
                        value={task.pregunta}
                        onChange={(e) => handleTaskChange(index, 'pregunta', e.target.value)}
                        disabled={!isEditing}
                        className={`form-input w-full px-2 py-1 text-sm ${!isEditing ? 'is-disabled' : ''
                          } ${errors.some(e => e.index === index && e.field === 'pregunta') ? 'is-error' : ''} ${task.pregunta ? 'is-filled' : ''}`}
                        placeholder="Pregunta para profundizar..."
                        aria-label={`Pregunta tarea ${task.id}`}
                      />
                    </td>
                    <td>
                      <input
                        id={`task-${index}-exito`}
                        type="text"
                        value={task.exito}
                        onChange={(e) => handleTaskChange(index, 'exito', e.target.value)}
                        disabled={!isEditing}
                        className={`form-input w-full px-2 py-1 text-sm ${!isEditing ? 'is-disabled' : ''
                          } ${errors.some(e => e.index === index && e.field === 'exito') ? 'is-error' : ''} ${task.exito ? 'is-filled' : ''}`}
                        placeholder="¿Cómo saber si tuvo éxito?"
                        aria-label={`Éxito tarea ${task.id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {tasks.length === 0 ? 'No hay tareas' : 
               tasks.length === 1 ? '1 tarea registrada' : 
               `${tasks.length} tareas registradas`}
            </div>
            {isEditing && (
              <button
                onClick={handleAddTask}
                className="btn-outline-primary"
              >
                <IconPlus size={16} className="w-4 h-4" />
                Agregar tarea
              </button>
            )}
          </div>
        </Card>

        {/* Card 3: Cierre */}
        <Card title="Cierre de la sesión">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 mb-4">
              Asegúrate de realizar estas preguntas finales para cerrar la participación:
            </p>

            <ul className="space-y-3 list-disc list-inside">
              <li className="text-sm text-secondary">
                <span className="font-semibold text-[var(--color-primary)]">¿Qué fue lo más fácil del sistema?</span><br />
                <span className="pl-5 text-muted">Para identificar los aciertos clave del diseño.</span>
              </li>
              <li className="text-sm text-secondary">
                <span className="font-semibold text-[var(--color-primary)]">¿Qué fue lo más confuso o frustrante?</span><br />
                <span className="pl-5 text-muted">Para levantar los puntos de fricción principales.</span>
              </li>
              <li className="text-sm text-secondary">
                <span className="font-semibold text-[var(--color-primary)]">Si pudieras cambiar una sola cosa del diseño, ¿cuál sería?</span><br />
                <span className="pl-5 text-muted">Ayuda a priorizar la próxima mejora desde la perspectiva del participante.</span>
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
                  Guardar guion completo
                </>
              )}
            </button>
          </div>
        )}

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