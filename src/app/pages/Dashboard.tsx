import { Card } from '../components/Card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

const taskData = [
  { task: 'T1', errores: 3 },
  { task: 'T2', errores: 5 },
  { task: 'T3', errores: 2 },
  { task: 'T4', errores: 7 },
];

const severityData = [
  { name: 'Alta', value: 8, color: '#EF4444' },
  { name: 'Media', value: 12, color: '#F59E0B' },
  { name: 'Baja', value: 5, color: '#10B981' },
];

const recentObservations = [
  { participant: 'Usuario 1', task: 'T1', status: 'Completado con ayuda', severity: 'Media' },
  { participant: 'Usuario 2', task: 'T3', status: 'No completado', severity: 'Alta' },
  { participant: 'Usuario 3', task: 'T2', status: 'Completado', severity: 'Baja' },
];

const criticalProblems = [
  { problem: 'Botón de confirmación poco visible', frequency: '4/5' },
  { problem: 'Flujo de navegación confuso en paso 3', frequency: '3/5' },
  { problem: 'Formulario sin validación clara', frequency: '5/5' },
];

function MetricCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="p-8">
      <div className="max-w-[1100px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen general de las pruebas de usabilidad</p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Tareas exitosas"
            value="75%"
            icon={CheckCircle}
            color="bg-green-500"
          />
          <MetricCard
            title="Tiempo promedio"
            value="3.5 min"
            icon={Clock}
            color="bg-blue-500"
          />
          <MetricCard
            title="Total de errores"
            value="17"
            icon={AlertTriangle}
            color="bg-orange-500"
          />
          <MetricCard
            title="Hallazgos críticos"
            value="8"
            icon={TrendingUp}
            color="bg-red-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Errores por tarea">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="task" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="errores" fill="#1E3A5F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Distribución de severidad">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Observaciones recientes">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Participante</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Tarea</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentObservations.map((obs, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-3 text-sm">{obs.participant}</td>
                      <td className="py-3 px-3 text-sm">{obs.task}</td>
                      <td className="py-3 px-3 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            obs.severity === 'Alta'
                              ? 'bg-red-100 text-red-800'
                              : obs.severity === 'Media'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {obs.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Problemas críticos detectados">
            <div className="space-y-3">
              {criticalProblems.map((problem, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{problem.problem}</p>
                    <p className="text-xs text-gray-600 mt-1">Frecuencia: {problem.frequency} usuarios</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}