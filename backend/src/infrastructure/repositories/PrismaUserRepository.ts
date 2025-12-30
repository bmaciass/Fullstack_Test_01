import type { PrismaClient } from '../../../generated/prisma/client'
import type { UserOrderByWithRelationInput, UserWhereInput } from '../../../generated/prisma/models'
import { Person } from '../../domain/entities/Person'
import { User } from '../../domain/entities/User'
import type {
  UserFilter,
  UserFilterResult,
  UserRepository,
} from '../../domain/repositories/UserRepository'

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { person: true },
    })
    if (!user) return null

    return User.reconstitute({
      ...user,
      person: user.person ? Person.reconstitute(user.person) : undefined,
    })
  }

  async findAll(filter?: UserFilter): Promise<UserFilterResult> {
    const {
      limit,
      offset,
      sortBy,
      sortOrder,
      personId,
      email,
      username,
      includeDeleted,
      onlyDeleted,
    } = filter ?? {}

    let orderBy: UserOrderByWithRelationInput | undefined
    if (sortBy) {
      orderBy = {}
      orderBy[sortBy] = sortOrder ?? 'asc'
    }

    const where: UserWhereInput = {}

    if (personId !== undefined) {
      where.personId = personId
    }

    if (email !== undefined) {
      where.email = email
    }

    if (username !== undefined) {
      where.username = username
    }

    if (onlyDeleted) {
      where.deletedAt = { not: null }
    } else if (!includeDeleted) {
      where.deletedAt = null
    }

    const results = await this.prisma.user.findMany({
      orderBy,
      skip: offset,
      take: limit,
      where,
      include: { person: true },
    })

    const users = results.map(user =>
      User.reconstitute({
        ...user,
        person: user.person ? Person.reconstitute(user.person) : undefined,
      })
    )

    return {
      users,
      total: users.length,
    }
  }

  async save(user: User): Promise<User> {
    const record = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        username: user.username,
        password: user.password,
      },
      create: {
        email: user.email,
        username: user.username,
        password: user.password,
        personId: user.personId,
      },
      include: { person: true },
    })

    return User.reconstitute({
      ...record,
      person: record.person ? Person.reconstitute(record.person) : undefined,
    })
  }

  async delete(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { person: true },
    })
    if (!user) return null

    return User.reconstitute({
      ...user,
      person: user.person ? Person.reconstitute(user.person) : undefined,
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { person: true },
    })
    if (!user) return null

    return User.reconstitute({
      ...user,
      person: user.person ? Person.reconstitute(user.person) : undefined,
    })
  }

  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id },
    })
    return count > 0
  }

  async existsByEmail(email: string, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email,
        id: excludeId ? { not: excludeId } : undefined,
      },
    })
    return count > 0
  }

  async existsByUsername(username: string, excludeId?: number): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        username,
        id: excludeId ? { not: excludeId } : undefined,
      },
    })
    return count > 0
  }
}
