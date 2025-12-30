import type { PrismaClient } from '../../../generated/prisma/client'
import type {
  PersonOrderByWithRelationInput,
  PersonWhereInput,
} from '../../../generated/prisma/models'
import { Person } from '../../domain/entities/Person'
import type {
  PersonFilter,
  PersonFilterResult,
  PersonRepository,
} from '../../domain/repositories/PersonRepository'

export class PrismaPersonRepository implements PersonRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Person | null> {
    const person = await this.prisma.person.findUnique({
      where: { id },
    })
    if (!person) return null

    return Person.reconstitute(person)
  }

  async findAll(filter?: PersonFilter): Promise<PersonFilterResult> {
    const { limit, offset, sortBy, sortOrder, firstName, lastName, includeDeleted, onlyDeleted } =
      filter ?? {}

    let orderBy: PersonOrderByWithRelationInput | undefined
    if (sortBy) {
      orderBy = {}
      orderBy[sortBy] = sortOrder ?? 'asc'
    }

    const where: PersonWhereInput = {}

    if (firstName !== undefined) {
      where.firstName = { contains: firstName }
    }

    if (lastName !== undefined) {
      where.lastName = { contains: lastName }
    }

    if (onlyDeleted) {
      where.deletedAt = { not: null }
    } else if (!includeDeleted) {
      where.deletedAt = null
    }

    const results = await this.prisma.person.findMany({
      orderBy,
      skip: offset,
      take: limit,
      where,
    })

    const persons = results.map(person => Person.reconstitute(person))

    return {
      persons,
      total: persons.length,
    }
  }

  async save(person: Person): Promise<Person> {
    const record = await this.prisma.person.upsert({
      where: { id: person.id },
      update: {
        firstName: person.firstName,
        lastName: person.lastName,
      },
      create: {
        firstName: person.firstName,
        lastName: person.lastName,
      },
    })

    return Person.reconstitute(record)
  }

  async delete(id: number): Promise<void> {
    const person = await this.prisma.person.findUnique({ where: { id } })
    if (!person) {
      throw new Error('Person not found')
    }

    await this.prisma.person.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async existsById(id: number): Promise<boolean> {
    const count = await this.prisma.person.count({
      where: { id },
    })
    return count > 0
  }
}
