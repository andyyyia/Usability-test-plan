import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { UnsavedChangesProvider } from '../context/UnsavedChangesContext';

export function Layout() {
  return (
    <UnsavedChangesProvider>
      <div
        className="flex min-h-screen bg-gray-100 flex-col sm:flex-row"
        style={{ fontFamily: 'var(--font-body, "DM Sans", sans-serif)' }}
      >
        <Sidebar />
        <main className="flex-1 min-w-0 p-[var(--space-8)]">
          <div className="max-w-[1100px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </UnsavedChangesProvider>
  );
}
