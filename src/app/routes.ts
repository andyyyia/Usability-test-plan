import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PlanDePrueba } from './pages/PlanDePrueba';
import { TareasYGuion } from './pages/TareasYGuion';
import { Observaciones } from './pages/Observaciones';
import { Hallazgos } from './pages/Hallazgos';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'plan', Component: PlanDePrueba },
      { path: 'tareas', Component: TareasYGuion },
      { path: 'observaciones', Component: Observaciones },
      { path: 'hallazgos', Component: Hallazgos },
    ],
  },
]);
