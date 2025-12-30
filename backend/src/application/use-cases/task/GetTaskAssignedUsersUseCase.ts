import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { GetTaskAssignedUsersResponseDto } from '../../dtos/task/GetAssignedUsersDto'

export class GetTaskAssignedUsersUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(taskId: number, currentUserId: number): Promise<GetTaskAssignedUsersResponseDto> {
    const task = await this.taskRepository.findById(taskId)

    if (!task || task.deletedAt) {
      throw new NotFoundError('Task not found')
    }

    // Check if user has access to the project
    const project = await this.projectRepository.findById(task.projectId)
    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    if (!project.canUserView(currentUserId)) {
      throw new ForbiddenError('You do not have access to this project')
    }

    // Get all assigned users
    const users = await Promise.all(
      task.assignedUserIds.map(userId => this.userRepository.findById(userId))
    )

    // Filter out null values and deleted users, and include person data
    const validUsers = users
      .filter(user => user && !user.isDeleted)
      .map(user => ({
        email: user!.email,
        username: user!.username,
        firstName: user!.firstName || '',
        lastName: user!.lastName || '',
        fullName: user!.fullName || user!.username,
      }))

    return {
      users: validUsers,
    }
  }
}
