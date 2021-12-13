import { join } from 'path'
import { ExpressHandler, NextFunction, Request, Response } from '../types'

export const serveStatic = (directory: string) =>
  (async (req: Request, res: Response, next: NextFunction) => {
    if (req.route.path instanceof RegExp) return next('Static middleware does not accept "RegExp" paths.')

    const pathName = new URL(req.url, `http://${req.headers.host}`).pathname
    const filePath = join(directory, pathName.substring(req.route.path.length))

    try {
      await res.send.file(filePath)
    } catch (err: any) {
      return next(err)
    }
  }) as ExpressHandler
