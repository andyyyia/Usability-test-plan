import { NavLink } from 'react-router';
import { LayoutDashboard, FileText, ListChecks, Eye, TrendingUp, FolderPlus, Folder, Edit2, Trash2, X, MoreVertical } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from './ConfirmModal';

export function Sidebar() {
  const { proyectos, activeProject, setActiveProject, createProyecto, refreshProyectos, editProyecto, deleteProyecto } = useProject();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [isEditingProj, setIsEditingProj] = useState(false);
  const [editProjName, setEditProjName] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  useEffect(() => {
    if (isEditingProj && activeProject) {
      setEditProjName(activeProject.nombre);
      setEditProjDesc(activeProject.descripcion || '');
    }
  }, [isEditingProj, activeProject]);

  const handleCreate = async () => {
    if (!newProjectName.trim()) {
      toast.error('Validación', { description: 'El nombre del proyecto es obligatorio.' });
      return;
    }
    setIsProcessing(true);
    try {
      await createProyecto(newProjectName, newProjectDesc);
      setIsCreating(false);
      setNewProjectName('');
      setNewProjectDesc('');
      toast.success('Proyecto creado correctamente');
    } catch(e) {
      toast.error('Error al crear proyecto');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditProject = async () => {
    if (!editProjName.trim()) {
      toast.error('Validación', { description: 'El nombre del proyecto es obligatorio.' });
      return;
    }
    if (!activeProject) return;
    setIsProcessing(true);
    try {
      await editProyecto(activeProject.id, editProjName, editProjDesc);
      setIsEditingProj(false);
      toast.success('Proyecto actualizado correctamente');
    } catch (e) {
      toast.error('Error al actualizar el proyecto');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    setIsProcessing(true);
    try {
      await deleteProyecto(activeProject.id);
      setConfirmDelete(false);
      toast.success('Proyecto eliminado correctamente');
    } catch (e) {
      toast.error('Error al eliminar el proyecto');
    } finally {
      setIsProcessing(false);
    }
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
        
        <div className="mt-8 bg-[#152d47] p-3 rounded-lg border border-[#2a4d7a] shadow-inner relative">
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="project-select" className="text-[10px] text-blue-300 uppercase tracking-wider font-bold block">Proyecto Activo</label>
            <button 
              onClick={() => setShowProjectMenu(!showProjectMenu)} 
              className="text-blue-400 hover:text-white p-0.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400"
              aria-label="Opciones de proyecto"
              aria-expanded={showProjectMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <select
              id="project-select"
              className="w-full bg-[#0d1f35] font-semibold text-white text-sm rounded-md py-2.5 pl-3 pr-8 appearance-none border border-[#2a4d7a] focus:outline-none focus:border-blue-400 truncate shadow-sm transition-colors cursor-pointer hover:bg-[#112740]"
              value={activeProject?.id || ''}
              onChange={(e) => {
                const p = proyectos.find((p) => p.id === Number(e.target.value));
                setActiveProject(p || null);
                setIsEditingProj(false);
                setShowProjectMenu(false);
              }}
            >
              {proyectos.length === 0 && <option value="">Sin proyectos</option>}
              {proyectos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <Folder aria-hidden="true" className="absolute right-3 top-3 w-4 h-4 text-blue-400 pointer-events-none" />
          </div>
          
          {showProjectMenu && (
            <>
              {/* Optional overlay to catch clicks outside */}
              <div className="fixed inset-0 z-10" onClick={() => setShowProjectMenu(false)}></div>
              <div className="absolute right-0 top-10 mt-1 w-44 bg-white rounded-md shadow-xl z-20 border border-gray-200 overflow-hidden">
                <button 
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors font-medium border-b border-gray-100"
                  onClick={() => { setIsCreating(true); setIsEditingProj(false); setShowProjectMenu(false); }}
                >
                  <FolderPlus className="w-4 h-4 text-blue-600" />
                  Nuevo Proyecto
                </button>
                {activeProject && (
                  <>
                    <button 
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors font-medium"
                      onClick={() => { setIsEditingProj(true); setIsCreating(false); setShowProjectMenu(false); }}
                    >
                      <Edit2 className="w-4 h-4 text-orange-500" />
                      Editar actual
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                      onClick={() => { setConfirmDelete(true); setShowProjectMenu(false); }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      Eliminar actual
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="p-4 bg-[#152d47] border-b border-[#2a4d7a]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs text-blue-200 uppercase tracking-wider font-bold">Crear Proyecto</h3>
            <button onClick={() => setIsCreating(false)} className="text-blue-300 hover:text-white"><X className="w-4 h-4"/></button>
          </div>
          <input
            type="text"
            placeholder="Nombre del proyecto..."
            className="w-full text-sm p-2 mb-2 rounded bg-white text-gray-900 border-none focus:ring-2 focus:ring-blue-500"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            maxLength={50}
          />
          <input
            type="text"
            placeholder="Descripción (opcional)..."
            className="w-full text-sm p-2 mb-3 rounded bg-white text-gray-900 border-none focus:ring-2 focus:ring-blue-500"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            maxLength={150}
          />
          <button
            onClick={handleCreate}
            disabled={isProcessing}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Procesando...' : 'Crear'}
          </button>
        </div>
      )}

      {isEditingProj && activeProject && (
        <div className="p-4 bg-[#1a385f] border-b border-[#2a4d7a]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs text-blue-200 uppercase tracking-wider font-bold">Editar Proyecto</h3>
            <button onClick={() => setIsEditingProj(false)} className="text-blue-300 hover:text-white"><X className="w-4 h-4"/></button>
          </div>
          <input
            type="text"
            placeholder="Nombre del proyecto..."
            className="w-full text-sm p-2 mb-2 rounded bg-white text-gray-900 border-none focus:ring-2 focus:ring-blue-500"
            value={editProjName}
            onChange={(e) => setEditProjName(e.target.value)}
            maxLength={50}
          />
          <input
            type="text"
            placeholder="Descripción..."
            className="w-full text-sm p-2 mb-3 rounded bg-white text-gray-900 border-none focus:ring-2 focus:ring-blue-500"
            value={editProjDesc}
            onChange={(e) => setEditProjDesc(e.target.value)}
            maxLength={150}
          />
          <button
            onClick={handleEditProject}
            disabled={isProcessing}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 rounded transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
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

      <ConfirmModal
        open={confirmDelete}
        title="Eliminar Proyecto"
        message="¿Seguro que deseas eliminar este proyecto y todos sus planes, guiones, observaciones y hallazgos asociados? Esta acción no se puede deshacer."
        confirmText={isProcessing ? "Eliminando..." : "Sí, eliminar todo"}
        cancelText="Cancelar"
        onCancel={() => !isProcessing && setConfirmDelete(false)}
        onConfirm={handleDeleteProject}
      />
    </aside>
  );
}
