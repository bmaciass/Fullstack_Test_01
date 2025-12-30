import { isBoolean } from 'lodash-es'
import type { PrismaClient } from '../../../generated/prisma/client'
import type { ProjectOrderByWithRelationInput } from '../../../generated/prisma/models'
import { Project } from '../../domain/entities/Project'
import type {
  ProjectFilter,
  ProjectFilterResult,
  ProjectRepository,
} from '../../domain/repositories/ProjectRepository'

export class PrismaProjectRepository implements ProjectRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: { select: { id: true } },
        tasks: { select: { id: true } },
      },
    })
    if (!project) return null

    const { members, tasks, ...rest } = project

    return Project.reconstitute({
      ...rest,
      memberIds: members.map(m => m.id),
      taskIds: tasks.map(t => t.id),
    })
  }
  async findAll(_filter?: ProjectFilter): Promise<ProjectFilterResult> {
    const { limit, offset, sortBy, sortOrder, memberId, creatorId, includeDeleted } = _filter ?? {}
    let orderBy: ProjectOrderByWithRelationInput | undefined
    if (sortBy) {
      orderBy = {}
      orderBy[sortBy] = sortOrder ?? 'asc'
    }
    const results = await this.prisma.project.findMany({
      orderBy,
      skip: offset,
      take: limit,
      include: {
        members: { select: { id: true } },
        tasks: { select: { id: true } },
      },
      where: {
        members: { some: { id: memberId } },
        createdById: creatorId,
        deletedAt: isBoolean(includeDeleted) ? (includeDeleted ? { not: null } : null) : undefined,
      },
    })
    return {
      total: results.length,
      projects: results.map(({ members, tasks, ...rest }) => {
        return Project.reconstitute({
          ...rest,
          memberIds: members.map(m => m.id),
          taskIds: tasks.map(t => t.id),
        })
      }),
    }
  }

  async save(project: Project): Promise<Project> {
    const record = await this.prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        slug: project.slug,
        description: project.description,
        deletedAt: project.deletedAt,
        updatedAt: project.updatedAt,
        members: {
          set: project.memberIds.map(id => ({ id })),
        },
      },
      create: {
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdById: project.createdById,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        members: {
          connect: project.memberIds.map(id => ({ id })),
        },
      },
      include: {
        members: { select: { id: true } },
        tasks: { select: { id: true } },
      },
    })

    const { members, tasks, ...rest } = record

    return Project.reconstitute({
      ...rest,
      memberIds: members.map((m: { id: number }) => m.id),
      taskIds: tasks.map((t: { id: number }) => t.id),
    })
  }

  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: { id },
    })
    return count > 0
  }
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: {
        name,
        id: excludeId ? { not: excludeId } : undefined,
      },
    })
    return count > 0
  }
  async addMember(projectId: number, userId: number): Promise<void> {
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
    })
  }
  async removeMember(projectId: number, userId: number): Promise<void> {
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
    })
  }
  async isMember(projectId: number, userId: number): Promise<boolean> {
    const count = await this.prisma.project.count({
      where: {
        id: projectId,
        members: {
          some: { id: userId },
        },
      },
    })
    return count > 0
  }
}
