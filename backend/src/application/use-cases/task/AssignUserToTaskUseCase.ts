import { BadRequestError } from '../../../domain/errors/BadRequestError'
import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type {
  AssignUserToTaskRequestDto,
  AssignUserToTaskResponseDto,
} from '../../dtos/task/AssignUserDto'

export class AssignUserToTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    taskId: number,
    request: AssignUserToTaskRequestDto,
    currentUserId: number
  ): Promise<AssignUserToTaskResponseDto> {
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
    const user = await this.userRepository.findByEmail(request.email)

    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found')
    }

    // Check if user is a member of the project
    if (!project.canUserView(user.id)) {
      throw new BadRequestError('User must be a member of the project to be assigned to tasks')
    }

    // Assign user using domain logic (this will throw if already assigned)
    task.assignUser(user.id)

    await this.taskRepository.save(task)

    return {
      id: task.id,
      message: 'User assigned to task successfully',
    }
  }
}
