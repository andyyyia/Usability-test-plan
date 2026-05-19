import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StepItem } from '../components/Stepper';

export function useProjectProgress(projectId: number | undefined) {
  const [projectProgress, setProjectProgress] = useState({
    hasPlan: false,
    hasTareas: false,
    hasObservaciones: false,
    hasHallazgos: false,
  });

  const loadProgress = async (id: number) => {
    try {
      const plan = await api.getPlan(id);
      const tareasData = await api.getTareasGuion(id);
      const obs = await api.getObservaciones(id);
      const hall = await api.getHallazgos(id);

      setProjectProgress({
        hasPlan: !!plan,
        hasTareas: tareasData && tareasData.length > 0,
        hasObservaciones: obs && obs.length > 0,
        hasHallazgos: hall && hall.length > 0,
      });
    } catch (e) {
      console.error('Error fetching project progress', e);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProgress(projectId);
    }
  }, [projectId]);

  const getSteps = (): StepItem[] => {
    const { hasPlan, hasTareas, hasObservaciones, hasHallazgos } = projectProgress;
    
    return [
      { 
        id: 1, 
        label: 'Plan de prueba', 
        status: hasPlan ? 'completed' : 'current' 
      },
      { 
        id: 2, 
        label: 'Tareas y guion', 
        status: hasTareas ? 'completed' : (hasPlan ? 'current' : 'pending') 
      },
      { 
        id: 3, 
        label: 'Observaciones', 
        status: hasObservaciones ? 'completed' : (hasTareas ? 'current' : 'pending') 
      },
      { 
        id: 4, 
        label: 'Hallazgos', 
        status: hasHallazgos ? 'completed' : (hasObservaciones ? 'current' : 'pending') 
      },
      { 
        id: 5, 
        label: 'Reporte / Dashboard', 
        status: hasHallazgos ? 'current' : 'pending',
        statusText: hasHallazgos ? 'Listo para revisar' : 'Pendiente'
      }
    ];
  };

  return { projectProgress, getSteps, reloadProgress: () => projectId && loadProgress(projectId) };
}
