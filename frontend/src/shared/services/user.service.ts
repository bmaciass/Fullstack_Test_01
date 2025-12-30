import { API_ENDPOINTS } from '../constants'
import type { ListUsersQuery, PaginatedUsers } from '../types'
import { apiClient } from './api.client'

export const userService = {
  async list(query?: ListUsersQuery): Promise<PaginatedUsers> {
    const response = await apiClient.get<PaginatedUsers>(API_ENDPOINTS.USERS.LIST, {
      params: query,
    })
    return response.data
  },
}
