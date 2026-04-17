import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { FormRow } from '../components/FormRow';
import { Save, Edit2, X, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { ConfirmModal } from '../components/ConfirmModal';
import { toast } from 'sonner';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';

interface Task {
  id: string;
  scenario: string;
  expectedResult: string;
  mainMetric: string;
  successCriteria: string;
}

export function PlanDePrueba() {
  const { activeProject } = useProject();
  const { setUnsavedChanges } = useUnsavedChanges();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [taskErrors, setTaskErrors] = useState<{ index: number; field: string }[]>([]);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<{ open: boolean; index: number }>({ open: false, index: -1 });
  const [confirmDiscardChanges, setConfirmDiscardChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fecha limites: desde hoy hasta 1 ano adelante
  const formatAsInputDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const oneYearFromToday = new Date(today);
  oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() + 1);
  const minDate = formatAsInputDate(today);
  const maxDate = formatAsInputDate(oneYearFromToday);

  // Contexto general
  const [producto, setProducto] = useState('');
  const [pantalla, setPantalla] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [perfil, setPerfil] = useState('');
  const [metodo, setMetodo] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [duracion, setDuracion] = useState('');

  // Tareas del test
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'T1', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
  ]);

  // Roles y logística
  const [moderador, setModerador] = useState('');
  const [observador, setObservador] = useState('');
  const [herramienta, setHerramienta] = useState('');
  const [enlace, setEnlace] = useState('');

  // Notas del moderador
  const [notas, setNotas] = useState('');

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    if (!isEditing) return; // view mode: prevent manipulation
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const addTask = () => {
    const newId = `T${tasks.length + 1}`;
    setTasks([...tasks, { id: newId, scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' }]);
  };

  const deleteTask = (index: number) => {
    setConfirmDeleteTask({ open: true, index });
  };

  useEffect(() => {
    if (activeProject) {
      loadData(activeProject.id);
    } else {
      // Clear data if no project
      setProducto(''); setPantalla(''); setObjetivo(''); setPerfil('');
      setMetodo(''); setFecha(''); setLugar(''); setDuracion('');
      setModerador(''); setObservador(''); setHerramienta(''); setEnlace(''); setNotas('');
      setTasks([]);
    }
  }, [activeProject]);

  useEffect(() => {
    const hasPendingChanges = isEditing && !isSaving;
    setUnsavedChanges('plan-de-prueba', hasPendingChanges);

    return () => {
      setUnsavedChanges('plan-de-prueba', false);
    };
  }, [isEditing, isSaving, setUnsavedChanges]);

  const loadData = async (projectId: number) => {
    setIsLoading(true);
    let hasData = false;
    try {
      const pData = await api.getPlan(projectId);
      if (pData && (pData.producto || pData.pantalla || pData.objetivo)) hasData = true;
      if (pData) {
        setProducto(pData.producto || '');
        setPantalla(pData.pantalla || '');
        setObjetivo(pData.objetivo || '');
        setPerfil(pData.perfil || '');
        setMetodo(pData.metodo || '');
        setFecha(pData.fecha ? pData.fecha.split('T')[0] : '');
        setLugar(pData.lugar || '');
        setDuracion(pData.duracion || '');
        setModerador(pData.moderador || '');
        setObservador(pData.observador || '');
        setHerramienta(pData.herramienta || '');
        setEnlace(pData.enlace || '');
        setNotas(pData.notas || '');
      } else {
        setProducto(''); setPantalla(''); setObjetivo(''); setPerfil('');
        setMetodo(''); setFecha(''); setLugar(''); setDuracion('');
        setModerador(''); setObservador(''); setHerramienta(''); setEnlace(''); setNotas('');
      }

      const tData = await api.getTareasPlan(projectId);
      if (tData && tData.length > 0) {
        setTasks(tData.map((t: any) => ({
          id: t.identificador,
          scenario: t.escenario || '',
          expectedResult: t.resultado_esperado || '',
          mainMetric: t.metrica_principal || '',
          successCriteria: t.criterio_exito || ''
        })));
      } else {
        // Reset tasks or use initial defaults if no tasks found
        setTasks([
          { id: 'T1', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    setIsEditing(!hasData);
  };

  const handleSave = async () => {
    if (!activeProject) {
      toast.info('Por favor selecciona o crea un proyecto primero.');
      return;
    }
    setIsSaving(true);

    const newErrors: string[] = [];
    if (!producto.trim()) newErrors.push('producto');
    if (!pantalla.trim()) newErrors.push('pantalla');
    if (!objetivo.trim()) newErrors.push('objetivo');
    if (!perfil.trim()) newErrors.push('perfil');
    if (!metodo.trim()) newErrors.push('metodo');
    const fechaEl = document.getElementById('fecha') as HTMLInputElement | null;
    const isFechaBadInput = fechaEl?.validity.badInput || false;

    if (!fecha.trim() || isFechaBadInput || fecha < minDate || fecha > maxDate) newErrors.push('fecha');
    if (!lugar.trim()) newErrors.push('lugar');
    if (!duracion.trim()) newErrors.push('duracion');
    if (!moderador.trim()) newErrors.push('moderador');
    if (!observador.trim()) newErrors.push('observador');
    if (!herramienta.trim()) newErrors.push('herramienta');
    if (!enlace.trim()) newErrors.push('enlace');
    if (!notas.trim()) newErrors.push('notas');

    const newTaskErrors: { index: number; field: string }[] = [];
    if (tasks.length === 0) {
      newErrors.push('tareas_empty');
    } else {
      tasks.forEach((t, index) => {
        if (!t.scenario.trim()) newTaskErrors.push({ index, field: 'scenario' });
        if (!t.expectedResult.trim()) newTaskErrors.push({ index, field: 'expectedResult' });
        if (!t.mainMetric.trim()) newTaskErrors.push({ index, field: 'mainMetric' });
        if (!t.successCriteria.trim()) newTaskErrors.push({ index, field: 'successCriteria' });
      });
    }

    setErrors(newErrors);
    setTaskErrors(newTaskErrors);

    if (newErrors.length > 0 || newTaskErrors.length > 0) {
      let errorMsg = 'Faltan completar los siguientes campos obligatorios:\n\n';
      if (newErrors.length > 0 && !newErrors.includes('tareas_empty')) {
         errorMsg += '- En Información general / logística.\n';
      }
      if (newErrors.includes('tareas_empty')) {
         errorMsg += '- Debe haber al menos una tarea.\n';
      }
      if (newTaskErrors.length > 0) {
         errorMsg += '- Faltan datos en las filas de tareas.\n';
      }
      
      if (newErrors.includes('fecha')) {
         if (isFechaBadInput) {
            errorMsg += '- La fecha ingresada es inválida o no existe en el calendario.\n';
        } else if (fecha && fecha < minDate) {
          errorMsg += '- No se puede elegir una fecha anterior a la actual.\n';
        } else if (fecha && fecha > maxDate) {
          errorMsg += '- No se puede elegir una fecha muy en el futuro.\n';
         }
      }
      
      toast.error('Validación', { description: errorMsg, duration: 5000 });
      setIsSaving(false);
      setTimeout(() => {
        const firstErrorId = newErrors.length > 0 && newErrors[0] !== 'tareas_empty' ? newErrors[0] : 
          (newTaskErrors.length > 0 ? `task-${newTaskErrors[0].index}-${newTaskErrors[0].field}` : null);
        
        if (firstErrorId) {
          const el = document.getElementById(firstErrorId);
          if (el) el.focus();
        }
      }, 100);
      
      return;
    }

    try {
      await api.savePlan({
        proyecto_id: activeProject.id,
        producto,
        pantalla,
        objetivo,
        perfil,
        metodo,
        fecha,
        lugar,
        duracion,
        moderador,
        observador,
        herramienta,
        enlace,
        notas,
      });

      const formattedTasks = tasks.map(t => ({
        identificador: t.id,
        escenario: t.scenario,
        resultado_esperado: t.expectedResult,
        metrica_principal: t.mainMetric,
        criterio_exito: t.successCriteria
      }));
      await api.saveTareasPlan(activeProject.id, formattedTasks);

      setErrors([]);
      setTaskErrors([]);
      setIsEditing(false);
      toast.success('Plan guardado correctamente');
    } catch (e) {
      console.error(e);
      toast.error('Error guardando el plan');
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

  const getFechaErrorMessage = () => {
    if (!fecha.trim()) return 'Este campo es obligatorio';
    if (fecha < minDate) return 'No se puede elegir una fecha anterior a la actual.';
    if (fecha > maxDate) return 'No se puede elegir una fecha muy en el futuro.';
    return 'La fecha ingresada es invalida.';
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
            <h1 className="text-3xl font-bold text-gray-900">Plan de prueba de usabilidad - {activeProject.nombre}</h1>
            <p className="text-gray-600 mt-1">Define el contexto y parámetros de la prueba</p>
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

        <div className="space-y-6">
          <Card title="Contexto general">
            <div>
              <FormRow
                id="producto"
                label="Producto / servicio"
                value={producto}
                onChange={setProducto}
                placeholder="Nombre del producto o servicio"
                disabled={!isEditing || isSaving}
                error={errors.includes('producto')}
                errorMessage="Este campo es obligatorio"
                required
              />
              <div className="mb-3">
                <p className="text-xs text-gray-600 ml-52">Especifica el nombre completo del producto a evaluar</p>
              </div>

              <FormRow
                id="pantalla"
                label="Pantalla / módulo"
                value={pantalla}
                onChange={setPantalla}
                placeholder="Área específica a evaluar"
                disabled={!isEditing || isSaving}
                error={errors.includes('pantalla')}
                errorMessage="Este campo es obligatorio"
                required
              />

              <FormRow
                id="objetivo"
                label="Objetivo del test"
                value={objetivo}
                onChange={setObjetivo}
                placeholder="¿Qué quieres validar o descubrir?"
                disabled={!isEditing || isSaving}
                error={errors.includes('objetivo')}
                errorMessage="Este campo es obligatorio"
                required
              />
              <div className="mb-3">
                <p className="text-xs text-gray-600 ml-52">Define claramente qué aspecto de usabilidad se evaluará</p>
              </div>

              <FormRow
                id="perfil"
                label="Perfil de usuarios"
                value={perfil}
                onChange={setPerfil}
                placeholder="Características de los participantes"
                disabled={!isEditing || isSaving}
                error={errors.includes('perfil')}
                errorMessage="Este campo es obligatorio"
                required
              />

              <div className="flex items-start gap-4 mb-3">
                <label htmlFor="metodo" className="w-48 text-sm font-medium text-gray-700 flex-shrink-0 mt-2">
                  Método <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <select
                    id="metodo"
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.includes('metodo') ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    } ${(!isEditing || isSaving) ? '!bg-gray-100 !text-gray-500 cursor-not-allowed' : ''}`}
                    disabled={!isEditing || isSaving}
                  >
                    <option value="">Seleccionar método...</option>
                    <option value="presencial">Presencial</option>
                    <option value="remoto">Remoto</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="guerrilla">Guerrilla</option>
                  </select>
                  {errors.includes('metodo') && (
                    <p className="mt-1 text-xs text-red-600 font-medium">Este campo es obligatorio</p>
                  )}
                </div>
              </div>

              <FormRow
                id="fecha"
                label="Fecha"
                value={fecha}
                onChange={setFecha}
                type="date"
                min={minDate}
                max={maxDate}
                disabled={!isEditing || isSaving}
                error={errors.includes('fecha')}
                errorMessage={getFechaErrorMessage()}
                required
              />

              <FormRow
                id="lugar"
                label="Lugar / canal"
                value={lugar}
                onChange={setLugar}
                placeholder="Presencial, remoto, laboratorio..."
                disabled={!isEditing || isSaving}
                error={errors.includes('lugar')}
                errorMessage="Este campo es obligatorio"
                required
              />

              <FormRow
                id="duracion"
                label="Duración"
                value={duracion}
                onChange={setDuracion}
                placeholder="Ej: 45 min por sesión"
                disabled={!isEditing || isSaving}
                error={errors.includes('duracion')}
                errorMessage="Este campo es obligatorio"
                required
              />
            </div>
          </Card>

          {/* Card 2: Tareas del test */}
          <Card title="Tareas del test">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" aria-describedby="plan-tareas-caption">
                <caption id="plan-tareas-caption" className="sr-only">Tabla de tareas, escenarios y métricas del plan de prueba</caption>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-16">
                      ID
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                      Escenario / tarea
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                      Resultado esperado
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                      Métrica principal
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                      Criterio de éxito
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 w-16">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700">
                        {task.id}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          id={`task-${index}-scenario`}
                          type="text"
                          value={task.scenario}
                          onChange={(e) => handleTaskChange(index, 'scenario', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${
                            !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          } ${taskErrors.some(te => te.index === index && te.field === 'scenario') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                          placeholder="Describe el escenario..."
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          id={`task-${index}-expectedResult`}
                          type="text"
                          value={task.expectedResult}
                          onChange={(e) => handleTaskChange(index, 'expectedResult', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${
                            !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          } ${taskErrors.some(te => te.index === index && te.field === 'expectedResult') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                          placeholder="Resultado esperado..."
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          id={`task-${index}-mainMetric`}
                          type="text"
                          value={task.mainMetric}
                          onChange={(e) => handleTaskChange(index, 'mainMetric', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${
                            !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          } ${taskErrors.some(te => te.index === index && te.field === 'mainMetric') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                          placeholder="Ej: Tiempo, éxito..."
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          id={`task-${index}-successCriteria`}
                          type="text"
                          value={task.successCriteria}
                          onChange={(e) => handleTaskChange(index, 'successCriteria', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-2 focus:border-transparent rounded ${
                            !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                          } ${taskErrors.some(te => te.index === index && te.field === 'successCriteria') ? 'ring-2 ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                          placeholder="¿Cómo medir éxito?"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {isEditing && (
                          <button
                            onClick={() => deleteTask(index)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                            title="Eliminar tarea"
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
                  onClick={addTask}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Añadir tarea
                </button>
              )}
            </div>
          </Card>

          {/* Card 3: Roles y logística */}
          <Card title="Roles y logística">
            <div>
              <FormRow
                id="moderador"
                label="Moderador"
                value={moderador}
                onChange={setModerador}
                placeholder="Nombre del moderador"
                disabled={!isEditing || isSaving}
                error={errors.includes('moderador')}
                errorMessage="Obligatorio"
                required
              />
              <FormRow
                id="observador"
                label="Observador / note taker"
                value={observador}
                onChange={setObservador}
                placeholder="Nombre del observador"
                disabled={!isEditing || isSaving}
                error={errors.includes('observador')}
                errorMessage="Obligatorio"
                required
              />
              <FormRow
                id="herramienta"
                label="Herramienta / prototipo"
                value={herramienta}
                onChange={setHerramienta}
                placeholder="Figma, prototipo HTML, app real..."
                disabled={!isEditing || isSaving}
                error={errors.includes('herramienta')}
                errorMessage="Obligatorio"
                required
              />
              <FormRow
                id="enlace"
                label="Enlace / archivo"
                value={enlace}
                onChange={setEnlace}
                placeholder="URL o ruta del archivo"
                disabled={!isEditing || isSaving}
                error={errors.includes('enlace')}
                errorMessage="Obligatorio"
                required
              />
            </div>
          </Card>

          {/* Card 4: Notas del moderador */}
          <Card title="Notas del moderador">
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Escribe aquí recordatorios, riesgos, sesgos a evitar o instrucciones para la sesión."
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent min-h-[200px] resize-y ${
                !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
              } ${errors.includes('notas') ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
          </Card>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
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
              {isSaving ? 'Guardando...' : 'Guardar plan completo'}
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDeleteTask.open}
        title="Eliminar tarea"
        message="¿Seguro que deseas eliminar esta tarea del plan?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onCancel={() => setConfirmDeleteTask({ open: false, index: -1 })}
        onConfirm={() => {
          if (confirmDeleteTask.index < 0) return;
          const newTasks = tasks.filter((_, i) => i !== confirmDeleteTask.index);
          const renumberedTasks = newTasks.map((task, i) => ({
            ...task,
            id: `T${i + 1}`,
          }));
          setTasks(renumberedTasks);
          setConfirmDeleteTask({ open: false, index: -1 });
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