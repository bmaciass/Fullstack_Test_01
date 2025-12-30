import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage, RegisterPage } from '../features/auth'
import { DashboardPage } from '../features/dashboard'
import { ProjectsListPage, ProjectDetailPage } from '../features/projects'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { ProtectedRoute } from '../shared/components'
import { ROUTES } from '../shared/constants'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.PROJECTS,
        element: <ProjectsListPage />,
      },
      {
        path: ROUTES.PROJECT_DETAIL,
        element: <ProjectDetailPage />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <p className="text-xl text-gray-600 mt-4">Page not found</p>
        </div>
      </div>
    ),
  },
])
