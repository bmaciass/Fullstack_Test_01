import { Router } from 'express'
import type { AuthController } from '../../controllers/AuthController'
import { authenticate } from '../../middlewares/authenticate'
import { validate } from '../../validators/common'
import { loginSchema, refreshSchema, registerSchema } from '../../validators/auth.validator'

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router()

  // Register
  router.post('/register', validate(registerSchema), (req, res, next) =>
    authController.register(req, res, next)
  )

  // Login
  router.post('/login', validate(loginSchema), (req, res, next) =>
    authController.login(req, res, next)
  )

  // Get current user
  router.get('/me', authenticate, (req, res, next) =>
    authController.me(req, res, next)
  )

  // Get user stats
  router.get('/stats', authenticate, (req, res, next) =>
    authController.getUserStats(req, res, next)
  )

  // Refresh token
  router.post('/refresh', validate(refreshSchema), (req, res, next) =>
    authController.refresh(req, res, next)
  )

  // Logout
  router.post('/logout', (req, res, next) => authController.logout(req, res, next))

  return router
}
