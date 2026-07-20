import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [MainRoutes], // Only use MainRoutes, remove the conflicting root route
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;