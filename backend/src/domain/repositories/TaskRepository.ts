import type { Task, TaskPriority, TaskStatus } from '../entities/Task'

export type TaskFilter = {
  // Pagination
  offset?: number
  limit?: number

  // Filtering
  projectId?: number
  status?: TaskStatus
  priority?: TaskPriority
  assignedUserId?: number
  includeDeleted?: boolean
  onlyDeleted?: boolean

  // Sorting
  sortBy?: 'name' | 'priority' | 'status' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type TaskFilterResult = {
  tasks: Task[]
  total: number
}

export interface TaskRepository {
  // Basic CRUD
  findById(id: number): Promise<Task | null>
  findAll(filter?: TaskFilter): Promise<TaskFilterResult>
  save(task: Task): Promise<Task>
  delete(id: number): Promise<void>

  // Validation helpers
  existsById(id: number): Promise<boolean>
  existsByName(name: string, projectId: number, excludeId?: number): Promise<boolean>

  // Assignment management
  assignUser(taskId: number, userId: number): Promise<void>
  unassignUser(taskId: number, userId: number): Promise<void>
  isAssignedToUser(taskId: number, userId: number): Promise<boolean>
}