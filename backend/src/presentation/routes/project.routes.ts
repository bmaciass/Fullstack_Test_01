import { AddMemberUseCase } from '../../application/use-cases/project/AddMemberUseCase'
import { CreateProjectUseCase } from '../../application/use-cases/project/CreateUseCase'
import { DeleteProjectUseCase } from '../../application/use-cases/project/DeleteUseCase'
import { GetProjectByIdUseCase } from '../../application/use-cases/project/GetByIdUseCase'
import { GetProjectMembersUseCase } from '../../application/use-cases/project/GetProjectMembersUseCase'
import { ListProjectsUseCase } from '../../application/use-cases/project/ListUseCase'
import { RemoveMemberUseCase } from '../../application/use-cases/project/RemoveMemberUseCase'
import { UpdateProjectUseCase } from '../../application/use-cases/project/UpdateUseCase'
import { prisma } from '../../infrastructure/prisma/prismaClient'
import { PrismaProjectRepository } from '../../infrastructure/repositories/PrismaProjectRepository'
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository'
import { ProjectController } from '../controllers/ProjectController'
import { createProjectRouter } from './factories/projectRouteFactory'

const projectRepository = new PrismaProjectRepository(prisma)
const userRepository = new PrismaUserRepository(prisma)

const projectController = new ProjectController({
  create: new CreateProjectUseCase(projectRepository),
  update: new UpdateProjectUseCase(projectRepository),
  delete: new DeleteProjectUseCase(projectRepository),
  list: new ListProjectsUseCase(projectRepository),
  getById: new GetProjectByIdUseCase(projectRepository),
  getMembers: new GetProjectMembersUseCase(projectRepository, userRepository),
  addMember: new AddMemberUseCase(projectRepository, userRepository),
  removeMember: new RemoveMemberUseCase(projectRepository, userRepository),
})

const router = createProjectRouter(projectController)

export { router as projectRouter }
