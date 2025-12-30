import { API_ENDPOINTS, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants'
import type { AuthResponse, LoginRequest, RegisterRequest, User, UserStats } from '../types'
import { apiClient } from './api.client'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data)
    const { accessToken, refreshToken } = response.data
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data)
    const { accessToken, refreshToken } = response.data
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ accessToken: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    })
    const { accessToken } = response.data
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME)
    return response.data
  },

  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>(API_ENDPOINTS.AUTH.STATS)
    return response.data
  },

  getAccessToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  },
}
