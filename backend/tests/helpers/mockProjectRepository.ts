import { vi } from 'vitest'
import type { ProjectRepository } from '../../src/domain/repositories/ProjectRepository'

export type MockProjectRepository = {
  [K in keyof ProjectRepository]: ProjectRepository[K] extends (...args: any[]) => any
    ? ReturnType<typeof vi.fn>
    : ProjectRepository[K]
}

export const createMockProjectRepository = (): MockProjectRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  existsById: vi.fn(),
  existsByName: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  isMember: vi.fn(),
})
