import type { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps async route handlers to catch errors and pass them to error middleware
 *
 * Usage:
 * router.get('/projects', asyncHandler(async (req, res) => {
 *   const projects = await projectService.findAll()
 *   res.json(projects)
 * }))
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}