import { lazy } from 'react';
import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Login = lazy(() => import('../views/auth/login'));
const ForgotPassword = lazy(() => import('../views/auth/forgot-password'));
const ResetPasswordPage = lazy(() => import('../views/auth/reset-password'));
const LoginSessions = lazy(() => import('../components/LoginSessions'));
const AdminLogs = lazy(() => import('../components/AdminLogs'));
const Roles = lazy(() => import('../components/Role'));
// const Permissions = lazy(() => import('../components/Permissions'));
// const RolePermissions = lazy(() => import('../components/RolePermissions'));
// const Users = lazy(() => import('../components/Users'));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          index: true,
          element: <Login />
        },
        {
          path: 'login',
          element: <Login />
        },
        {
          path: 'forgot-password',
          element: <ForgotPassword />
        },
        {
          path: 'reset-password',
          element: <ResetPasswordPage />
        }
      ]
    },
    // PROTECTED ROUTES
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: 'dashboard',
          index: true,
          element: <DashboardSales />
        },

        // Security routes

        // { path: 'security/users', element: <Users /> },
        { path: 'security/login-sessions', element: <LoginSessions /> },
        { path: 'security/roles', element: <Roles /> },
        // { path: 'security/permissions', element: <Permissions /> },
       // { path: 'security/role-permissions', element: <RolePermissions /> },
        { path: 'security/admin-logs', element: <AdminLogs /> },

        // Catch-all for undefined routes
        {
          path: '*',
          element: (
            <div style={{
              minHeight: '60vh', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column', gap: '1rem'
            }}>
              <h2 style={{ color: '#009448', fontSize: '4rem', margin: 0 }}>404</h2>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>Page Not Found</p>
            </div>
          )
        }
      ]
    }
  ]
};

export default MainRoutes;