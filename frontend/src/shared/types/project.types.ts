export interface Project {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
  memberCount: number
  taskCount: number
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
}

export interface ListProjectsQuery {
  page?: number
  limit?: number
  search?: string
  createdBy?: number
  includeDeleted?: boolean
}

export interface PaginatedProjects {
  projects: Project[]
  total: number
}

export interface AddMemberRequest {
  email: string
}

export interface AddMemberResponse {
  id: number
  message: string
}
