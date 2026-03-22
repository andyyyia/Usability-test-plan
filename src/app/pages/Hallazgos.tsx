import { useState } from 'react';
import { Card } from '../components/Card';
import { Plus, Save, Trash2 } from 'lucide-react';

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
  const [findings, setFindings] = useState<Finding[]>([
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

  const handleChange = (index: number, field: keyof Finding, value: string) => {
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

  const handleSave = () => {
    alert('Hallazgos guardados correctamente');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-purple-100 text-purple-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resuelto':
        return 'bg-green-100 text-green-800';
      case 'En progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const removeFinding = (index: number) => {
    if (confirm('¿Eliminar este hallazgo?')) {
      const newFindings = findings.filter((_, i) => i !== index);
      setFindings(newFindings);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-[1100px] mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Síntesis de hallazgos y plan de mejora</h1>
            <p className="text-gray-600 mt-1">Documenta problemas encontrados y sus recomendaciones</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#152d47] transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar hallazgos
          </button>
        </header>

        <Card title="Hallazgos y recomendaciones">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[200px]">
                    Problema
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Evidencia observada
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[100px]">
                    Frecuencia
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[120px]">
                    Severidad
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">
                    Recomendación
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[120px]">
                    Prioridad
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700 w-[130px]">
                    Estado
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 w-32">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {findings.map((finding, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={finding.problema}
                        onChange={(e) => handleChange(index, 'problema', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent"
                        placeholder="Describe el problema..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        value={finding.evidencia}
                        onChange={(e) => handleChange(index, 'evidencia', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent resize-none"
                        rows={2}
                        placeholder="Qué se observó..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={finding.frecuencia}
                        onChange={(e) => handleChange(index, 'frecuencia', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent"
                        placeholder="4/5"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        value={finding.severidad}
                        onChange={(e) => handleChange(index, 'severidad', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-medium ${getSeverityColor(
                          finding.severidad
                        )}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <textarea
                        value={finding.recomendacion}
                        onChange={(e) => handleChange(index, 'recomendacion', e.target.value)}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded bg-transparent resize-none"
                        rows={2}
                        placeholder="Solución propuesta..."
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        value={finding.prioridad}
                        onChange={(e) => handleChange(index, 'prioridad', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-medium ${getPriorityColor(
                          finding.prioridad
                        )}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <select
                        value={finding.estado}
                        onChange={(e) => handleChange(index, 'estado', e.target.value)}
                        className={`w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-medium ${getStatusColor(
                          finding.estado
                        )}`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En progreso">En progreso</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <button
                        onClick={() => removeFinding(index)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <button
              onClick={addFinding}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir hallazgo
            </button>
          </div>
        </Card>

        {/* Resumen de hallazgos críticos */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900">Severidad Alta</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {findings.filter((f) => f.severidad === 'Alta').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Problemas críticos</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900">Severidad Media</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {findings.filter((f) => f.severidad === 'Media').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Problemas moderados</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-gray-900">Severidad Baja</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {findings.filter((f) => f.severidad === 'Baja').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Mejoras menores</p>
          </div>
        </div>
      </div>
    </div>
  );
}