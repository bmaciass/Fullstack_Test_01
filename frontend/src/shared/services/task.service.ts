import { API_ENDPOINTS } from '../constants'
import type {
  CreateTaskRequest,
  ListTasksQuery,
  PaginatedTasks,
  Task,
  UpdateTaskRequest,
  UserSummary,
} from '../types'
import { apiClient } from './api.client'

export const taskService = {
  async list(query?: ListTasksQuery): Promise<PaginatedTasks> {
    const response = await apiClient.get<PaginatedTasks>(API_ENDPOINTS.TASKS.LIST, {
      params: query,
    })
    return response.data
  },

  async getById(id: number): Promise<Task> {
    const response = await apiClient.get<Task>(API_ENDPOINTS.TASKS.GET(id))
    return response.data
  },

  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await apiClient.post<Task>(API_ENDPOINTS.TASKS.CREATE, data)
    return response.data
  },

  async update(id: number, data: UpdateTaskRequest): Promise<Task> {
    const response = await apiClient.patch<Task>(API_ENDPOINTS.TASKS.UPDATE(id), {...data, description: data.description ?? undefined })
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TASKS.DELETE(id))
  },

  async getAssignedUsers(taskId: number): Promise<UserSummary[]> {
    const response = await apiClient.get<{ users: UserSummary[] }>(
      API_ENDPOINTS.TASKS.GET_ASSIGNED_USERS(taskId)
    )
    return response.data.users
  },

  async assignUser(taskId: number, email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.TASKS.ASSIGN_USER(taskId), { email })
  },

  async unassignUser(taskId: number, email: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TASKS.UNASSIGN_USER(taskId, email))
  },
}
