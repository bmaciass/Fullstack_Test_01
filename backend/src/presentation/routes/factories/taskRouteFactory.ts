import { Router } from 'express'
import type { TaskController } from '../../controllers/TaskController'
import { authenticate } from '../../middlewares/authenticate'
import { validate, validateParams, validateQuery } from '../../validators/common'
import {
  assignUserToTaskSchema,
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  unassignUserParamSchema,
  updateTaskSchema,
} from '../../validators/task.validator'

export const createTaskRouter = (taskController: TaskController): Router => {
  const router = Router()

  // List all tasks (with optional filters)
  router.get('/', authenticate, validateQuery(listTasksQuerySchema), (req, res, next) =>
    taskController.list(req, res, next)
  )

  // Get single task by ID
  router.get('/:id', authenticate, validateParams(taskIdParamSchema), (req, res, next) =>
    taskController.getById(req, res, next)
  )

  // Create new task
  router.post('/', authenticate, validate(createTaskSchema), (req, res, next) =>
    taskController.create(req, res, next)
  )

  // Update task
  router.patch(
    '/:id',
    authenticate,
    validateParams(taskIdParamSchema),
    validate(updateTaskSchema),
    (req, res, next) => taskController.update(req, res, next)
  )

  // Delete task (soft delete)
  router.delete('/:id', authenticate, validateParams(taskIdParamSchema), (req, res, next) =>
    taskController.delete(req, res, next)
  )

  // Get assigned users for a task
  router.get('/:id/assigned-users', authenticate, validateParams(taskIdParamSchema), (req, res, next) =>
    taskController.getAssignedUsers(req, res, next)
  )

  // Assign user to task
  router.post(
    '/:id/assign',
    authenticate,
    validateParams(taskIdParamSchema),
    validate(assignUserToTaskSchema),
    (req, res, next) => taskController.assignUser(req, res, next)
  )

  // Unassign user from task
  router.delete(
    '/:id/unassign/:email',
    authenticate,
    validateParams(taskIdParamSchema),
    validateParams(unassignUserParamSchema),
    (req, res, next) => taskController.unassignUser(req, res, next)
  )

  return router
}
