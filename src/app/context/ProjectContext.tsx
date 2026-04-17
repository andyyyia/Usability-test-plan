import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

const ACTIVE_PROJECT_STORAGE_KEY = 'usability-test-plan.active-project-id';

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
  editProyecto: (id: number, nombre: string, desc: string) => Promise<void>;
  deleteProyecto: (id: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [activeProject, setActiveProject] = useState<Proyecto | null>(null);
  const [hasLoadedProjects, setHasLoadedProjects] = useState(false);

  const refreshProyectos = async () => {
    try {
      const data = await api.getProyectos();
      setProyectos(data);
      setActiveProject((prev) => {
        const storedProjectId = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
        const parsedStoredProjectId = storedProjectId ? Number(storedProjectId) : null;

        if (data.length === 0) return null;

        if (prev) {
          const stillExists = data.find((p: Proyecto) => p.id === prev.id);
          return stillExists ? stillExists : data[0];
        }

        if (parsedStoredProjectId !== null && !Number.isNaN(parsedStoredProjectId)) {
          const storedProject = data.find((p: Proyecto) => p.id === parsedStoredProjectId);
          if (storedProject) {
            return storedProject;
          }
        }

        return data[0];
      });
    } catch (e) {
      console.error('Error fetching proyectos:', e);
    } finally {
      setHasLoadedProjects(true);
    }
  };

  const createProyecto = async (nombre: string, desc: string) => {
    const newP = await api.createProyecto(nombre, desc);
    await refreshProyectos();
    setActiveProject(newP);
  };

  const editProyecto = async (id: number, nombre: string, desc: string) => {
    const updated = await api.updateProyecto(id, nombre, desc);
    await refreshProyectos();
    if (activeProject?.id === id) {
      setActiveProject(updated);
    }
  };

  const deleteProyecto = async (id: number) => {
    await api.deleteProyecto(id);
    await refreshProyectos();
  };

  useEffect(() => {
    refreshProyectos();
  }, []);

  useEffect(() => {
    if (!hasLoadedProjects) {
      return;
    }

    if (!activeProject) {
      window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, String(activeProject.id));
  }, [activeProject, hasLoadedProjects]);

  return (
    <ProjectContext.Provider value={{
      proyectos,
      activeProject,
      setActiveProject,
      refreshProyectos,
      createProyecto,
      editProyecto,
      deleteProyecto
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
