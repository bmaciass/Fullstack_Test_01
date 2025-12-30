import type { TaskPriority, TaskStatus } from '../../../domain/entities/Task'
import type { User } from '../../../domain/entities/User'

export interface UpdateTaskRequestDto {
  name?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignTo?: Pick<User, 'username'>[]
}

export interface UpdateTaskResponseDto {
  id: number
  name: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignedMembers: Pick<User, 'username'>[]
}
