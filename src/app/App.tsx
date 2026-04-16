import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ProjectProvider } from './context/ProjectContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <ProjectProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </ProjectProvider>
  );
}