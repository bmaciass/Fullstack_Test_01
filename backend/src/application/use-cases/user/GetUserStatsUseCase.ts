import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { GetUserStatsResponseDto } from '../../dtos/user/UserStatsDto'

export class GetUserStatsUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(userId: number): Promise<GetUserStatsResponseDto> {
    // Get all projects where user is creator or member
    const { projects: allProjects } = await this.projectRepository.findAll()
    const userProjects = allProjects.filter(
      project => !project.isDeleted && project.canUserView(userId)
    )
    const projectsCount = userProjects.length

    // Get all tasks where user is assigned
    const { tasks: allTasks } = await this.taskRepository.findAll()
    const userTasks = allTasks.filter(task => !task.isDeleted && task.isAssignedToUser(userId))

    // Count pending tasks
    const pendingTasksCount = userTasks.filter(task => task.isPending).length

    // Count in-progress tasks
    const inProgressTasksCount = userTasks.filter(task => task.isInProgress).length

    return {
      projectsCount,
      pendingTasksCount,
      inProgressTasksCount,
    }
  }
}
