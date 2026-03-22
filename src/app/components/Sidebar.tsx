import { NavLink } from 'react-router';
import { LayoutDashboard, FileText, ListChecks, Eye, TrendingUp } from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/plan', label: 'Plan de prueba', icon: FileText },
    { to: '/tareas', label: 'Tareas y guion', icon: ListChecks },
    { to: '/observaciones', label: 'Observaciones', icon: Eye },
    { to: '/hallazgos', label: 'Hallazgos', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
      <div className="p-6 bg-[#1E3A5F]">
        <h2 className="text-white font-bold text-lg">UX Testing</h2>
        <p className="text-blue-200 text-sm mt-1">Sistema de Usabilidad</p>
      </div>
      
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
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2026 Usability Testing Dashboard
        </p>
      </div>
    </aside>
  );
}
