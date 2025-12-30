export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const AUTH_TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    STATS: '/auth/stats',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: number) => `/projects/${id}`,
    UPDATE: (id: number) => `/projects/${id}`,
    DELETE: (id: number) => `/projects/${id}`,
    GET_MEMBERS: (id: number) => `/projects/${id}/members`,
    ADD_MEMBER: (id: number) => `/projects/${id}/members`,
    REMOVE_MEMBER: (projectId: number) => `/projects/${projectId}/members`,
  },
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET: (id: number) => `/tasks/${id}`,
    UPDATE: (id: number) => `/tasks/${id}`,
    DELETE: (id: number) => `/tasks/${id}`,
    GET_ASSIGNED_USERS: (id: number) => `/tasks/${id}/assigned-users`,
    ASSIGN_USER: (id: number) => `/tasks/${id}/assign`,
    UNASSIGN_USER: (id: number, email: string) => `/tasks/${id}/unassign/${email}`,
  },
  USERS: {
    LIST: '/users',
  },
} as const
