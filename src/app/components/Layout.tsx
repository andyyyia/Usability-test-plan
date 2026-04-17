import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { UnsavedChangesProvider } from '../context/UnsavedChangesContext';

export function Layout() {
  return (
    <UnsavedChangesProvider>
      <div
        className="flex min-h-screen bg-gray-100 flex-col sm:flex-row"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </UnsavedChangesProvider>
  );
}
