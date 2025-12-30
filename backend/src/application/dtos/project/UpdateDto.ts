export interface UpdateProjectRequestDto {
  name?: string
  slug?: string
  description?: string
}

export interface UpdateProjectResponseDto {
  id: number
  name: string
  slug: string
  description: string | null
}