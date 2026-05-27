import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { UnsavedChangesProvider } from '../context/UnsavedChangesContext';
import { IconMenu2, IconMoon, IconSun } from '@tabler/icons-react';
import { useDarkMode } from '../../hooks/useDarkMode';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <UnsavedChangesProvider>
      <div
        className="flex min-h-screen bg-[var(--color-bg)] flex-col md:flex-row relative"
        style={{ fontFamily: 'var(--font-body, "DM Sans", sans-serif)' }}
      >
        {/* Mobile Header containing Hamburger Menu */}
        <header className="md:hidden bg-[var(--color-sidebar)] text-white flex items-center justify-between p-4 sticky top-0 z-30 shadow-md">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 rounded-md text-white hover:bg-blue-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Abrir menú de navegación"
            aria-expanded={isSidebarOpen}
          >
            <IconMenu2 size={24} />
          </button>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-title)' }}>UX Testing</span>
          <div className="w-6" /> {/* spacer to balance the header */}
        </header>

        {/* Overlay backdrop on mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar isMobileOpen={isSidebarOpen} onCloseMobile={() => setIsSidebarOpen(false)} />

        <main className="flex-1 min-w-0 p-[var(--space-6)] lg:p-[var(--space-8)]">
          <div className="max-w-[1100px] mx-auto w-full">
            <div className="flex justify-end mb-6">
              <button
                type="button"
                className="theme-toggle-button"
                onClick={toggleDarkMode}
                aria-label={darkMode ? 'Desactivar modo oscuro' : 'Activar modo oscuro'}
              >
                {darkMode ? <IconSun size={18} /> : <IconMoon size={18} />}
              </button>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </UnsavedChangesProvider>
  );
}
