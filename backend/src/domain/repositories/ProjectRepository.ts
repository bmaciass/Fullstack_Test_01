import type { Project } from '../entities/Project'

export type ProjectFilter = {
  // Pagination
  offset?: number
  limit?: number

  // Filtering
  creatorId?: number
  memberId?: number
  includeDeleted?: boolean

  // Sorting
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export type ProjectFilterResult = {
  projects: Project[]
  total: number
}

export interface ProjectRepository {
  // Basic CRUD
  findById(id: number): Promise<Project | null>
  findAll(filter?: ProjectFilter): Promise<ProjectFilterResult>
  save(project: Project): Promise<Project>

  // Validation helpers
  existsById(id: number): Promise<boolean>
  existsByName(name: string, excludeId?: number): Promise<boolean>

  // Member management
  addMember(projectId: number, userId: number): Promise<void>
  removeMember(projectId: number, userId: number): Promise<void>
  isMember(projectId: number, userId: number): Promise<boolean>
}
