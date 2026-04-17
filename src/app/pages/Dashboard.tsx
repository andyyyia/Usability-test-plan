import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';

// Constants removed, relying on state

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
  const { activeProject } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({ exitoPercent: '0%', tiempoPromo: '0 min', totalErrores: 0, hallazgosCrit: 0 });
  const [taskData, setTaskData] = useState<any[]>([]);
  const [severityData, setSeverityData] = useState<any[]>([]);
  const [recentObservations, setRecentObservations] = useState<any[]>([]);
  const [criticalProblems, setCriticalProblems] = useState<any[]>([]);

  useEffect(() => {
    if (activeProject) {
      loadDashboardData(activeProject.id);
    } else {
      setTaskData([]);
      setSeverityData([]);
      setRecentObservations([]);
      setCriticalProblems([]);
      setMetrics({ exitoPercent: '0%', tiempoPromo: '0 min', totalErrores: 0, hallazgosCrit: 0 });
    }
  }, [activeProject]);

  useEffect(() => {
    // Solución para evitar que el auditor marque los SVGs generados por Recharts como errores (Empty Alt Text)
    const timer = setTimeout(() => {
      document.querySelectorAll('svg.recharts-surface').forEach(svg => {
        svg.setAttribute('aria-hidden', 'true');
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [taskData, severityData]);

  const loadDashboardData = async (projectId: number) => {
    setIsLoading(true);
    try {
      const obs = await api.getObservaciones(projectId);
      const hall = await api.getHallazgos(projectId);

      // Process Observations
      let exitos = 0;
      let totalTiempo = 0;
      let totalErrores = 0;
      const erroresPorTarea: Record<string, number> = {};

      obs.forEach((o: any) => {
        if (o.exito === 'Sí') exitos++;
        totalTiempo += Number(o.tiempo) || 0;
        const errCount = Number(o.errores) || 0;
        totalErrores += errCount;
        
        if (o.tarea) {
          erroresPorTarea[o.tarea] = (erroresPorTarea[o.tarea] || 0) + errCount;
        }
      });

      // `observaciones.tiempo` se guarda como minutos (ej: 1.5, 2.0, 3.0).
      // Por eso aquí NO dividimos entre 60.
      const avgTime = obs.length > 0 ? (totalTiempo / obs.length).toFixed(1) : '0';
      const exitoRate = obs.length > 0 ? Math.round((exitos / obs.length) * 100) : 0;

      // Process task errors for chart
      const tData = Object.keys(erroresPorTarea).map(k => ({
        task: k,
        errores: erroresPorTarea[k]
      }));
      setTaskData(tData);

      // Process Hallazgos
      const sevCounts = { Alta: 0, Media: 0, Baja: 0 };
      hall.forEach((h: any) => {
        if (h.severidad === 'Alta') sevCounts.Alta++;
        else if (h.severidad === 'Media') sevCounts.Media++;
        else if (h.severidad === 'Baja') sevCounts.Baja++;
      });

      setSeverityData([
        { name: 'Alta', value: sevCounts.Alta, color: '#EF4444' },
        { name: 'Media', value: sevCounts.Media, color: '#F59E0B' },
        { name: 'Baja', value: sevCounts.Baja, color: '#10B981' },
      ]);

      setMetrics({
        exitoPercent: `${exitoRate}%`,
        tiempoPromo: `${avgTime} min`,
        totalErrores,
        hallazgosCrit: sevCounts.Alta
      });

      setRecentObservations(obs.slice(-5).reverse());
      setCriticalProblems(hall.filter((h: any) => h.severidad === 'Alta').slice(0, 5));

    } catch (e) {
      console.error('Error fetching dashboard data', e);
    }
    setIsLoading(false);
  };

  if (!activeProject) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl">No hay proyecto seleccionado</h2>
        <p>Por favor selecciona o crea un proyecto en el menú lateral para ver los resultados.</p>
      </div>
    );
  }

  return (
    <div className={`p-8 ${isLoading ? 'opacity-50' : ''}`}>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - {activeProject.nombre}</h1>
          <p className="text-gray-700 mt-1">Resumen general de las pruebas de usabilidad</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Tareas exitosas"
            value={metrics.exitoPercent}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <MetricCard
            title="Tiempo promedio"
            value={metrics.tiempoPromo}
            icon={Clock}
            color="bg-blue-500"
          />
          <MetricCard
            title="Total de errores"
            value={metrics.totalErrores}
            icon={AlertTriangle}
            color="bg-orange-500"
          />
          <MetricCard
            title="Hallazgos críticos"
            value={metrics.hallazgosCrit}
            icon={TrendingUp}
            color="bg-red-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card title="Errores por tarea">
            <span className="sr-only">Gráfico de barras que muestra la cantidad de errores por cada tarea evaluada.</span>
            {taskData.length > 0 ? (
              <div aria-hidden="true" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="task" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="errores" fill="#1E3A5F" name={"Errores detectados"} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-gray-500 min-h-[300px]">
                <AlertTriangle className="w-12 h-12 text-gray-300 mb-3" />
                <p>No hay observaciones registradas aún.</p>
              </div>
            )}
          </Card>

          <Card title="Distribución de severidad">
            <span className="sr-only">Gráfico circular que muestra la distribución de hallazgos por nivel de severidad: Alta, Media y Baja.</span>
            {severityData.every(d => d.value === 0) ? (
              <div className="flex flex-col items-center justify-center p-6 text-gray-500 min-h-[300px]">
                <AlertTriangle className="w-12 h-12 text-gray-300 mb-3" />
                <p>No hay hallazgos registrados aún.</p>
              </div>
            ) : (
              <div aria-hidden="true" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent, value }: any) =>
                        value > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Observaciones recientes">
            <div className="overflow-x-auto min-h-[150px]">
              {recentObservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                  <p>Sin observaciones recientes.</p>
                </div>
              ) : (
                <table className="w-full">
                  <caption className="sr-only">Observaciones recientes</caption>
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th scope="col" className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Participante</th>
                      <th scope="col" className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Tarea</th>
                      <th scope="col" className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentObservations.map((obs, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-3 text-sm">{obs.participante}</td>
                        <td className="py-3 px-3 text-sm">{obs.tarea}</td>
                        <td className="py-3 px-3 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              obs.exito === 'No'
                                ? 'bg-red-100 text-red-800'
                                : obs.exito === 'Con ayuda'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {obs.exito || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>

          <Card title="Problemas críticos detectados">
            <div className="space-y-3">
               {criticalProblems.map((problem, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{problem.problema}</p>
                    <p className="text-xs text-gray-600 mt-1">Frecuencia: {problem.frecuencia}</p>
                  </div>
                </div>
              ))}
              {criticalProblems.length === 0 && (
                 <p className="text-sm text-gray-700">No hay problemas críticos de severidad Alta.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}