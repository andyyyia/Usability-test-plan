const API_URL = 'http://localhost:3001/api';

export const api = {
  // Proyectos
  getProyectos: async () => {
    const res = await fetch(`${API_URL}/proyectos`);
    return res.json();
  },
  createProyecto: async (nombre: string, descripcion: string) => {
    const res = await fetch(`${API_URL}/proyectos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion }),
    });
    return res.json();
  },
  deleteProyecto: async (id: number) => {
    await fetch(`${API_URL}/proyectos/${id}`, { method: 'DELETE' });
  },

  // Planes de Prueba
  getPlan: async (proyectoId: number) => {
    const res = await fetch(`${API_URL}/planes/${proyectoId}`);
    return res.json();
  },
  savePlan: async (planData: any) => {
    const res = await fetch(`${API_URL}/planes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    });
    return res.json();
  },

  // Tareas
  getTareasPlan: async (proyectoId: number) => {
    const res = await fetch(`${API_URL}/tareas-plan/${proyectoId}`);
    return res.json();
  },
  saveTareasPlan: async (proyectoId: number, tareas: any[]) => {
    const res = await fetch(`${API_URL}/tareas-plan/${proyectoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tareas),
    });
    return res.json();
  },
  
  getTareasGuion: async (proyectoId: number) => {
    const res = await fetch(`${API_URL}/tareas-guion/${proyectoId}`);
    return res.json();
  },
  saveTareasGuion: async (proyectoId: number, tareas: any[]) => {
    const res = await fetch(`${API_URL}/tareas-guion/${proyectoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tareas),
    });
    return res.json();
  },

  // Observaciones
  getObservaciones: async (proyectoId: number) => {
    const res = await fetch(`${API_URL}/observaciones/${proyectoId}`);
    return res.json();
  },
  saveObservaciones: async (proyectoId: number, observaciones: any[]) => {
    const res = await fetch(`${API_URL}/observaciones/${proyectoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(observaciones),
    });
    return res.json();
  },

  // Hallazgos
  getHallazgos: async (proyectoId: number) => {
    const res = await fetch(`${API_URL}/hallazgos/${proyectoId}`);
    return res.json();
  },
  saveHallazgos: async (proyectoId: number, hallazgos: any[]) => {
    const res = await fetch(`${API_URL}/hallazgos/${proyectoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hallazgos),
    });
    return res.json();
  },
};
