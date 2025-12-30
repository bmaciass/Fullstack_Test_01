import { vi } from 'vitest'
import type { PersonRepository } from '../../src/domain/repositories/PersonRepository'

export type MockPersonRepository = {
  [K in keyof PersonRepository]: ReturnType<typeof vi.fn>
}

export const createMockPersonRepository = (): MockPersonRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  existsById: vi.fn(),
})
