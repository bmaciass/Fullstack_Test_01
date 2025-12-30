export interface GetProjectByIdResponseDto {
  id: number
  name: string
  slug: string
  description: string | null
  memberCount: number
  createdAt: Date
  updatedAt: Date
}
