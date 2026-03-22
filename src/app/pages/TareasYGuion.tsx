import { useState } from 'react';
import { Card } from '../components/Card';
import { Save, Trash2, Plus } from 'lucide-react';

interface Task {
  id: string;
  texto: string;
  pregunta: string;
  exito: string;
}

export function TareasYGuion() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'T1',
      texto: 'Imagina que quieres revisar tu nota del primer parcial. Muéstrame cómo lo harías.',
      pregunta: '¿Qué esperabas encontrar en esta pantalla?',
      exito: 'Encuentra la nota sin ayuda',
    },
    { id: 'T2', texto: '', pregunta: '', exito: '' },
    { id: 'T3', texto: '', pregunta: '', exito: '' },
    { id: 'T4', texto: '', pregunta: '', exito: '' },
  ]);

  // Preguntas de cierre
  const [facil, setFacil] = useState('');
  const [confuso, setConfuso] = useState('');
  const [cambiaria, setCambiaria] = useState('');

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleSave = () => {
    alert('Guion guardado correctamente');
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

  return (
    <div className="p-8">
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
        <Card title="Cierre">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 mb-4">
              Preguntas finales para cerrar la sesión:
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué fue lo más fácil?
              </label>
              <input
                type="text"
                value={facil}
                onChange={(e) => setFacil(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas sobre aspectos positivos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué fue lo más confuso?
              </label>
              <input
                type="text"
                value={confuso}
                onChange={(e) => setConfuso(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Problemas o fricciones identificadas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué cambiarías primero?
              </label>
              <input
                type="text"
                value={cambiaria}
                onChange={(e) => setCambiaria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sugerencias del usuario..."
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}