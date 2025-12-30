export interface ListUsersRequestDto {
  limit?: number
  offset?: number
  sortBy?: 'email' | 'username' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface UserSummaryDto {
  email: string
  username: string
  firstName: string | undefined
  lastName: string | undefined
  fullName: string | undefined
}

export interface ListUsersResponseDto {
  users: UserSummaryDto[]
  total: number
}
