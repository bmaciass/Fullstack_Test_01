import express, { type Application } from 'express'
import { TaskController } from '../../src/presentation/controllers/TaskController'
import { CreateTaskUseCase } from '../../src/application/use-cases/task/CreateTaskUseCase'
import { UpdateTaskUseCase } from '../../src/application/use-cases/task/UpdateTaskUseCase'
import { DeleteTaskUseCase } from '../../src/application/use-cases/task/DeleteTaskUseCase'
import { ListTasksUseCase } from '../../src/application/use-cases/task/ListTasksUseCase'
import { GetTaskByIdUseCase } from '../../src/application/use-cases/task/GetTaskByIdUseCase'
import { errorHandler } from '../../src/presentation/middlewares/errorHandler'
import { createTaskRouter } from '../../src/presentation/routes/factories/taskRouteFactory'
import type { MockTaskRepository } from './mockTaskRepository'
import type { MockProjectRepository } from './mockProjectRepository'

export const createTestAppWithTasks = (
  taskRepository: MockTaskRepository,
  projectRepository: MockProjectRepository
): Application => {
  const app = express()
  app.use(express.json())

  const taskController = new TaskController({
    create: new CreateTaskUseCase(taskRepository, projectRepository),
    update: new UpdateTaskUseCase(taskRepository, projectRepository),
    delete: new DeleteTaskUseCase(taskRepository, projectRepository),
    list: new ListTasksUseCase(taskRepository, projectRepository),
    getById: new GetTaskByIdUseCase(taskRepository, projectRepository),
  })

  const router = createTaskRouter(taskController)

  app.use('/tasks', router)
  app.use(errorHandler)

  return app
}
