export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  name: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  projectId: number
  assignedUsers: UserSummary[]
  createdById: number
  dueDate: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface UserSummary {
  email: string
  username: string
  firstName: string
  lastName: string
  fullName: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  projectId: number
  assignedToId?: number
  dueDate?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedToId?: number
  dueDate?: string
}

export interface ListTasksQuery {
  projectId?: number
  status?: TaskStatus
  priority?: TaskPriority
  assignedUserId?: number
  limit?: number
  offset?: number
  sortBy?: 'name' | 'priority' | 'status' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedTasks {
  tasks: Task[]
  total: number
}
