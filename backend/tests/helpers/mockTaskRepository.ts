import type { TaskRepository } from '../../src/domain/repositories/TaskRepository'
import { vi } from 'vitest'

export type MockTaskRepository = {
  [K in keyof TaskRepository]: TaskRepository[K] extends (...args: any[]) => any
    ? ReturnType<typeof vi.fn>
    : TaskRepository[K]
}

export const createMockTaskRepository = (): MockTaskRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
  existsById: vi.fn(),
  existsByName: vi.fn(),
  assignUser: vi.fn(),
  unassignUser: vi.fn(),
  isAssignedToUser: vi.fn(),
})
