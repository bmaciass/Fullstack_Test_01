import type { NextFunction, Response } from 'express'
import type { AssignUserToTaskUseCase } from '../../application/use-cases/task/AssignUserToTaskUseCase'
import type { CreateTaskUseCase } from '../../application/use-cases/task/CreateTaskUseCase'
import type { DeleteTaskUseCase } from '../../application/use-cases/task/DeleteTaskUseCase'
import type { GetTaskAssignedUsersUseCase } from '../../application/use-cases/task/GetTaskAssignedUsersUseCase'
import type { GetTaskByIdUseCase } from '../../application/use-cases/task/GetTaskByIdUseCase'
import type { ListTasksUseCase } from '../../application/use-cases/task/ListTasksUseCase'
import type { UnassignUserFromTaskUseCase } from '../../application/use-cases/task/UnassignUserFromTaskUseCase'
import type { UpdateTaskUseCase } from '../../application/use-cases/task/UpdateTaskUseCase'
import { BadRequestError } from '../../domain/errors/BadRequestError'
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest'
import type {
  AssignUserToTaskRequest,
  CreateTaskRequest,
  ListTasksQuery,
  TaskIdParam,
  UnassignUserParam,
  UpdateTaskRequest,
} from '../validators/task.validator'

type TaskUseCases = {
  create: CreateTaskUseCase
  update: UpdateTaskUseCase
  delete: DeleteTaskUseCase
  list: ListTasksUseCase
  getById: GetTaskByIdUseCase
  assignUser: AssignUserToTaskUseCase
  unassignUser: UnassignUserFromTaskUseCase
  getAssignedUsers: GetTaskAssignedUsersUseCase
}

export class TaskController {
  constructor(private readonly useCases: TaskUseCases) {}

  async create(req: AuthenticatedRequest<CreateTaskRequest>, res: Response, next: NextFunction) {
    try {
      const createTaskData = req.body
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.create.execute(createTaskData, req.user!.userId)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async update(
    req: AuthenticatedRequest<UpdateTaskRequest, TaskIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const taskId = Number(req.params.id)
      if (Number.isNaN(taskId)) {
        throw new BadRequestError('Invalid task ID format')
      }
      const updateTaskData = req.body
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.update.execute(taskId, updateTaskData, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async delete(req: AuthenticatedRequest<unknown, TaskIdParam>, res: Response, next: NextFunction) {
    try {
      const taskId = Number(req.params.id)
      if (Number.isNaN(taskId)) {
        throw new BadRequestError('Invalid task ID format')
      }
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.delete.execute(taskId, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async list(
    req: AuthenticatedRequest<unknown, unknown, ListTasksQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const queryParams = { ...req.query }

      // Parse numeric query params
      if (queryParams.projectId !== undefined) {
        const projectId = Number(queryParams.projectId)
        if (Number.isNaN(projectId)) {
          throw new BadRequestError('Invalid project ID format')
        }
        queryParams.projectId = projectId as any
      }
      if (queryParams.assignedUserId !== undefined) {
        const assignedUserId = Number(queryParams.assignedUserId)
        if (Number.isNaN(assignedUserId)) {
          throw new BadRequestError('Invalid assigned user ID format')
        }
        queryParams.assignedUserId = assignedUserId as any
      }
      if (queryParams.limit !== undefined) {
        const limit = Number(queryParams.limit)
        if (Number.isNaN(limit)) {
          throw new BadRequestError('Invalid limit format')
        }
        queryParams.limit = limit as any
      }
      if (queryParams.offset !== undefined) {
        const offset = Number(queryParams.offset)
        if (Number.isNaN(offset)) {
          throw new BadRequestError('Invalid offset format')
        }
        queryParams.offset = offset as any
      }

      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.list.execute(queryParams as any, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getById(
    req: AuthenticatedRequest<unknown, TaskIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const taskId = Number(req.params.id)
      if (Number.isNaN(taskId)) {
        throw new BadRequestError('Invalid task ID format')
      }
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.getById.execute(taskId, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async assignUser(
    req: AuthenticatedRequest<AssignUserToTaskRequest, TaskIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const taskId = Number(req.params.id)
      if (Number.isNaN(taskId)) {
        throw new BadRequestError('Invalid task ID format')
      }
      const assignUserData = req.body
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.assignUser.execute(taskId, assignUserData, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async unassignUser(
    req: AuthenticatedRequest<unknown, TaskIdParam & UnassignUserParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const taskId = Number(req.params.id)
      if (Number.isNaN(taskId)) {
        throw new BadRequestError('Invalid task ID format')
      }
      const userEmail = req.params.email
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.unassignUser.execute(taskId, userEmail, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getAssignedUsers(
    req: AuthenticatedRequest<unknown, TaskIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const taskId = Number(req.params.id)
      if (Number.isNaN(taskId)) {
        throw new BadRequestError('Invalid task ID format')
      }
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.getAssignedUsers.execute(taskId, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
