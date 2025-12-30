import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name cannot exceed 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name cannot exceed 100 characters'),
})
