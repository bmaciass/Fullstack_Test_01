export type LoginRequestDto = {
  email: string
  password: string
}

export type LoginResponseDto = {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    email: string
    username: string
    firstName?: string
    lastName?: string
  }
}

export type RefreshRequestDto = {
  refreshToken: string
}

export type RefreshResponseDto = {
  accessToken: string
}
