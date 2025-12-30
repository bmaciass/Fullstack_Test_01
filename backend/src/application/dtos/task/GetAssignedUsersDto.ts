export interface GetTaskAssignedUsersResponseDto {
  users: Array<{
    email: string
    username: string
    firstName: string
    lastName: string
    fullName: string
  }>
}
