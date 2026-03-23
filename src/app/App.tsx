import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ProjectProvider } from './context/ProjectContext';

export default function App() {
  return (
    <ProjectProvider>
      <RouterProvider router={router} />
    </ProjectProvider>
  );
}