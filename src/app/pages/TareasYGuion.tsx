import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Save, Trash2, Plus } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';

interface Task {
  id: string;
  texto: string;
  pregunta: string;
  exito: string;
}

export function TareasYGuion() {
  const { activeProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // No need for separate state for closing questions as they are just a guide

  useEffect(() => {
    if (activeProject) {
      loadData(activeProject.id);
    } else {
      setTasks([]);
    }
  }, [activeProject]);

  const loadData = async (projectId: number) => {
    setIsLoading(true);
    try {
      const backendTasks = await api.getTareasGuion(projectId);
      if (backendTasks && backendTasks.length > 0) {
        setTasks(backendTasks.map((t: any) => ({
          id: t.identificador,
          texto: t.texto || '',
          pregunta: t.pregunta || '',
          exito: t.exito_esperado || ''
        })));
      } else {
        setTasks([]);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSave = async () => {
    if (!activeProject) {
      alert("Por favor selecciona o crea un proyecto primero.");
      return;
    }
    
    try {
      const formattedTasks = tasks.map(t => ({
        identificador: t.id,
        texto: t.texto,
        pregunta: t.pregunta,
        exito_esperado: t.exito
      }));
      await api.saveTareasGuion(activeProject.id, formattedTasks);
      alert('Guion guardado correctamente');
    } catch (e) {
      console.error(e);
      alert('Error guardando el guion');
    }
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
    if (confirm('¿Eliminar esta tarea?')) {
      const newTasks = [...tasks];
      newTasks.splice(index, 1);
      // Renumerar IDs después de eliminar
      const renumberedTasks = newTasks.map((task, i) => ({
        ...task,
        id: `T${i + 1}`
      }));
      setTasks(renumberedTasks);
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
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tareas y Guion de moderación</h1>
          <p className="text-gray-600 mt-1">Guion completo para conducir la sesión de usabilidad</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152d47] transition-colors"
        >
          <Save className="w-4 h-4" />
          Guardar guion
        </button>
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
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-16">
                    ID
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Texto de la tarea
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Pregunta de seguimiento
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Éxito esperado
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
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
                        type="text"
                        value={task.texto}
                        onChange={(e) => handleTaskChange(index, 'texto', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                        placeholder="Describe la tarea que debe realizar el usuario..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={task.pregunta}
                        onChange={(e) => handleTaskChange(index, 'pregunta', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                        placeholder="Pregunta para profundizar..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={task.exito}
                        onChange={(e) => handleTaskChange(index, 'exito', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                        placeholder="¿Cómo saber si tuvo éxito?"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <button
                        onClick={() => handleDeleteTask(index)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
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
      </div>
    </div>
  );
}