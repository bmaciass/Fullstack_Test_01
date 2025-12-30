import { ListUsersUseCase } from '../../application/use-cases/user/ListUsersUseCase'
import { prisma } from '../../infrastructure/prisma/prismaClient'
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository'
import { UserController } from '../controllers/UserController'
import { createUserRouter } from './factories/userRouteFactory'

const userRepository = new PrismaUserRepository(prisma)

const userController = new UserController({
  list: new ListUsersUseCase(userRepository),
})

const router = createUserRouter(userController)

export { router as userRouter }
