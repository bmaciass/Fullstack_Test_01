import { AssignUserToTaskUseCase } from '../../application/use-cases/task/AssignUserToTaskUseCase'
import { CreateTaskUseCase } from '../../application/use-cases/task/CreateTaskUseCase'
import { DeleteTaskUseCase } from '../../application/use-cases/task/DeleteTaskUseCase'
import { GetTaskAssignedUsersUseCase } from '../../application/use-cases/task/GetTaskAssignedUsersUseCase'
import { GetTaskByIdUseCase } from '../../application/use-cases/task/GetTaskByIdUseCase'
import { ListTasksUseCase } from '../../application/use-cases/task/ListTasksUseCase'
import { UnassignUserFromTaskUseCase } from '../../application/use-cases/task/UnassignUserFromTaskUseCase'
import { UpdateTaskUseCase } from '../../application/use-cases/task/UpdateTaskUseCase'
import { prisma } from '../../infrastructure/prisma/prismaClient'
import { PrismaProjectRepository } from '../../infrastructure/repositories/PrismaProjectRepository'
import { PrismaTaskRepository } from '../../infrastructure/repositories/PrismaTaskRepository'
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository'
import { TaskController } from '../controllers/TaskController'
import { createTaskRouter } from './factories/taskRouteFactory'

const taskRepository = new PrismaTaskRepository(prisma)
const projectRepository = new PrismaProjectRepository(prisma)
const userRepository = new PrismaUserRepository(prisma)

const taskController = new TaskController({
  create: new CreateTaskUseCase(taskRepository, projectRepository),
  update: new UpdateTaskUseCase(taskRepository, projectRepository),
  delete: new DeleteTaskUseCase(taskRepository, projectRepository),
  list: new ListTasksUseCase(taskRepository, projectRepository),
  getById: new GetTaskByIdUseCase(taskRepository, projectRepository),
  assignUser: new AssignUserToTaskUseCase(taskRepository, projectRepository, userRepository),
  unassignUser: new UnassignUserFromTaskUseCase(taskRepository, projectRepository, userRepository),
  getAssignedUsers: new GetTaskAssignedUsersUseCase(taskRepository, projectRepository, userRepository),
})

const router = createTaskRouter(taskController)

export default router
