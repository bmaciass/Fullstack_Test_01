import type { PrismaClient } from '../../../generated/prisma/client'
import type { TaskOrderByWithRelationInput, TaskWhereInput } from '../../../generated/prisma/models'
import { Task } from '../../domain/entities/Task'
import type {
  TaskFilter,
  TaskFilterResult,
  TaskRepository,
} from '../../domain/repositories/TaskRepository'

export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedUsers: { select: { id: true } }
      },
    })
    if (!task) return null

    const { assignedUsers, ...rest } = task

    return Task.reconstitute({
      ...rest,
      assignedUserIds: assignedUsers.map((u: { id: number }) => u.id),
      deletedAt: task.deletedAt ?? null,
    })
  }

  async findAll(filter?: TaskFilter): Promise<TaskFilterResult> {
    const {
      limit,
      offset,
      sortBy,
      sortOrder,
      projectId,
      status,
      priority,
      assignedUserId,
      includeDeleted,
      onlyDeleted,
    } = filter ?? {}

    let orderBy: TaskOrderByWithRelationInput | undefined
    if (sortBy) {
      orderBy = {}
      orderBy[sortBy] = sortOrder ?? 'asc'
    }

    const where: TaskWhereInput = {}

    if (projectId !== undefined) {
      where.projectId = projectId
    }

    if (status !== undefined) {
      where.status = status
    }

    if (priority !== undefined) {
      where.priority = priority
    }

    if (assignedUserId !== undefined) {
      where.assignedUsers = { some: { id: assignedUserId } }
    }

    if (onlyDeleted) {
      where.deletedAt = { not: null }
    } else if (!includeDeleted) {
      where.deletedAt = null
    }

    const results = await this.prisma.task.findMany({
      orderBy,
      skip: offset,
      take: limit,
      where,
      include: {
        assignedUsers: { select: { id: true } }
      },
    })

    const tasks = results.map(({ assignedUsers, ...rest }) => {
      return Task.reconstitute({
        ...rest,
        assignedUserIds: assignedUsers.map((u: { id: number }) => u.id),
        deletedAt: rest.deletedAt ?? null,
      })
    })

    return {
      tasks,
      total: tasks.length,
    }
  }

  async save(task: Task): Promise<Task> {
    const record = await this.prisma.task.upsert({
      where: { id: task.id },
      update: {
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deletedAt: task.deletedAt,
        updatedAt: task.updatedAt,
        assignedUsers: {
          set: task.assignedUserIds.map(id => ({ id })),
        },
      },
      create: {
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        assignedUsers: {
          connect: task.assignedUserIds.map(id => ({ id })),
        },
      },
      include: {
        assignedUsers: { select: { id: true } }
      },
    })

    const { assignedUsers, ...rest } = record

    return Task.reconstitute({
      ...rest,
      assignedUserIds: assignedUsers.map((u: { id: number }) => u.id),
      deletedAt: record.deletedAt ?? null,
    })
  }

  async delete(id: number): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) {
      throw new Error('Task not found')
    }

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.task.count({
      where: { id },
    })
    return count > 0
  }

  async existsByName(name: string, projectId: number, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.task.count({
      where: {
        name,
        projectId,
        id: excludeId ? { not: excludeId } : undefined,
      },
    })
    return count > 0
  }

  async assignUser(taskId: number, userId: number): Promise<void> {
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          connect: { id: userId },
        },
      },
    })
  }

  async unassignUser(taskId: number, userId: number): Promise<void> {
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          disconnect: { id: userId },
        },
      },
    })
  }

  async isAssignedToUser(taskId: number, userId: number): Promise<boolean> {
    const count = await this.prisma.task.count({
      where: {
        id: taskId,
        assignedUsers: {
          some: { id: userId },
        },
      },
    })
    return count > 0
  }
}
