import { initContract } from '@ts-rest/core'
import { authContract } from './auth.contract'
import { projectContract } from './project.contract'
import { taskContract } from './task.contract'
import { userContract } from './user.contract'

const c = initContract()

export const apiContract = c.router({
  auth: authContract,
  users: userContract,
  projects: projectContract,
  tasks: taskContract,
})
