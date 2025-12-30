import type { NextFunction, Response } from 'express'
import type { ListProjectsRequestDto } from '../../application/dtos/project/ListDto'
import type { AddMemberUseCase } from '../../application/use-cases/project/AddMemberUseCase'
import type { CreateProjectUseCase } from '../../application/use-cases/project/CreateUseCase'
import type { DeleteProjectUseCase } from '../../application/use-cases/project/DeleteUseCase'
import type { GetProjectByIdUseCase } from '../../application/use-cases/project/GetByIdUseCase'
import type { GetProjectMembersUseCase } from '../../application/use-cases/project/GetProjectMembersUseCase'
import type { ListProjectsUseCase } from '../../application/use-cases/project/ListUseCase'
import type { RemoveMemberUseCase } from '../../application/use-cases/project/RemoveMemberUseCase'
import type { UpdateProjectUseCase } from '../../application/use-cases/project/UpdateUseCase'
import { BadRequestError } from '../../domain/errors/BadRequestError'
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest'
import type {
  AddMemberRequest,
  CreateProjectRequest,
  ListProjectsQuery,
  ProjectIdParam,
  RemoveMemberQuery,
  UpdateProjectRequest,
} from '../validators/project.validator'

type ProjectUseCases = {
  create: CreateProjectUseCase
  update: UpdateProjectUseCase
  delete: DeleteProjectUseCase
  list: ListProjectsUseCase
  getById: GetProjectByIdUseCase
  addMember: AddMemberUseCase
  removeMember: RemoveMemberUseCase
  getMembers: GetProjectMembersUseCase
}

export class ProjectController {
  constructor(private useCases: ProjectUseCases) {}

  async create(req: AuthenticatedRequest<CreateProjectRequest>, res: Response, next: NextFunction) {
    try {
      const createProjectData = req.body
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const userId = req.user!.userId
      const result = await this.useCases.create.execute(createProjectData, userId)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async update(
    req: AuthenticatedRequest<UpdateProjectRequest, ProjectIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projectId = Number(req.params.id)
      if (Number.isNaN(projectId)) {
        throw new BadRequestError('Invalid project ID format')
      }
      const updateData = req.body
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.update.execute(projectId, updateData, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async delete(
    req: AuthenticatedRequest<unknown, ProjectIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projectId = Number(req.params.id)
      if (Number.isNaN(projectId)) {
        throw new BadRequestError('Invalid project ID format')
      }
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.delete.execute(projectId, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async list(
    req: AuthenticatedRequest<unknown, unknown, ListProjectsQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query: ListProjectsRequestDto = {}

      // Parse numeric query params
      if (req.query.limit !== undefined) {
        const limit = Number(query.limit)
        if (Number.isNaN(limit)) {
          throw new BadRequestError('Invalid limit format')
        }
        query.limit = limit
      }
      if (req.query.offset !== undefined) {
        const offset = Number(query.offset)
        if (Number.isNaN(offset)) {
          throw new BadRequestError('Invalid offset format')
        }
        query.offset = offset
      }

      if (req.query.includeDeleted) {
        query.includeDeleted = req.query.includeDeleted === 'true'
      }

      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.list.execute(query, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getById(
    req: AuthenticatedRequest<unknown, ProjectIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projectId = Number(req.params.id)
      if (Number.isNaN(projectId)) {
        throw new BadRequestError('Invalid project ID format')
      }
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.getById.execute(projectId, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getMembers(
    req: AuthenticatedRequest<unknown, ProjectIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projectId = Number(req.params.id)
      if (Number.isNaN(projectId)) {
        throw new BadRequestError('Invalid project ID format')
      }
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.getMembers.execute(projectId, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async addMember(
    req: AuthenticatedRequest<AddMemberRequest, ProjectIdParam>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projectId = Number(req.params.id)
      if (Number.isNaN(projectId)) {
        throw new BadRequestError('Invalid project ID format')
      }
      const addMemberData = req.body
      const result = await this.useCases.addMember.execute(
        projectId,
        addMemberData,
        // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
        req.user!.userId
      )
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  async removeMember(
    req: AuthenticatedRequest<unknown, ProjectIdParam, RemoveMemberQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projectId = Number(req.params.id)
      if (Number.isNaN(projectId)) {
        throw new BadRequestError('Invalid project ID format')
      }
      const { email } = req.query
      if (!email) {
        throw new BadRequestError('Email is required')
      }
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const result = await this.useCases.removeMember.execute(projectId, { email }, req.user!.userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
