import express, { type Application } from 'express'
import { AddMemberUseCase } from '../../src/application/use-cases/project/AddMemberUseCase'
import { CreateProjectUseCase } from '../../src/application/use-cases/project/CreateUseCase'
import { DeleteProjectUseCase } from '../../src/application/use-cases/project/DeleteUseCase'
import { GetProjectByIdUseCase } from '../../src/application/use-cases/project/GetByIdUseCase'
import { GetProjectMembersUseCase } from '../../src/application/use-cases/project/GetProjectMembersUseCase'
import { ListProjectsUseCase } from '../../src/application/use-cases/project/ListUseCase'
import { RemoveMemberUseCase } from '../../src/application/use-cases/project/RemoveMemberUseCase'
import { UpdateProjectUseCase } from '../../src/application/use-cases/project/UpdateUseCase'
import type { ProjectRepository } from '../../src/domain/repositories/ProjectRepository'
import type { UserRepository } from '../../src/domain/repositories/UserRepository'
import { ProjectController } from '../../src/presentation/controllers/ProjectController'
import { errorHandler } from '../../src/presentation/middlewares/errorHandler'
import { createProjectRouter } from '../../src/presentation/routes/factories/projectRouteFactory'

export const createTestAppWithProjects = (
  projectRepository: ProjectRepository,
  userRepository: UserRepository
): Application => {
  const app = express()
  app.use(express.json())

  const projectController = new ProjectController({
    create: new CreateProjectUseCase(projectRepository),
    update: new UpdateProjectUseCase(projectRepository),
    delete: new DeleteProjectUseCase(projectRepository),
    list: new ListProjectsUseCase(projectRepository),
    getById: new GetProjectByIdUseCase(projectRepository),
    addMember: new AddMemberUseCase(projectRepository, userRepository),
    removeMember: new RemoveMemberUseCase(projectRepository, userRepository),
    getMembers: new GetProjectMembersUseCase(projectRepository, userRepository),
  })

  const router = createProjectRouter(projectController)

  app.use('/projects', router)
  app.use(errorHandler)

  return app
}
