import type { User } from '../entities/User'

export type UserFilter = {
  // Pagination
  offset?: number
  limit?: number

  // Filtering
  personId?: number
  email?: string
  username?: string
  includeDeleted?: boolean
  onlyDeleted?: boolean

  // Sorting
  sortBy?: 'username' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type UserFilterResult = {
  users: User[]
  total: number
}

export interface UserRepository {
  // Basic CRUD
  findById(id: number): Promise<User | null>
  findAll(filter?: UserFilter): Promise<UserFilterResult>
  save(user: User): Promise<User>
  delete(id: number): Promise<void>

  // Auth-specific queries
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>

  // Validation helpers
  existsById(id: number): Promise<boolean>
  existsByEmail(email: string, excludeId?: number): Promise<boolean>
  existsByUsername(username: string, excludeId?: number): Promise<boolean>
}