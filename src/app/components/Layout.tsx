import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
