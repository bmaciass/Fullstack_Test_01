import express, { Router } from 'express'
import { GetCurrentUserUseCase } from '../../src/application/use-cases/auth/GetCurrentUserUseCase'
import { LoginUseCase } from '../../src/application/use-cases/auth/LoginUseCase'
import { LogoutUseCase } from '../../src/application/use-cases/auth/LogoutUseCase'
import { RefreshTokenUseCase } from '../../src/application/use-cases/auth/RefreshTokenUseCase'
import { RegisterUseCase } from '../../src/application/use-cases/auth/RegisterUseCase'
import type { PersonRepository } from '../../src/domain/repositories/PersonRepository'
import type { UserRepository } from '../../src/domain/repositories/UserRepository'
import { JwtService } from '../../src/infrastructure/services/JwtService'
import { PasswordHashService } from '../../src/infrastructure/services/PasswordHashService'
import { AuthController } from '../../src/presentation/controllers/AuthController'
import { authenticate } from '../../src/presentation/middlewares/authenticate'
import { errorHandler } from '../../src/presentation/middlewares/errorHandler'
import { loginSchema, refreshSchema, registerSchema } from '../../src/presentation/validators/auth.validator'
import { validate } from '../../src/presentation/validators/common'

export const createTestApp = (userRepository: UserRepository, personRepository?: PersonRepository) => {
  const app = express()

  // Middleware
  app.use(express.json())

  // Create router with dependencies
  const router = Router()
  const passwordHashService = new PasswordHashService()
  const jwtService = new JwtService()

  const loginUseCase = new LoginUseCase(userRepository, passwordHashService, jwtService)
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, jwtService)
  const logoutUseCase = new LogoutUseCase()
  const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository)

  // Only instantiate RegisterUseCase if personRepository is provided
  const registerUseCase = personRepository
    ? new RegisterUseCase(userRepository, personRepository, passwordHashService, jwtService)
    : undefined

  const authController = new AuthController(
    loginUseCase,
    refreshTokenUseCase,
    logoutUseCase,
    registerUseCase as any,
    getCurrentUserUseCase
  )

  // Define routes
  if (registerUseCase) {
    router.post('/register', validate(registerSchema), authController.register)
  }
  router.post('/login', validate(loginSchema), authController.login)
  router.get('/me', authenticate, authController.me)
  router.post('/refresh', validate(refreshSchema), authController.refresh)
  router.post('/logout', authController.logout)

  // Mount router
  app.use('/auth', router)

  // Error handler
  app.use(errorHandler)

  return app
}
