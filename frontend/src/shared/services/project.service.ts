import { API_ENDPOINTS } from '../constants'
import type {
  AddMemberRequest,
  AddMemberResponse,
  CreateProjectRequest,
  ListProjectsQuery,
  PaginatedProjects,
  Project,
  UpdateProjectRequest,
  UserSummary,
} from '../types'
import { apiClient } from './api.client'

export const projectService = {
  async list(query?: ListProjectsQuery): Promise<PaginatedProjects> {
    const response = await apiClient.get<PaginatedProjects>(API_ENDPOINTS.PROJECTS.LIST, {
      params: query,
    })
    return response.data
  },

  async getById(id: number): Promise<Project> {
    const response = await apiClient.get<Project>(API_ENDPOINTS.PROJECTS.GET(id))
    return response.data
  },

  async getMembers(id: number): Promise<UserSummary[]> {
    const response = await apiClient.get<UserSummary[]>(API_ENDPOINTS.PROJECTS.GET_MEMBERS(id))
    return response.data
  },

  async create(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<Project>(API_ENDPOINTS.PROJECTS.CREATE, data)
    return response.data
  },

  async update(id: number, data: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.patch<Project>(API_ENDPOINTS.PROJECTS.UPDATE(id), data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE(id))
  },

  async addMember(projectId: number, data: AddMemberRequest): Promise<AddMemberResponse> {
    const response = await apiClient.post<AddMemberResponse>(
      API_ENDPOINTS.PROJECTS.ADD_MEMBER(projectId),
      data
    )
    return response.data
  },

  async removeMember(projectId: number, email: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.REMOVE_MEMBER(projectId), {
      params: { email },
    })
  },
}
