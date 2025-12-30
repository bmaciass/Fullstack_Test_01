import { compact } from 'lodash-es'
import type { User } from '../../../domain/entities/User'
import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { UserRepository } from '../../../domain/repositories'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { UpdateTaskRequestDto, UpdateTaskResponseDto } from '../../dtos/task/UpdateDto'

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    taskId: number,
    request: UpdateTaskRequestDto,
    userId: number
  ): Promise<UpdateTaskResponseDto> {
    const task = await this.taskRepository.findById(taskId)
    if (!task || task.deletedAt) {
      throw new NotFoundError('Task not found')
    }

    // Get the project to check authorization
    const project = await this.projectRepository.findById(task.projectId)
    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    // Only project creator or members can update tasks
    if (!project.canUserView(userId)) {
      throw new ForbiddenError('You do not have access to this task')
    }

    if (request.name !== undefined) {
      task.updateName(request.name)
    }

    if (request.description !== undefined) {
      task.updateDescription(request.description)
    }

    if (request.status !== undefined) {
      task.updateStatus(request.status)
    }

    if (request.priority !== undefined) {
      task.updatePriority(request.priority)
    }

    let assignToMembers: Pick<User, 'username'>[] = []

    if (request.assignTo) {
      const assignTo = request.assignTo
        ? compact(
            await Promise.all(
              request.assignTo.map(({ username }) => this.userRepository.findByUsername(username))
            )
          )
        : undefined

      if (assignTo) {
        assignToMembers = assignTo.map(user => ({ username: user.username }))
        for (const user of assignTo) {
          task.assignUser(user.id)
        }
      }
    }

    const updatedTask = await this.taskRepository.save(task)

    return {
      id: updatedTask.id,
      name: updatedTask.name,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      assignedMembers: assignToMembers,
    }
  }
}
