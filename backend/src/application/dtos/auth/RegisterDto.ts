export interface RegisterRequestDto {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
}

export interface RegisterResponseDto {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    username: string
    firstName: string | undefined
    lastName: string | undefined
  }
}
