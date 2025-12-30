import { GetCurrentUserUseCase } from '../../application/use-cases/auth/GetCurrentUserUseCase'
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase'
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase'
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase'
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase'
import { GetUserStatsUseCase } from '../../application/use-cases/user/GetUserStatsUseCase'
import { prisma } from '../../infrastructure/prisma/prismaClient'
import { PrismaPersonRepository } from '../../infrastructure/repositories/PrismaPersonRepository'
import { PrismaProjectRepository } from '../../infrastructure/repositories/PrismaProjectRepository'
import { PrismaTaskRepository } from '../../infrastructure/repositories/PrismaTaskRepository'
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository'
import { JwtService } from '../../infrastructure/services/JwtService'
import { PasswordHashService } from '../../infrastructure/services/PasswordHashService'
import { AuthController } from '../controllers/AuthController'
import { createAuthRouter } from './factories/authRouteFactory'

// Instantiate dependencies
const userRepository = new PrismaUserRepository(prisma)
const personRepository = new PrismaPersonRepository(prisma)
const projectRepository = new PrismaProjectRepository(prisma)
const taskRepository = new PrismaTaskRepository(prisma)
const passwordHashService = new PasswordHashService()
const jwtService = new JwtService()

// Instantiate use cases
const loginUseCase = new LoginUseCase(userRepository, passwordHashService, jwtService)
const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, jwtService)
const logoutUseCase = new LogoutUseCase()
const registerUseCase = new RegisterUseCase(
  userRepository,
  personRepository,
  passwordHashService,
  jwtService
)
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository)
const getUserStatsUseCase = new GetUserStatsUseCase(projectRepository, taskRepository)

// Instantiate controller
const authController = new AuthController(
  loginUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  registerUseCase,
  getCurrentUserUseCase,
  getUserStatsUseCase
)

const router = createAuthRouter(authController)

export { router as authRouter }
