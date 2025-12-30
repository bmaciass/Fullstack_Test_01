import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { UnassignUserFromTaskResponseDto } from '../../dtos/task/UnassignUserDto'

export class UnassignUserFromTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    taskId: number,
    userEmail: string,
    currentUserId: number
  ): Promise<UnassignUserFromTaskResponseDto> {
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

    // Find user by email
    const user = await this.userRepository.findByEmail(userEmail)

    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found')
    }

    // Unassign user using domain logic (this will throw if not assigned)
    task.unassignUser(user.id)

    await this.taskRepository.save(task)

    return {
      id: task.id,
      message: 'User unassigned from task successfully',
    }
  }
}
