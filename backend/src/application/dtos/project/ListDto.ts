export interface ListProjectsRequestDto {
  limit?: number
  offset?: number
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  includeDeleted?: boolean
}

export interface ProjectSummaryDto {
  id: number
  name: string
  slug: string
  description: string | null
  memberCount: number
  taskCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ListProjectsResponseDto {
  projects: ProjectSummaryDto[]
  total: number
}