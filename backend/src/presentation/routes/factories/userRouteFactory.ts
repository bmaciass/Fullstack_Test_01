import { Router } from 'express'
import type { UserController } from '../../controllers/UserController'
import { authenticate } from '../../middlewares/authenticate'
import { validateQuery } from '../../validators/common'
import { listUsersQuerySchema } from '../../validators/user.validator'

export const createUserRouter = (userController: UserController): Router => {
  const router = Router()

  // List all users
  router.get('/', authenticate, validateQuery(listUsersQuerySchema), (req, res, next) =>
    userController.list(req, res, next)
  )

  return router
}
