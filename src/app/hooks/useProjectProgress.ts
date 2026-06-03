import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StepItem } from '../components/Stepper';

export function useProjectProgress(projectId: number | undefined) {
  const [projectProgress, setProjectProgress] = useState({
    hasPlan: false,
    hasTareas: false,
    hasObservaciones: false,
    hasHallazgos: false,
    hasSprintBacklog: false,
  });

  const loadProgress = async (id: number) => {
    try {
      const [plan, tareasData, obs, hall, backlog] = await Promise.all([
        api.getPlan(id).catch(() => null),
        api.getTareasGuion(id).catch(() => []),
        api.getObservaciones(id).catch(() => []),
        api.getHallazgos(id).catch(() => []),
        api.getSprintBacklog(id).catch(() => null),
      ]);

      setProjectProgress({
        hasPlan: !!plan,
        hasTareas: Array.isArray(tareasData) && tareasData.length > 0,
        hasObservaciones: Array.isArray(obs) && obs.length > 0,
        hasHallazgos: Array.isArray(hall) && hall.length > 0,
        hasSprintBacklog:
          Array.isArray(backlog?.historias) && backlog.historias.length > 0,
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
    const { hasPlan, hasTareas, hasObservaciones, hasHallazgos, hasSprintBacklog } =
      projectProgress;

    return [
      {
        id: 1,
        label: 'Plan de prueba',
        status: hasPlan ? 'completed' : 'current',
      },
      {
        id: 2,
        label: 'Tareas y guion',
        status: hasTareas ? 'completed' : hasPlan ? 'current' : 'pending',
      },
      {
        id: 3,
        label: 'Observaciones',
        status: hasObservaciones ? 'completed' : hasTareas ? 'current' : 'pending',
      },
      {
        id: 4,
        label: 'Hallazgos',
        status: hasHallazgos ? 'completed' : hasObservaciones ? 'current' : 'pending',
      },
      {
        id: 5,
        label: 'Sprint Backlog IA',
        status: hasSprintBacklog ? 'completed' : hasHallazgos ? 'current' : 'pending',
        statusText: hasSprintBacklog
          ? 'Generado'
          : hasHallazgos
          ? 'Listo para generar'
          : 'Pendiente',
      },
    ];
  };

  return {
    projectProgress,
    getSteps,
    reloadProgress: () => projectId && loadProgress(projectId),
  };
}
