import { Router } from 'express'
import type { ProjectController } from '../../controllers/ProjectController'
import { authenticate } from '../../middlewares/authenticate'
import { validate, validateParams, validateQuery } from '../../validators/common'
import {
  addMemberSchema,
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
  removeMemberQuerySchema,
  updateProjectSchema,
} from '../../validators/project.validator'

export const createProjectRouter = (projectController: ProjectController): Router => {
  const router = Router()

  // List all projects (user has access to)
  router.get('/', authenticate, validateQuery(listProjectsQuerySchema), (req, res, next) =>
    projectController.list(req, res, next)
  )

  // Get single project by ID
  router.get('/:id', authenticate, validateParams(projectIdParamSchema), (req, res, next) =>
    projectController.getById(req, res, next)
  )

  // Get project members
  router.get('/:id/members', authenticate, validateParams(projectIdParamSchema), (req, res, next) =>
    projectController.getMembers(req, res, next)
  )

  // Create new project
  router.post('/', authenticate, validate(createProjectSchema), (req, res, next) =>
    projectController.create(req, res, next)
  )

  // Update project
  router.patch(
    '/:id',
    authenticate,
    validateParams(projectIdParamSchema),
    validate(updateProjectSchema),
    (req, res, next) => projectController.update(req, res, next)
  )

  // Delete project (soft delete)
  router.delete('/:id', authenticate, validateParams(projectIdParamSchema), (req, res, next) =>
    projectController.delete(req, res, next)
  )

  // Add member to project
  router.post(
    '/:id/members',
    authenticate,
    validateParams(projectIdParamSchema),
    validate(addMemberSchema),
    (req, res, next) => projectController.addMember(req, res, next)
  )

  // Remove member from project
  router.delete(
    '/:id/members',
    authenticate,
    validateParams(projectIdParamSchema),
    validateQuery(removeMemberQuerySchema),
    (req, res, next) => projectController.removeMember(req, res, next)
  )

  return router
}
