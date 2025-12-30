import type { NextFunction, Request, Response } from 'express'
import type { LoginRequestDto, RefreshRequestDto } from '../../application/dtos/auth/LoginDto'
import type { RegisterRequestDto } from '../../application/dtos/auth/RegisterDto'
import type { GetCurrentUserUseCase } from '../../application/use-cases/auth/GetCurrentUserUseCase'
import type { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase'
import type { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase'
import type { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase'
import type { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase'
import type { GetUserStatsUseCase } from '../../application/use-cases/user/GetUserStatsUseCase'
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest'

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUseCase: LogoutUseCase,
    private registerUseCase: RegisterUseCase,
    private getCurrentUserUseCase: GetCurrentUserUseCase,
    private getUserStatsUseCase: GetUserStatsUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: LoginRequestDto = req.body
      const result = await this.loginUseCase.execute(loginData)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshData: RefreshRequestDto = req.body
      const result = await this.refreshTokenUseCase.execute(refreshData)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await this.logoutUseCase.execute()
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registerData: RegisterRequestDto = req.body
      const result = await this.registerUseCase.execute(registerData)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const userId = req.user!.userId
      const result = await this.getCurrentUserUseCase.execute(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  getUserStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // biome-ignore lint/style/noNonNullAssertion: req.user is guaranteed to exist because authenticate middleware runs first
      const userId = req.user!.userId
      const result = await this.getUserStatsUseCase.execute(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
