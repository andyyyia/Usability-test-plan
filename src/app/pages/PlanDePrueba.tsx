import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { FormRow } from '../components/FormRow';
import { Save, Edit2, X, Plus, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';

interface Task {
  id: string;
  scenario: string;
  expectedResult: string;
  mainMetric: string;
  successCriteria: string;
}

export function PlanDePrueba() {
  const { activeProject } = useProject();
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
    { id: 'T2', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
    { id: 'T3', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
    { id: 'T4', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
  ]);

  // Roles y logística
  const [moderador, setModerador] = useState('');
  const [observador, setObservador] = useState('');
  const [herramienta, setHerramienta] = useState('');
  const [enlace, setEnlace] = useState('');

  // Notas del moderador
  const [notas, setNotas] = useState('');

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const addTask = () => {
    const newId = `T${tasks.length + 1}`;
    setTasks([...tasks, { id: newId, scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' }]);
  };

  const deleteTask = (index: number) => {
    if (confirm('¿Eliminar esta tarea?')) {
      const newTasks = tasks.filter((_, i) => i !== index);
      // Renumerar IDs
      const renumberedTasks = newTasks.map((task, i) => ({
        ...task,
        id: `T${i + 1}`
      }));
      setTasks(renumberedTasks);
    }
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

  const loadData = async (projectId: number) => {
    setIsLoading(true);
    try {
      const pData = await api.getPlan(projectId);
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
          { id: 'T2', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
          { id: 'T3', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
          { id: 'T4', scenario: '', expectedResult: '', mainMetric: '', successCriteria: '' },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
    setIsEditing(false); // start in view mode when loaded
  };

  const handleSave = async () => {
    if (!activeProject) {
      alert("Por favor selecciona o crea un proyecto primero.");
      return;
    }

    const generalesInvalidos = !producto.trim() || !pantalla.trim() || !objetivo.trim() || !perfil.trim() || !metodo.trim() || !fecha.trim() || !lugar.trim() || !duracion.trim() || !moderador.trim() || !observador.trim() || !herramienta.trim() || !enlace.trim() || !notas.trim();
    const tareasInvalidas = tasks.some(t => !t.scenario.trim() || !t.expectedResult.trim() || !t.mainMetric.trim() || !t.successCriteria.trim());
    
    if (generalesInvalidos || tareasInvalidas) {
      alert("Todos los campos del plan y de las tareas son obligatorios. No se permiten datos en blanco.");
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

      setIsEditing(false);
      alert('Plan guardado correctamente');
    } catch (e) {
      console.error(e);
      alert('Error guardando el plan');
    }
  };

  const handleEdit = () => {
    if (!activeProject) {
      alert("Por favor selecciona o crea un proyecto primero.");
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (confirm('¿Descartar cambios?')) {
      setIsEditing(false);
      if (activeProject) {
        loadData(activeProject.id); // reload original state
      }
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
            <h1 className="text-3xl font-bold text-gray-900">Plan de prueba de usabilidad - {activeProject.nombre}</h1>
            <p className="text-gray-600 mt-1">Define el contexto y parámetros de la prueba</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152d47] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Guardar plan
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

        <div className="space-y-6">
          <Card title="Contexto general">
            <div>
              <FormRow
                label="Producto / servicio"
                value={producto}
                onChange={setProducto}
                placeholder="Nombre del producto o servicio"
              />
              <div className="mb-3">
                <p className="text-xs text-gray-500 ml-52">Especifica el nombre completo del producto a evaluar</p>
              </div>

              <FormRow
                label="Pantalla / módulo"
                value={pantalla}
                onChange={setPantalla}
                placeholder="Área específica a evaluar"
              />

              <FormRow
                label="Objetivo del test"
                value={objetivo}
                onChange={setObjetivo}
                placeholder="¿Qué quieres validar o descubrir?"
              />
              <div className="mb-3">
                <p className="text-xs text-gray-500 ml-52">Define claramente qué aspecto de usabilidad se evaluará</p>
              </div>

              <FormRow
                label="Perfil de usuarios"
                value={perfil}
                onChange={setPerfil}
                placeholder="Características de los participantes"
              />

              <div className="flex items-center gap-4 mb-3">
                <label className="w-48 text-sm font-medium text-gray-700 flex-shrink-0">
                  Método
                </label>
                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar método...</option>
                  <option value="presencial">Presencial</option>
                  <option value="remoto">Remoto</option>
                  <option value="hibrido">Híbrido</option>
                  <option value="guerrilla">Guerrilla</option>
                </select>
              </div>

              <FormRow
                label="Fecha"
                value={fecha}
                onChange={setFecha}
                type="date"
              />

              <FormRow
                label="Lugar / canal"
                value={lugar}
                onChange={setLugar}
                placeholder="Presencial, remoto, laboratorio..."
              />

              <FormRow
                label="Duración"
                value={duracion}
                onChange={setDuracion}
                placeholder="Ej: 45 min por sesión"
              />
            </div>
          </Card>

          {/* Card 2: Tareas del test */}
          <Card title="Tareas del test">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
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
                          type="text"
                          value={task.scenario}
                          onChange={(e) => handleTaskChange(index, 'scenario', e.target.value)}
                          className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                          placeholder="Describe el escenario..."
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={task.expectedResult}
                          onChange={(e) => handleTaskChange(index, 'expectedResult', e.target.value)}
                          className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                          placeholder="Resultado esperado..."
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={task.mainMetric}
                          onChange={(e) => handleTaskChange(index, 'mainMetric', e.target.value)}
                          className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                          placeholder="Ej: Tiempo, éxito..."
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <input
                          type="text"
                          value={task.successCriteria}
                          onChange={(e) => handleTaskChange(index, 'successCriteria', e.target.value)}
                          className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                          placeholder="¿Cómo medir éxito?"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <button
                          onClick={() => deleteTask(index)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <button
                onClick={addTask}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Añadir tarea
              </button>
            </div>
          </Card>

          {/* Card 3: Roles y logística */}
          <Card title="Roles y logística">
            <div>
              <FormRow
                label="Moderador"
                value={moderador}
                onChange={setModerador}
                placeholder="Nombre del moderador"
              />
              <FormRow
                label="Observador / note taker"
                value={observador}
                onChange={setObservador}
                placeholder="Nombre del observador"
              />
              <FormRow
                label="Herramienta / prototipo"
                value={herramienta}
                onChange={setHerramienta}
                placeholder="Figma, prototipo HTML, app real..."
              />
              <FormRow
                label="Enlace / archivo"
                value={enlace}
                onChange={setEnlace}
                placeholder="URL o ruta del archivo"
              />
            </div>
          </Card>

          {/* Card 4: Notas del moderador */}
          <Card title="Notas del moderador">
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Escribe aquí recordatorios, riesgos, sesgos a evitar o instrucciones para la sesión."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px] resize-y"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}