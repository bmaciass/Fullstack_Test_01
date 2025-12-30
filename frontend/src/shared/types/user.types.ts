export interface User {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface UserSummary {
  email: string
  username: string
  firstName: string
  lastName: string
  fullName: string
}

export interface ListUsersQuery {
  limit?: number
  offset?: number
  sortBy?: 'email' | 'username' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface PaginatedUsers {
  users: UserSummary[]
  total: number
}

export interface UserStats {
  projectsCount: number
  pendingTasksCount: number
  inProgressTasksCount: number
}