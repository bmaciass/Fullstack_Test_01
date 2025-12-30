import { vi } from 'vitest'
import type { UserRepository } from '../../src/domain/repositories/UserRepository'

export type MockUserRepository = {
  [K in keyof UserRepository]: ReturnType<typeof vi.fn>
}

export const createMockUserRepository = (): MockUserRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  findByEmail: vi.fn(),
  findByUsername: vi.fn(),
  existsById: vi.fn(),
  existsByEmail: vi.fn(),
  existsByUsername: vi.fn(),
})
