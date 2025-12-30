import type { Person } from '../entities/Person'

export type PersonFilter = {
  // Pagination
  offset?: number
  limit?: number

  // Filtering
  firstName?: string
  lastName?: string
  includeDeleted?: boolean
  onlyDeleted?: boolean

  // Sorting
  sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type PersonFilterResult = {
  persons: Person[]
  total: number
}

export interface PersonRepository {
  // Basic CRUD
  findById(id: number): Promise<Person | null>
  findAll(filter?: PersonFilter): Promise<PersonFilterResult>
  save(person: Person): Promise<Person>
  delete(id: number): Promise<void>

  // Validation helpers
  existsById(id: number): Promise<boolean>
}