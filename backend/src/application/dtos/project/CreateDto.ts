export interface CreateProjectRequestDto {
  name: string
  slug: string
  description?: string
}

export interface CreateProjectResponseDto {
  id: number
  name: string
  slug: string
  description: string | null
}