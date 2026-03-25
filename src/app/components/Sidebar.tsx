import { NavLink } from 'react-router';
import { LayoutDashboard, FileText, ListChecks, Eye, TrendingUp, FolderPlus, Folder } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useState } from 'react';
import { MessageModal } from './MessageModal';

export function Sidebar() {
  const { proyectos, activeProject, setActiveProject, createProyecto, refreshProyectos } = useProject();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [modal, setModal] = useState<{ open: boolean; title: string; message: string; variant: 'success' | 'error' | 'info' }>({
    open: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const showModal = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setModal({ open: true, title, message, variant });
  };

  const handleCreate = async () => {
    if (!newProjectName.trim() || !newProjectDesc.trim()) {
      showModal('Validación', 'Todos los campos del proyecto son obligatorios. No se permiten datos en blanco.', 'error');
      return;
    }
    await createProyecto(newProjectName, newProjectDesc);
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plan', label: 'Plan de prueba', icon: FileText },
    { to: '/tareas', label: 'Tareas y guion', icon: ListChecks },
    { to: '/observaciones', label: 'Observaciones', icon: Eye },
    { to: '/hallazgos', label: 'Hallazgos', icon: TrendingUp },
  ];

  return (
    <aside
      aria-label="Menú principal"
      className="w-full sm:w-64 bg-white shadow-lg h-auto sm:h-screen sm:sticky sm:top-0 flex flex-col overflow-y-auto"
    >
      <div className="p-6 bg-[#1E3A5F]">
        <h2 className="text-white font-bold text-lg">UX Testing</h2>
        <p className="text-blue-200 text-sm mt-1">Sistema de Usabilidad</p>
        
        <div className="mt-6">
          <label htmlFor="project-select" className="text-xs text-blue-200 uppercase font-semibold mb-2 block">Proyecto Actual</label>
          <div className="relative">
            <select
              id="project-select"
              className="w-full bg-[#152d47] text-white text-sm rounded-md py-2 pl-2 pr-8 appearance-none border border-[#2a4d7a] focus:outline-none focus:border-blue-400 truncate"
              value={activeProject?.id || ''}
              onChange={(e) => {
                const p = proyectos.find((p) => p.id === Number(e.target.value));
                setActiveProject(p || null);
              }}
            >
              {proyectos.length === 0 && <option value="">Sin proyectos</option>}
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <Folder aria-hidden="true" className="absolute right-2 top-2.5 w-4 h-4 text-blue-300 pointer-events-none" />
          </div>
          
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-white hover:text-white transition-colors py-1 border border-transparent hover:border-blue-400 rounded-md bg-[#152d47] hover:bg-[#1a385f]"
          >
            <FolderPlus aria-hidden="true" className="w-3 h-3" />
            {isCreating ? 'Cancelar' : 'Nuevo Proyecto'}
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="p-4 bg-[#152d47] border-b border-[#2a4d7a]">
          <input
            type="text"
            placeholder="Nombre del proyecto..."
            className="w-full text-sm p-2 mb-2 rounded bg-white text-gray-900 border-none focus:ring-2 focus:ring-blue-500"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Descripción (opcional)..."
            className="w-full text-sm p-2 mb-2 rounded bg-white text-gray-900 border-none focus:ring-2 focus:ring-blue-500"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
          />
          <button
            onClick={handleCreate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded transition-colors"
          >
            Crear
          </button>
        </div>
      )}
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#1E3A5F] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon aria-hidden="true" className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-700 text-center">
          © 2026 Usability Testing Dashboard
        </p>
      </div>

      <MessageModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />
    </aside>
  );
}
