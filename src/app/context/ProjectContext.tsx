import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
}

interface ProjectContextType {
  proyectos: Proyecto[];
  activeProject: Proyecto | null;
  setActiveProject: (p: Proyecto | null) => void;
  refreshProyectos: () => Promise<void>;
  createProyecto: (nombre: string, desc: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [activeProject, setActiveProject] = useState<Proyecto | null>(null);

  const refreshProyectos = async () => {
    try {
      const data = await api.getProyectos();
      setProyectos(data);
      if (data.length > 0 && !activeProject) {
        setActiveProject(data[0]);
      } else if (data.length === 0) {
        setActiveProject(null);
      }
    } catch (e) {
      console.error('Error fetching proyectos:', e);
    }
  };

  const createProyecto = async (nombre: string, desc: string) => {
    const newP = await api.createProyecto(nombre, desc);
    await refreshProyectos();
    setActiveProject(newP);
  };

  useEffect(() => {
    refreshProyectos();
  }, []);

  return (
    <ProjectContext.Provider value={{
      proyectos,
      activeProject,
      setActiveProject,
      refreshProyectos,
      createProyecto
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
